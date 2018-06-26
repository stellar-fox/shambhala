/**
 * Shambhala (iframe).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import { timeout } from "@xcmats/js-toolbox"
import { console } from "./utils"
import { registerServiceWorker } from "./shambhala"




// gentle start
window.addEventListener("load", async () => {

    // console logger
    const logger = console("🤖")


    // greet
    logger.info("Hi there! 🌴")


    // register service worker
    try {
        if (! await registerServiceWorker(logger)) {
            logger.warn("Reloading...")
            timeout(() => window.location.reload())
        }
    } catch (e) {
        logger.error("Registration failed: ", e)
    }


    // respond to postMessage events
    // ...

})
