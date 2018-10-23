/**
 * Shambhala.
 *
 * Client application (frontend).
 *
 * @module shambhala-client-app
 * @license Apache-2.0
 */




import * as cryptops from "../lib/cryptops"
import { codec } from "@xcmats/js-toolbox"
import MessageHandler from "../lib/message.handler"
import { consoleWrapper } from "../lib/utils"
import { hostDomain } from "../config/env"
import * as message from "../lib/messages"
import pingPong from "./actions/ping_pong"
import generateAccount from "./actions/generate_account"
import generateSigningKeys from "./generate_signing_keys"
import generateSignedKeyAssocTx from "./generate_signed_key_assoc_tx"

import "./index.css"




// console logger
const logger = consoleWrapper("🎭")




// local memory, volatile context/store
let context = {}




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
    messageHandler.setRecipient(window.opener, "root")


    // ping-pong
    messageHandler.handle(
        message.PING,
        pingPong(messageHandler, context, logger)
    )


    // account generation
    messageHandler.handle(
        message.GENERATE_ACCOUNT,
        generateAccount(messageHandler, context, logger)
    )


    // signing keys generation
    messageHandler.handle(
        message.GENERATE_SIGNING_KEYS,
        generateSigningKeys(messageHandler, context, logger)
    )


    // automatic keys association
    messageHandler.handle(
        message.GENERATE_SIGNED_KEY_ASSOC_TX,
        generateSignedKeyAssocTx(messageHandler, context, logger)
    )


    // report readiness
    messageHandler.postMessage(
        message.READY,
        { hash: codec.bytesToHex(cryptops.salt64()) }
    )

})
