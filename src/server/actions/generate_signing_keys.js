/**
 * Shambhala.
 *
 * Generate signing keys action.
 *
 * @module server-actions
 * @license Apache-2.0
 */




import {
    encrypt,
    genKey,
    salt32,
} from "@stellar-fox/cryptops"
import { Keypair } from "stellar-sdk"
import {
    codec,
    func,
    string,
} from "@xcmats/js-toolbox"
import { sql } from "../../lib/utils.backend"
import generateSigningKeysSQL from "./generate_signing_keys.sql"
import { tables } from "../../config/server.json"




/**
 * Signing keys generation.
 *
 * @function generateSigningKeys
 * @param {Object} db Database connection.
 * @param {Function} logger
 * @returns {Function} express.js action.
 */
export default function generateSigningKeys (db, logger) {

    return async (req, res, next) => {

        let

            // base64 decode S_KEY
            S_KEY = codec.b64dec(req.body.S_KEY),

            // receive G_PUBLIC, C_UUID
            { G_PUBLIC, C_UUID, AUTH_TOKEN } = req.body




        logger.info("  ->   G_PUBLIC:", string.shorten(G_PUBLIC, 11))
        logger.info("  ->     C_UUID:", string.shorten(C_UUID, 7))
        logger.info("  ->      S_KEY:", string.shorten(req.body.S_KEY, 17))
        logger.info("  -> AUTH_TOKEN:", AUTH_TOKEN ? "ok" : "none")




        let
            // generate S_SECRET
            S_SECRET = Keypair.random().secret(),

            // extract S_PUBLIC from generated S_SECRET
            S_PUBLIC = Keypair.fromSecret(S_SECRET).publicKey(),

            // generate PEPPER
            PEPPER = salt32(),

            // encrypt PEPPER and S_SECRET
            ENC_SKP = func.pipe(
                S_KEY,
                codec.concatBytes(
                    PEPPER,
                    codec.stringToBytes(S_SECRET)
                )
            )(encrypt, codec.b64enc),

            // compute C_PASSPHRASE
            C_PASSPHRASE = func.pipe(S_KEY, PEPPER)(
                genKey, codec.b64enc
            )




        try {

            // store S_PUBLIC and ENC_SKP
            await db.none(
                sql(__dirname, generateSigningKeysSQL), {
                    key_table: tables.key_table,
                    G_PUBLIC, C_UUID,
                    S_PUBLIC, ENC_SKP,
                })




            logger.info("  <-     S_PUBLIC:", string.shorten(S_PUBLIC, 11))
            logger.info("  <- C_PASSPHRASE:", string.shorten(C_PASSPHRASE, 17))




            // all went smooth
            res.status(201).send({
                ok: true,
                S_PUBLIC,
                C_PASSPHRASE,
            })




            // [💥] mark things to destroy
            S_KEY = null
            S_SECRET = null
            PEPPER = null
            C_PASSPHRASE = null

        } catch (ex) {

            // unfortunately - error occured
            res.status(500).send({ error: ex })
            logger.error(ex)

        }

        next()

    }

}
