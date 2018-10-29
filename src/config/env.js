/**
 * Shambhala.
 *
 * Environment variables.
 *
 * @module env
 * @license Apache-2.0
 */




import { publicPath } from "../../package.json"
import { timeUnit } from "@xcmats/js-toolbox"




/**
 * @constant clientDomain Domain of the `client` application.
 */
export const clientDomain = "https://secrets.localhost"




/**
 * @constant registrationPath Path prefix
 */
export const registrationPath = publicPath




/**
 * @constant restApiRoot Root of all REST API paths.
 */
export const restApiRoot = "api/"




/**
 * @constant restApiPrefix Where to send xhr queries?
 */
export const restApiPrefix = `${restApiRoot}v1/`




/**
 * @constant defaultMessageTimeout ...
 */
export const defaultMessageTimeout = 5 * timeUnit.second




/**
 * @constant maximumWindowOpeningTime ...
 */
export const maximumWindowOpeningTime = 10 * timeUnit.second




/**
 * @constant originWhitelist
 * temp. dev. solution - it'll go to the database, soon...
 */
export const originWhitelist = [
    "https://localhost",
    "http://localhost:3000",
    "http://localhost:8080",
]




// OBSOLETE below -----------------------------------------------------------




// ...
export const defaultDelay = 0.2 * timeUnit.second




// ...
export const serviceWorkerIframe = publicPath + "shambhala.html"




// ...
export const serviceWorkerFilename = "shambhala.sw.bundle.js"




// ...
export const apiPrefix = "shambhalanians/"




// ...
export const api = {
    release: apiPrefix + "release",
    spell: apiPrefix + "are.you.there",
}
