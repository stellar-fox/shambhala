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
 * DOM attach point.
 *
 * @constant {String} appRootDomId
 */
export const appRootDomId = "app"




/**
 * Session Storage application state key.
 *
 * @constant {String} ssAppStateKey
 */
export const ssAppStateKey = `Shambhala.${version}`




/**
 * Sometimes a small delay is improving overall UX.
 *
 * @constant {Number} fancyDelay
 */
export const fancyDelay = 0.3 * timeUnit.second




/**
 * Session Storage save throttling time - finest possible granularity.
 *
 * @constant {Number} ssSaveThrottlingTime
 */
export const ssSaveThrottlingTime = timeUnit.second




/**
 * How long layout shall wait before major change to avoid flickering?
 *
 * @constant {Number} messageThrottleTime
 */
export const messageThrottleTime = 0.5 * timeUnit.second
