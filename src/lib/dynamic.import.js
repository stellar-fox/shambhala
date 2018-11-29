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
        import(/* webpackChunkName: "axios" */ "axios"),
        import(/* webpackChunkName: "cryptops" */ "@stellar-fox/cryptops"),
        import(/* webpackChunkName: "env" */ "../config/env"),
        import(/* webpackChunkName: "redshift" */ "@stellar-fox/redshift"),
        import(/* webpackChunkName: "shambhala" */ "./shambhala.client"),
        import(/* webpackChunkName: "stellar" */ "stellar-sdk"),
        import(/* webpackChunkName: "toolbox" */ "@xcmats/js-toolbox"),
        import(/* webpackChunkName: "txops" */ "./txops"),
        import(/* webpackChunkName: "utils" */ "./utils"),
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
