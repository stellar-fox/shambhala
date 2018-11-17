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
 * @constant devOriginWhitelist
 */
export const devOriginWhitelist = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "http://localhost:8080",
    "https://localhost",
]




/**
 * @constant entrypoint
 */
export const entrypoint = Object.freeze({
    WHITELIST: "whitelist",
})
