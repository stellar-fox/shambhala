/**
 * Shambhala.
 *
 * Client application (frontend).
 *
 * @module shambhala-client-app
 * @license Apache-2.0
 */




import {
    choose,
} from "@xcmats/js-toolbox"
import axios from "axios"
import { console } from "../lib/utils"
import {
    clientDomain,
    hostDomain,
    registrationPath,
    restApiPrefix,
} from "../config/env"
import * as message from "../lib/messages"

import "./index.css"




// console logger
const logger = console("🤖")




// ...
const backend = clientDomain + registrationPath + restApiPrefix




// gentle start
window.addEventListener("load", async () => {

    // if there is no parent - there is nothing to do
    if (!window.opener) {
        logger.error("What are you looking for?")
        // window.location.replace(hostDomain)
        // return null
    }

    // greet
    logger.info("Boom! 💥")


    // do stuff

    // ...

    // say "hello" over cross-origin communication channel
    if (window.opener) {
        window.opener.postMessage(
            JSON.stringify({ message: message.READY }),
            hostDomain
        )
    } else {
        logger.info("No parent!")
    }

})




// listen to the messages coming from parent (the root)
window.addEventListener("message", (e) => {

    // don't get fooled by potential messages from others
    if (e.origin !== hostDomain) { return }

    // packet of data
    let packet = JSON.parse(e.data)

    // ...
    logger.info("Root has spoken:", packet)

    // undertake some action
    choose(packet.message, {

        // ...
        "Hey, ho!": async () => {

            logger.info("getting data...")
            let resp = await axios.get(backend)
            logger.info("got:", resp)

            window.opener.postMessage(
                JSON.stringify({
                    message: "I hear ya!",
                    payload: resp.data,
                }),
                hostDomain
            )
            logger.info("data sent to root...")
        },

    })


})
