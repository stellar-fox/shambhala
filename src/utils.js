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
export const console = (() => {
    let
        methods = ["log", "info", "warn", "error",],
        noop = dict(methods.map((m) => [m, () => null,])),
        c = (context = "main") => (
            (con) => dict(methods.map(
                (m) => [m, partial(con[m])(quote(context, "[]")),]
            ))
        )(access(self, ["console",], noop))
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
 * (Not only) asynchronously load libraries.
 *
 * @function dynamicImportLibs
 * @returns {Object}
 */
export const dynamicImportLibs = async () => {
    let [
        axios, crypto, cryptops, env, nacl, redshift,
        sjcl, stellar, toolbox, txops, utils, scrypt, lib,
    ] = await Promise.all([
        import("axios"),
        import("crypto-browserify"),
        import("./cryptops"),
        import("./env"),
        import("tweetnacl"),
        import("@stellar-fox/redshift"),
        import("sjcl"),
        import("stellar-sdk"),
        import("@xcmats/js-toolbox"),
        import("./txops"),
        import("./utils"),
        import("scrypt-js"),
        import("./shambhala"),
    ])
    return {
        axios,
        crypto,
        cryptops,
        env,
        forage,   // can't be imported dynamically
        lib,
        nacl,
        process,  // eslint-disable-line
        redshift,
        sjcl,
        stellar,
        toolbox,
        txops,
        utils,
        scrypt: scrypt.default,
    }
}
