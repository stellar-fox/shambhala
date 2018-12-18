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
 * Take console-like object and "augment" all its methods in a way
 * that all arguments passed to them are also passed to function given
 * as an argument.
 *
 * @function consoleAugmenter
 * @param {Object} con console-like object
 * @param {Function} f
 * @returns {Object}
 */
export const consoleAugmenter = (() => {
    let
        methods = ["log", "info", "warn", "error"],
        c = (con, f) => struct.dict(methods.map(
            (m) => [m, (...args) => { f(m, ...args); con[m](...args) }]
        ))
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




/**
 * JSS color.
 *
 * @function rgb
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @returns {String}
 */
export const rgb = (r, g, b) =>
    string.wrap([r, g, b].join(", "), "rgb(", ")")




/**
 * JSS color (with alpha).
 *
 * @function rgba
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @returns {String}
 */
export const rgba = (r, g, b, a) =>
    string.wrap([r, g, b, a].join(", "), "rgba(", ")")




/**
 * Lock the thing. Always return the first passed thing.
 *
 * @function locker
 * @returns {Function} (any) => any
 */
export const locker = () => (
    ({ memoized, value }) =>
        (thing) => {
            if (!memoized) {
                memoized = true
                value = thing
            }
            return value
        }
)({ memoized: false, value: null })
