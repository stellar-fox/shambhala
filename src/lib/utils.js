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
    utils,
} from "@xcmats/js-toolbox"
import { sha256 } from "@stellar-fox/cryptops"




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
 * Returns hex representation of every 4th byte of sha256 hash of input string.
 *
 * @function miniHash
 * @param {String} str
 * @return {String} hex
 */
export const miniHash = func.flow(
    codec.stringToBytes,
    sha256,
    (bytes) => Array.from(bytes),
    array.takeEvery(4),
    (arr) => Uint8Array.from(arr),
    codec.bytesToHex
)
