/**
 * Shambhala (dev-utils).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import forage from "localforage"
import {
    randomInt,
    shuffle,
} from "@xcmats/js-toolbox"




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
        toolbox, utils, shambhala,
    ] = await Promise.all([
        import("@xcmats/js-toolbox"),
        import("./utils"),
        import("./shambhala"),
    ])
    return {
        forage,   // can't be imported dynamically
        process,  // eslint-disable-line
        toolbox, utils, shambhala,
    }
}
