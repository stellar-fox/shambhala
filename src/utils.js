/**
 * Shambhala (dev-utils).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import forage from "localforage"
import {
    access,
    dict,
    partial,
    quote,
    randomInt,
    shuffle,
} from "@xcmats/js-toolbox"




/**
 * Safe version of (window/self).console object.
 *
 * @function console
 * @param {String} context
 * @returns {Object}
 */
export const console = (context = "main") => {
    const
        methods = ["log", "info", "warn", "error",],
        c = access(
            self, ["console",],
            dict(methods.map((m) => [m, () => null,]))
        )
    return dict(methods.map((m) =>
        [m, partial(c[m])(quote(context, "[]")),]
    ))
}




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
 * (Not only) asynchronously load libraries.
 *
 * @function dynamicImportLibs
 * @returns {Object}
 */
export const dynamicImportLibs = async () => {
    let [
        axios, toolbox, utils, shambhala,
    ] = await Promise.all([
        import("axios"),
        import("@xcmats/js-toolbox"),
        import("./utils"),
        import("./shambhala"),
    ])
    return {
        axios,
        forage,   // can't be imported dynamically
        process,  // eslint-disable-line
        toolbox, utils, shambhala,
    }
}
