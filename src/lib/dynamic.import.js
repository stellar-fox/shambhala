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
        axios, bip39, crypto, cryptops, env, nacl, redshift,
        sjcl, stellar, toolbox, txops, utils, scrypt,
    ] = await Promise.all([
        import("axios"),
        import("bip39"),
        import("crypto-browserify"),
        import("./cryptops"),
        import("../config/env"),
        import("tweetnacl"),
        import("@stellar-fox/redshift"),
        import("sjcl"),
        import("stellar-sdk"),
        import("@xcmats/js-toolbox"),
        import("./txops"),
        import("./utils"),
        import("scrypt-js"),
    ])
    return {
        axios,
        bip39,
        crypto,
        cryptops,
        env,
        forage,   // can't be imported dynamically
        nacl,
        redshift,
        sjcl,
        stellar,
        toolbox,
        txops,
        utils,
        scrypt: scrypt.default,
    }
}
