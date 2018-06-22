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
const print = console("👽")


// greet
print.info("Honored to see you, I am. Hmmmmmm. 🍄")


// handle "install" event
self.addEventListener("install", (installEvent) => {
    print.info("<install>", "Installing myself...")
    self.skipWaiting()
    installEvent.waitUntil((async () => {
        await delay(2 * timeUnit.second)
        print.info("<install>", "Finished, I have.")
        // throw new Error("Simulated failure")
    })())
})


// handle "activate" event
self.addEventListener("activate", (_activateEvent) => {
    self.clients.claim()
    print.info("Activated, I am.")
})


// handle "online" event
self.addEventListener("online", () => {
    print.info("Online now, I become.")
})


// handle "offline" event
self.addEventListener("offline", () => {
    print.info("Offline now, I become.")
})


// handle "error" event
self.addEventListener("error", (e) => {
    print.info("Terrible thing happened:", e)
})


// listen to "fetch" events
self.addEventListener("fetch", (e) => {
    if (e.request.url.endsWith(api.spell)) {
        print.info("Spoken the right words, you have.")
        e.respondWith(new Response(
            JSON.stringify({ message: "We're in! 👻", }),
            { status: 200, }
        ))
    } else {
        print.info(e.request.method, e.request.url)
        e.respondWith(fetch(e.request))
    }
})
