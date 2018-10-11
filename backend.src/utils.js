/**
 * Shambhala (backend-utils).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




/**
 * Construct database connstring.
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
