/**
 * Shambhala.
 *
 * Libs for browser's console playground.
 *
 * @module dynamic-import-lib
 * @license Apache-2.0
 */




import forage from "localforage"




/**
 * (Not only) asynchronously load libraries.
 *
 * @function dynamicImportLibs
 * @returns {Object}
 */
export const dynamicImportLibs = async () => {
    let [
        axios, cryptops, env, redshift, Shambhala,
        stellar, toolbox, txops, utils,
    ] = await Promise.all([
        import("axios"),
        import("@stellar-fox/cryptops"),
        import("../config/env"),
        import("@stellar-fox/redshift"),
        import("./shambhala.client"),
        import("sjcl"),
        import("stellar-sdk"),
        import("@xcmats/js-toolbox"),
        import("./txops"),
        import("./utils"),
    ])
    return {
        axios,
        cryptops,
        env,
        forage,   // can't be imported dynamically
        redshift,
        Shambhala,
        stellar,
        toolbox,
        txops,
        utils,
    }
}
