/**
 * Shambhala.
 *
 * 'Hello-world' action.
 *
 * @module shambhala-server-actions
 * @license Apache-2.0
 */




import { sql } from "../../lib/utils.backend"




/**
 * "Hello world".
 *
 * @function hello
 * @param {Object} db Database connection.
 * @param {Function} logger
 * @returns {Function} express.js action.
 */
export default function hello (db, logger) {

    return async (_req, res) => {

        let dbStats = await db.many(sql("./src/server/actions/pg_stats.sql"))

        res.status(200)
            .send({
                message: "shambhala - REST API",
                version: 1,
                dbStats,
            })
        logger.ok("200")

    }

}
