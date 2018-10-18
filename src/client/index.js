/**
 * Shambhala.
 *
 * Client application (frontend).
 *
 * @module shambhala-client-app
 * @license Apache-2.0
 */




import axios from "axios"
import { console } from "../lib/utils"
import MessageHandler from "../lib/message.handler"
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
        return null
    }


    // greet
    logger.info("Boom! 💥")


    // instantiate message handler
    const messageHandler = new MessageHandler(hostDomain)
    messageHandler.addRecipient(window.opener, "root")


    // assign some action to "PING" message
    messageHandler.handle(
        message.PING,
        async (p) => {

            logger.info("Root has spoken:", p)

            logger.info("getting data...")
            let resp = await axios.get(backend)
            logger.info("got:", resp)

            messageHandler.postMessage(
                message.PONG,
                resp.data
            )

            logger.info("data sent to root...")

        },
        true
    )


    // report readiness
    messageHandler.postMessage(message.READY)

})
