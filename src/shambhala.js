/**
 * Shambhala (library).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import { timeout } from "@xcmats/js-toolbox"
import { serviceWorkerFilename } from "./env"
import { console } from "./utils"




/**
 * Register shambhala service worker.
 *
 * @function register
 */
export const register = (logger = console()) => {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            logger.info("Registering shambhalian service worker...")
            navigator.serviceWorker
                .register(serviceWorkerFilename)
                .then((r) => {
                    logger.info("Registration successful: ", r.scope)
                    if (!navigator.serviceWorker.controller) {
                        timeout(() => {
                            window.document.location = "/"
                        })
                    }
                })
                .catch((e) =>
                    logger.warn("Registration failed: ", e)
                )
        })
    }
}
