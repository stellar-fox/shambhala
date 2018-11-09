/**
 * Shambhala.
 *
 * Various utilities suitable to use everywhere (browser or node.js).
 *
 * @module utils-lib
 * @license Apache-2.0
 */




import {
    access,
    dict,
    isBrowser,
    partial,
    quote,
    randomInt,
    shuffle,
    string,
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
        noop = dict(methods.map((m) => [m, () => null])),
        c = (context = "main") => (
            (con) => dict(methods.map(
                (m) => [m, partial(con[m])(quote(context, "[]"))]
            ))
        )(access(isBrowser() ? self : global, ["console"], noop))
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




/**
 * Assign argument to the global object.
 * Async-console-dev-helper.
 *
 * @function to_
 * @param {String} name
 * @returns {Function} (*) => *
 */
export const to_ = (name = "_") =>
    (_) => {
        (window || self || global || this)[name] = _
        // eslint-disable-next-line no-console
        console.log(`${name} = ${string.quote(typeof _, "[]")}`)
        // eslint-disable-next-line no-console
        console.log(_)
        return _
    }
