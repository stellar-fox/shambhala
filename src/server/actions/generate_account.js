/**
 * Shambhala.
 *
 * Generate account action.
 *
 * @module server-actions
 * @license Apache-2.0
 */




import { string } from "@xcmats/js-toolbox"
import { sql } from "../../lib/utils.backend"
import generateAccountSQL from "./generate_account.sql"
import { tables } from "../../config/server.credentials"




/**
 * Account generation.
 *
 * @function generateAccount
 * @param {Object} db Database connection.
 * @param {Function} logger
 * @returns {Function} express.js action.
 */
export default function generateAccount (db, logger) {

    return async (req, res, next) => {

        // receive G_PUBLIC and C_UUID
        let { G_PUBLIC, C_UUID } = req.body

        logger.info("  -> G_PUBLIC:", string.shorten(G_PUBLIC, 11))
        logger.info("  ->   C_UUID:", string.shorten(C_UUID, 7))

        try {

            // store G_PUBLIC and C_UUID
            await db.none(
                sql(__dirname, generateAccountSQL), {
                    key_table: tables.key_table,
                    G_PUBLIC, C_UUID,
                })

            // all went smooth
            res.status(201)
                .send({ ok: true })

        } catch (ex) {

            // unfortunately - error occured
            res.status(500)
                .send({ error: ex })
            logger.error(ex)

        }

        next()

    }

}
