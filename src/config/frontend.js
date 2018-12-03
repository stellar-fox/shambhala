/**
 * Shambhala.
 *
 * Frontend environment variables.
 *
 * @module frontend-env
 * @license Apache-2.0
 */




import { timeUnit } from "@xcmats/js-toolbox"
import { version } from "../../package.json"




/**
 * @constant {String} appRootDomId DOM attach point
 */
export const appRootDomId = "app"




/**
 * Session Storage save throttling time - finest possible granularity.
 *
 * @constant {Number} ssSaveThrottlingTime
 */
export const ssSaveThrottlingTime = timeUnit.second




/**
 * Session Storage application state key.
 *
 * @constant {String} ssAppStateKey
 */
export const ssAppStateKey = `Shambhala.${version}`
