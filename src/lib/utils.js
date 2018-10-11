/**
 * Shambhala (utilities).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import {
    access,
    dict,
    partial,
    quote,
    randomInt,
    shuffle,
} from "@xcmats/js-toolbox"




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




/**
 * Safe version of (window/self).console object.
 *
 * @function console
 * @param {String} context
 * @returns {Object}
 */
export const console = (() => {
    let
        methods = ["log", "info", "warn", "error"],
        noop = dict(methods.map((m) => [m, () => null])),
        c = (context = "main") => (
            (con) => dict(methods.map(
                (m) => [m, partial(con[m])(quote(context, "[]"))]
            ))
        )(access(self, ["console"], noop))
    c.noop = noop
    return c
})()




/**
 * Return array of `windowSize` random emojis.
 *
 * @function drawEmojis
 * @param {Number} windowSize
 * @return {Array.<String>}
 */
export const drawEmojis = ((emojis) =>
    (windowSize) => {
        let i = randomInt() % (emojis.length - windowSize)
        return shuffle(emojis).slice(i, i + windowSize)
    }
)([
    "🎁", "🎀", "🎧", "🍺", "💣", "💥", "🔥", "👊",
    "🐢", "👻", "🔨", "🍕", "🚀", "🚗", "⛅️", "🐼",
    "🍷", "🌹", "💰", "📷", "👍", "🍒", "⚽️", "⏳",
])
