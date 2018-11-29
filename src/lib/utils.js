/**
 * Shambhala.
 *
 * Various utilities suitable to use everywhere (browser or node.js).
 *
 * @module utils-lib
 * @license Apache-2.0
 */




import {
    array,
    codec,
    func,
    math,
    string,
    struct,
    type,
    utils,
} from "@xcmats/js-toolbox"




/**
 * Safe version of (window/self).console object.
 *
 * @function consoleWrapper
 * @param {String} context
 * @returns {Object}
 */
export const consoleWrapper = (() => {
    let
        methods = ["log", "info", "warn", "error"],
        noop = struct.dict(methods.map((m) => [m, () => null])),
        c = (context = "main") => (
            (con) => struct.dict(methods.map(
                (m) => [m, func.partial(con[m])(string.quote(context, "[]"))]
            ))
        )(struct.access(utils.isBrowser() ? self : global, ["console"], noop))
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
        let i = math.randomInt() % (emojis.length - windowSize)
        return array.shuffle(emojis).slice(i, i + windowSize)
    }
)([
    "🎁", "🎀", "🎧", "🍺", "💣", "💥", "🔥", "👊",
    "🐢", "👻", "🔨", "🍕", "🚀", "🚗", "⛅️", "🐼",
    "🍷", "🌹", "💰", "📷", "👍", "🍒", "⚽️", "⏳",
])




/**
 * Extract default export from a module.
 *
 * @function mDef
 * @param {Object} m
 * @returns {any}
 */
export const mDef = (m) => m.default




/**
 * Returns hex representation of every 4th byte of sha256 hash of input string.
 *
 * @function miniHash
 * @param {Function} sha256
 * @param {String} str
 * @return {String} hex
 */
export const miniHash = (sha256) => func.flow(
    codec.stringToBytes,
    sha256,
    (bytes) => Array.from(bytes),
    array.takeEvery(4),
    (arr) => Uint8Array.from(arr),
    codec.bytesToHex
)




/**
 * Run "main" function in browser on "load" event.
 *
 * @function run
 * @param {Function} main
 */
export const run = (main) => {
    if (
        type.isObject(window)  &&
        type.isFunction(window.addEventListener)
    ) {
        window.addEventListener("load", main)
    }
}
