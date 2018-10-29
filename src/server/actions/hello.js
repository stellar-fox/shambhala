/**
 * Shambhala.
 *
 * 'Hello-world' action.
 *
 * @module server-actions
 * @license Apache-2.0
 */




import { sql } from "../../lib/utils.backend"




/**
 * "Hello world".
 *
 * @function hello
 * @param {Object} db Database connection.
 * @param {Function} _logger
 * @returns {Function} express.js action.
 */
export default function hello (db, _logger) {

    return async (_req, res, next) => {

        let dbStats = await db.many(sql(__dirname, "pg_stats.sql"))

        res.status(200)
            .send({
                message: "shambhala - REST API",
                version: 1,
                dbStats,
            })

        next()

    }

}
