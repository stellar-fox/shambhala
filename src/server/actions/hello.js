/**
 * Shambhala.
 *
 * 'Hello-world' action.
 *
 * @module server-actions
 * @license Apache-2.0
 */




import { version } from "../../../package.json"




/**
 * "Hello world".
 *
 * @function hello
 * @param {Object} _db Database connection.
 * @param {Function} _logger
 * @returns {Function} express.js action.
 */
export default function hello (_db, _logger) {

    return async (_req, res, next) => {

        res.status(200).send({
            message: "shambhala - REST API",
            apiVersion: String(1),
            version,
        })

        next()

    }

}
