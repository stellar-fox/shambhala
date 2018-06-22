/**
 * Shambhala (service worker).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import { api } from "./env"
import { console } from "./utils"
import {
    delay,
    timeUnit,
} from "@xcmats/js-toolbox"




// console logger
const logger = console("👽")


// greet
logger.info("Honored to see you, I am. Hmmmmmm. 🍄")


// handle "install" event
self.addEventListener("install", (installEvent) => {
    logger.info("<install>", "Installing myself...")
    self.skipWaiting()
    installEvent.waitUntil((async () => {
        await delay(2 * timeUnit.second)
        logger.info("<install>", "Finished, I have.")
        // throw new Error("Simulated failure")
    })())
})


// handle "activate" event
self.addEventListener("activate", (activateEvent) => {
    logger.info("<activate>", "Activating myself...")
    activateEvent.waitUntil((async () => {
        await self.clients.claim()
        logger.info("<activate>", "Activated, I am.")
    })())
})


// handle "online" event
self.addEventListener("online", () => {
    logger.info("Online now, I become.")
})


// handle "offline" event
self.addEventListener("offline", () => {
    logger.info("Offline now, I become.")
})


// handle "error" event
self.addEventListener("error", (e) => {
    logger.info("Terrible thing happened:", e)
})


// listen to "fetch" events
self.addEventListener("fetch", (e) => {
    if (e.request.url.endsWith(api.spell)) {
        logger.info("Spoken the right words, you have.")
        e.respondWith(new Response(
            JSON.stringify({ message: "We're in! 👻", }),
            { status: 200, }
        ))
    } else {
        logger.info(e.request.method, e.request.url)
        e.respondWith(fetch(e.request))
    }
})
