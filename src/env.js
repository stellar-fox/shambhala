/**
 * Shambhala (environment variables).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import { timeUnit } from "@xcmats/js-toolbox"




// ...
export const defaultDelay = 0.2 * timeUnit.second




// ...
export const mainDomain = "https://localhost"




// ...
export const serviceWorkerDomain = "https://secrets.localhost"




// ...
export const serviceWorkerIframe = "/shambhala.html"




// ...
export const registrationPath = "/shambhala/"




// ...
export const serviceWorkerFilename = "shambhala.sw.bundle.js"




// ...
export const apiPrefix = "shambhalanians/"




// ...
export const api = {
    release: apiPrefix + "release",
    spell: apiPrefix + "are.you.there",
    // give: apiPrefix + "give.me.something",
}
