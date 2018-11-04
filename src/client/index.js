/**
 * Shambhala.
 *
 * Client application (frontend).
 *
 * @module client-app
 * @license Apache-2.0
 */




import { salt64 } from "../lib/cryptops"
import { codec } from "@xcmats/js-toolbox"
import MessageHandler from "../lib/message.handler"
import { consoleWrapper } from "../lib/utils"
import { originWhitelist } from "../config/env"
import * as message from "../lib/messages"

import pingPong from "./actions/ping_pong"
import generateAddress from "./actions/generate_address"
import generateSigningKeys from "./actions/generate_signing_keys"
import generateSignedKeyAssocTx from "./actions/generate_signed_key_assoc_tx"
import backup from "./actions/backup"
import restore from "./actions/restore"

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


    // get claimed origin (domain of the host application)
    let hostDomain = window.location.search.slice(1)


    // do whitelist check (don't worry if somebody just lied
    // about it's true location - messages won't work
    // in such case anyway)
    if (originWhitelist.indexOf(hostDomain) === -1) {
        logger.warn("Domain not whitelisted.")
        return
    }


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
        message.GENERATE_ADDRESS,
        generateAddress(messageHandler, context, logger)
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


    // backup
    messageHandler.handle(
        message.BACKUP,
        backup(messageHandler, logger)
    )


    // restore
    messageHandler.handle(
        message.RESTORE,
        restore(messageHandler, logger)
    )


    // report readiness
    messageHandler.postMessage(
        message.READY,
        { hash: codec.bytesToHex(salt64()) }
    )

})
