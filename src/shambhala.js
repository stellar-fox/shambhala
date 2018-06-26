/**
 * Shambhala (library).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import {
    handleException,
    partial,
    quote,
    timeout,
    timeUnit,
    toBool,
} from "@xcmats/js-toolbox"
import {
    api,
    registrationPath,
    serviceWorkerFilename,
} from "./env"
import { console } from "./utils"




/**
 * Check if page is controlled by a service worker.
 *
 * @function pageControlCheck
 * @param {Object} [logger=console.noop]
 * @returns {Boolean}
 */
export const pageControlCheck = (logger = console.noop) => {
    let controlled = toBool(navigator.serviceWorker.controller)
    if (controlled) logger.info("Page is controlled by service worker.")
    else logger.warn("Page is not controlled by service worker.")
    return controlled
}




/**
 * Register shambhala service worker.
 *
 * @async
 * @function register
 * @param {Object} [logger=console.noop]
 * @returns {Promise.<Boolean>}
 */
export const register = (logger = console.noop) => {

    // simple capability check
    if ("serviceWorker" in navigator) {

        logger.info("Registering shambhalian service worker...")

        // watch for service worker controller changes
        navigator.serviceWorker
            .addEventListener(
                "controllerchange",
                partial(pageControlCheck)(logger)
            )

        // try to register a service worker
        return navigator.serviceWorker
            .register(registrationPath + serviceWorkerFilename)

            .then((registration) => {
                let
                    resolve = null,
                    p = new Promise((res) => { resolve = res })

                logger.info("Registration scope: ", registration.scope)

                // tell the current state of a worker
                let workerState = ["installing", "waiting", "active",]
                    .filter((state) => toBool(registration[state]))
                workerState.forEach((state) =>
                    logger.info(quote(state, "<>"), "worker present")
                )

                // if worker is in `waiting` or `active` state
                // it means it is not newly registered
                if (!workerState.includes("installing")) { resolve("old") }

                // in any case, watch for a service worker update event
                registration.addEventListener("updatefound", (e) => {
                    let newWorker = e.target.installing
                    logger.info("Service worker update found.")
                    newWorker
                        .addEventListener("statechange", () => {
                            logger.info(
                                "<registration>",
                                "state change:", newWorker.state
                            )
                            if (newWorker.state === "activated") {
                                handleException(partial(resolve)("new"))
                            }
                        })
                })

                return p
            })

            // for `old` service workers force a page control check
            .then((version) =>
                version === "old" ?
                    timeout(
                        partial(pageControlCheck)(logger),
                        0.2 * timeUnit.second
                    ) :
                    true
            )

    } else {

        logger.error("Oops... Your browser doesn't support service workers.")

        return Promise.reject(new Error("Service workers not supported."))

    }

}




/**
 * Unegister shambhala service worker.
 *
 * @async
 * @function unregister
 * @param {Object} [logger=console.noop]
 * @returns {Promise.<Boolean>}
 */
export const unregister = (logger = console.noop) => {

    // simple capability check
    if ("serviceWorker" in navigator) {

        return navigator.serviceWorker.getRegistration(registrationPath)
            .then((registration) => registration.unregister())
            .then(() =>
                pageControlCheck(logger)  ?
                    window.fetch(api.release)  :
                    null
            )

    } else {

        logger.error("Oops... Your browser doesn't support service workers.")

        return Promise.reject(new Error("Service workers not supported."))

    }

}
