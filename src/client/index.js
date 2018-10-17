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




/**
 * Private store.
 *
 * @private
 * @constant _store
 */
const _store = {}




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


    // instantiate message handler
    _store.messageHandler = new MessageHandler(_store)
    _store.url = new URL(hostDomain)


    // assign some action to "PING" message
    _store.messageHandler.handle(
        message.PING,
        async (p) => {

            // ...
            logger.info("Root has spoken:", p)

            logger.info("getting data...")
            let resp = await axios.get(backend)
            logger.info("got:", resp)

            window.opener.postMessage(
                JSON.stringify({
                    message: message.PONG,
                    payload: resp.data,
                }),
                hostDomain
            )
            logger.info("data sent to root...")

        },
        true
    )


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
