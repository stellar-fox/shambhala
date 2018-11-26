/**
 * Shambhala.
 *
 * Whitelist action.
 *
 * @module server-actions
 * @license Apache-2.0
 */




import { sql } from "../../lib/utils.backend"
import whitelistSQL from "./whitelist.sql"
import { tables } from "../../config/server.json"




/**
 * Get whitelisted origins.
 *
 * @function whitelist
 * @param {Object} db Database connection.
 * @param {Function} _logger
 * @returns {Function} express.js action.
 */
export default function whitelist (db, _logger) {

    return async (_req, res, next) => {

        res.status(200).send({
            ok: true,
            whitelist: (await db.any(sql(__dirname, whitelistSQL), {
                whitelist_table: tables.whitelist_table,
            })).map((w) => w.domain),
        })

        next()

    }

}
