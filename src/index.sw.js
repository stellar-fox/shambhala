/**
 * Shambhala (service worker).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import { api } from "./env"
import { console } from "./utils"




// console logger
const print = console("👽")


// greet
print.info("Honored to see you, I am. Hmmmmmm. 🍄")


// handle "install" event
self.addEventListener("install", (_e) => {
    print.info("Installing myself...")
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
        e.respondWith(fetch(e.request))
    }
})
