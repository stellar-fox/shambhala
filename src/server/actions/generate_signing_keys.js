/**
 * Shambhala.
 *
 * Generate signing keys action.
 *
 * @module shambhala-server-actions
 * @license Apache-2.0
 */




import * as cryptops from "../../lib/cryptops"
import { Keypair } from "stellar-sdk"
import {
    codec,
    string,
} from "@xcmats/js-toolbox"
import { sql } from "../../lib/utils.backend"
import { tables } from "../../config/server.credentials"




/**
 * Signing keys generation.
 *
 * @function generateSigningKeys
 * @param {Object} db Database connection.
 * @param {Function} logger
 * @returns {Function} express.js action.
 */
export default function generateSigningKeys (db, logger) {

    return async (req, res) => {

        // receive G_PUBLIC, C_UUID
        let { G_PUBLIC, C_UUID } = req.body

        // base64 decode S_KEY
        let S_KEY = codec.b64dec(req.body.S_KEY)

        logger.info("  -> G_PUBLIC:", string.shorten(G_PUBLIC, 11))
        logger.info("  ->   C_UUID:", string.shorten(C_UUID, 7))
        logger.info("  ->    S_KEY:", string.shorten(req.body.S_KEY, 17))

        // generate S_SECRET
        let S_SECRET = Keypair.random().secret()

        // extract S_PUBLIC from generated S_SECRET
        let S_PUBLIC = Keypair.fromSecret(S_SECRET).publicKey()

        // generate PEPPER
        let PEPPER = cryptops.salt32()

        // encrypt PEPPER and S_SECRET
        let ENC_SKP = codec.b64enc(cryptops.encrypt(
            S_KEY,
            codec.concatBytes(
                PEPPER,
                codec.stringToBytes(S_SECRET)
            )
        ))

        // compute C_PASSPHRASE
        let C_PASSPHRASE = codec.b64enc(cryptops.genKey(S_KEY, PEPPER))

        try {

            // store S_PUBLIC and ENC_SKP
            await db.none(
                sql("./src/server/actions/generate_signing_keys.sql"), {
                    key_table: tables.key_table,
                    G_PUBLIC, C_UUID,
                    S_PUBLIC, ENC_SKP,
                })

            logger.info("  <-     S_PUBLIC:", string.shorten(S_PUBLIC, 11))
            logger.info("  <- C_PASSPHRASE:", string.shorten(C_PASSPHRASE, 17))

            // all went smooth
            res.status(201)
                .send({
                    ok: true,
                    S_PUBLIC,
                    C_PASSPHRASE,
                })
            logger.ok(string.padLeft("201", 8))

            // [💥] mark things to destroy
            S_KEY = null
            S_SECRET = null
            PEPPER = null
            C_PASSPHRASE = null

        } catch (ex) {

            // unfortunately - error occured
            res.status(500)
                .send({ error: ex })
            logger.error(ex)
            logger.err(string.padLeft("500", 8))

        }

    }

}
