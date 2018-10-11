/**
 * Shambhala (service worker).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import {
    choose,
    delay,
    head,
} from "@xcmats/js-toolbox"
import { console } from "./lib/utils"
import {
    api,
    apiPrefix,
    defaultDelay,
} from "./config/env"




// console logger
const logger = console("👽")




// handle "install" event
self.addEventListener("install", (installEvent) => {
    logger.info("<install>", "Installing myself...")
    self.skipWaiting()
    installEvent.waitUntil((async () => {
        await delay(defaultDelay)
        logger.info("<install>", "Finished, I have.")
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
self.addEventListener("fetch", (e) => choose(
    apiPrefix + head(e.request.url.match(/[^/]*$/)), {

        // "ping-pong"
        [api.spell]: () => {
            logger.info("Spoken the right words, you have.")
            e.respondWith(new Response(JSON.stringify({
                message: "We're in! 👻",
            }), {
                status: 200,
                headers: {
                    "content-type": "application/json; charset=utf-8",
                },
            }))
        },

        // force clients reload after unregister
        [api.release]: () => {
            logger.info("Bye!")
            self.clients.matchAll()
                .then((clients) => clients.map(c =>
                    c.url  &&  "navigate" in c  ?
                        c.navigate(c.url)  :  null
                ))
                .then(() => e.respondWith(
                    new Response(null, { status: 200 })
                ))
        },

    },

    () => {
        logger.info(e.request.method, e.request.url)
        e.respondWith(fetch(e.request))
    }
))
