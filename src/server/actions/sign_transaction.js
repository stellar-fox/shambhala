/**
 * Shambhala.
 *
 * Sign transaction action.
 *
 * @module server-actions
 * @license Apache-2.0
 */




import {
    decrypt,
    genKey,
} from "@stellar-fox/cryptops"
import { signTSP } from "../../lib/txops"
import {
    codec,
    func,
    string,
} from "@xcmats/js-toolbox"
import { sql } from "../../lib/utils.backend"
import signTransactionSQL from "./sign_transaction.sql"
import incUsageCountSQL from "./inc_usage_count.sql"
import incFailureCountSQL from "./inc_failure_count.sql"
import { tables } from "../../config/server.json"




/**
 * Transaction signing.
 *
 * @function signTransaction
 * @param {Object} db Database connection.
 * @param {Function} logger
 * @returns {Function} express.js action.
 */
export default function signTransaction (db, logger) {

    return async (req, res, next) => {

        let
            // receive G_PUBLIC, C_UUID
            { G_PUBLIC, C_UUID } = req.body,

            // base64 decode S_KEY
            S_KEY = codec.b64dec(req.body.S_KEY),

            // base64 decode TX_PAYLOAD
            TX_PAYLOAD = codec.b64dec(req.body.TX_PAYLOAD)




        logger.info("  -> G_PUBLIC:", string.shorten(G_PUBLIC, 11))
        logger.info("  ->   C_UUID:", string.shorten(C_UUID, 7))
        logger.info("  ->       TX:", string.shorten(req.body.TX_PAYLOAD, 17))




        try {

            let
                // get encrypted server keypair structure
                { ENC_SKP } = await db.one(
                    sql(__dirname, signTransactionSQL), {
                        key_table: tables.key_table,
                        G_PUBLIC, C_UUID,
                    }),

                PEPPER = null, S_SECRET = null

            // try PEPPER and S_SECRET decryption and extraction
            try {(
                // if `S_KEY` is bad, then decryption will fail
                // returning `null`, so object decomposition won't be possible
                // and an exception will be thrown
                { PEPPER, S_SECRET } = func.pipe(
                    S_KEY, codec.b64dec(ENC_SKP)
                )(
                    decrypt,
                    (SKP) => ({
                        PEPPER: SKP.slice(0, 32),
                        S_SECRET: codec.bytesToString(SKP.slice(32)),
                    })
                )
            )} catch (ex) {

                // increment failure counter
                await db.none(
                    sql(__dirname, incFailureCountSQL), {
                        key_table: tables.key_table,
                        G_PUBLIC, C_UUID,
                    })

                res.status(400).send({ error: "bad decryption key" })
                logger.warn("Bad decryption key.")

                // do nothing more
                next()
                return
            }

            // increment usage counter
            await db.none(
                sql(__dirname, incUsageCountSQL), {
                    key_table: tables.key_table,
                    G_PUBLIC, C_UUID,
                })




            let
                // sign TX_PAYLOAD with S_SECRET
                S_SIGNATURE = func.pipe(S_SECRET, TX_PAYLOAD)(
                    signTSP, codec.b64enc
                ),

                // compute C_PASSPHRASE
                C_PASSPHRASE = func.pipe(S_KEY, PEPPER)(
                    genKey, codec.b64enc
                )




            logger.info("  <-  S_SIGNATURE:", string.shorten(S_SIGNATURE, 17))
            logger.info("  <- C_PASSPHRASE:", string.shorten(C_PASSPHRASE, 17))




            // all went smooth
            res.status(200).send({
                ok: true,
                S_SIGNATURE,
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
