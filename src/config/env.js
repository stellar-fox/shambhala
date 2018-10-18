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
 * @constant hostDomain Domain of the host application.
 */
export const hostDomain = "https://localhost"




/**
 * @constant clientDomain Domain of the `client` application.
 */
export const clientDomain = "https://secrets.localhost"




/**
 * @constant registrationPath Path prefix
 */
export const registrationPath = publicPath




/**
 * @constant restApiPrefix Where to send xhr queries?
 */
export const restApiPrefix = "api/v1/"




/**
 * @constant maximumWindowOpeningTime ...
 */
export const maximumWindowOpeningTime = 10 * timeUnit.second




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
