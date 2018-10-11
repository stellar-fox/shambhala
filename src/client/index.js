/**
 * Shambhala.
 * Client application (frontend).
 *
 * @module shambhala-client-app
 * @license Apache-2.0
 */




import {
    choose,
    timeout
} from "@xcmats/js-toolbox"
import {
    registerServiceWorker,
    unregisterServiceWorker,
} from "../lib/shambhala.sw"
import { console } from "../lib/utils"
import { mainDomain } from "../config/env"

import "./index.css"




// console logger
const logger = console("🤖")




// gentle start
window.addEventListener("load", async () => {

    // if there is no parent - there is nothing to do
    if (window.parent === window) {
        logger.warn("Have you lost something here?")
        window.location.replace(mainDomain)
        return null
    }


    // greet
    logger.info("Boom! 💥")


    // do stuff
    try {

        // register service worker
        if (! await registerServiceWorker(logger)) {
            logger.warn("Reloading...")
            timeout(() => window.location.reload())
        } else {

            // say "hello" over cross-origin communication channel
            window.parent.postMessage("Hello!", mainDomain)

        }

    } catch (e) {
        logger.error("Registration failed: ", e)
    }

})




// listen to the messages coming from parent (the root)
window.addEventListener("message", (e) => {

    // don't get fooled by potential messages from others
    if (e.origin !== mainDomain) { return }


    // ...
    logger.info("Root said:", e.data)


    // undertake an appropriate action
    choose(e.data, {

        // unregister service worker
        unregister: async () => {
            await unregisterServiceWorker(logger)
        },

    })


})
