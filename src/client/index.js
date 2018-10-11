/**
 * Shambhala.
 * Client application (frontend).
 *
 * @module shambhala-client-app
 * @license Apache-2.0
 */




import {
    choose,
} from "@xcmats/js-toolbox"
import { console } from "../lib/utils"
import { hostDomain } from "../config/env"

import "./index.css"




// console logger
const logger = console("🤖")




// gentle start
window.addEventListener("load", async () => {

    // if there is no parent - there is nothing to do
    // if (window.parent === window) {
    //     logger.warn("Have you lost something here?")
    //     window.location.replace(hostDomain)
    //     return null
    // }


    // greet
    logger.info("Boom! 💥")


    // do stuff

    // ...


    // say "hello" over cross-origin communication channel
    if (window.opener) {
        window.opener.postMessage("Ping!", hostDomain)
    } else {
        logger.info("No parent!")
    }

})




// listen to the messages coming from parent (the root)
window.addEventListener("message", (e) => {

    // don't get fooled by potential messages from others
    if (e.origin !== hostDomain) { return }


    // ...
    logger.info("Root said:", e.data)


    // undertake some action
    choose(e.data, {

        // ...
        "Hey, ho!": () => {
            window.opener.postMessage("I hear ya!", hostDomain)
        },

    })


})
