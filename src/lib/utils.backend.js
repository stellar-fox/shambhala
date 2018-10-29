/**
 * Shambhala.
 *
 * Various utilities - only for node.js environment.
 *
 * @module utils-backend-lib
 * @license Apache-2.0
 */




import { join } from "path"
import { realpathSync } from "fs"
import { cwd } from "process"
import pg from "pg-promise"




/**
 * Construct database "connstring".
 * `postgres://user:pass@host:port/db`
 *
 * @function cn
 * @param {Object} c Credentials
 * @returns {String}
 */
export const cn = (c) => {
    if (["user", "pass", "host", "port", "db"].every(p => p in c)) {
        return `postgres://${c.user}:${c.pass}@${c.host}:${c.port}/${c.db}`
    }
    throw new Error("Malformed credentials object")
}




/**
 * QueryFiles linking helper with memoization.
 *
 * @function sql
 * @param {String} file path to an SQL file (relative to application's root)
 * @returns {QueryFile}
 */
export const sql = ((qfs) =>
    (file) => {
        if (!(file in qfs)) {
            qfs[file] = new pg.QueryFile(
                join(realpathSync(cwd()), file), { minify: true }
            )
        }
        return qfs[file]
    }
)({})
