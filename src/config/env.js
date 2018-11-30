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
 * @constant {String} homepage ...
 */
export const homepage = "https://stellarfox.net/"




/**
 * @constant {String} registrationPath Path prefix
 */
export const registrationPath = publicPath




/**
 * @constant {String} restApiRoot Root of all REST API paths.
 */
export const restApiRoot = "api/"




/**
 * @constant {String} restApiPrefix Where to send xhr queries?
 */
export const restApiPrefix = `${restApiRoot}v1/`




/**
 * @constant {Number} defaultMessageTimeout ...
 */
export const defaultMessageTimeout = 0.8 * timeUnit.second




/**
 * @constant {Number} defaultHeartbeatInterval ...
 */
export const defaultHeartbeatInterval = 0.6 * timeUnit.second




/**
 * @constant {Number} defaultHeartbeatInterval ...
 */
export const defaultLongReceivingTimeout = 2 * timeUnit.hour




/**
 * @constant {Number} defaultBackendPingTimeout ...
 */
export const defaultBackendPingTimeout = 5 * timeUnit.second




/**
 * @constant {Number} maximumWindowOpeningTime ...
 */
export const maximumWindowOpeningTime = 10 * timeUnit.second




/**
 * @constant {Array.<String>} devOriginWhitelist
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
 * @constant {Object} entrypoint REST API entrypoints that are not "messages"
 */
export const entrypoint = Object.freeze({
    WHITELIST: "whitelist",
})
