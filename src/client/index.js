/**
 * Shambhala.
 *
 * Client application (frontend-logic-controller).
 *
 * @module client-app
 * @license Apache-2.0
 */




import {
    codec,
    devEnv,
    func,
    type,
    to_,
} from "@xcmats/js-toolbox"
import { salt64 } from "../lib/cryptops"
import MessageHandler from "../lib/message.handler"
import { consoleWrapper } from "../lib/utils"
import { dynamicImportLibs } from "../lib/dynamic.import"
import * as functions from "./functions"
import { originWhitelist } from "../config/env"
import * as message from "../lib/messages"

import pingPong from "./actions/ping_pong"
import generateAddress from "./actions/generate_address"
import associateAddress from "./actions/associate_address"
import generateSigningKeys from "./actions/generate_signing_keys"
import generateSignedKeyAssocTx from "./actions/generate_signed_key_assoc_tx"
import generateKeyAssocTx from "./actions/generate_key_assoc_tx"
import backup from "./actions/backup"
import restore from "./actions/restore"
import signTransaction from "./actions/sign_transaction"

import "./index.css"




const
    // local memory, volatile context/store
    context = {},

    // console logger
    logger = consoleWrapper("🎭")




// gentle start
if (type.isObject(window) && window.addEventListener) {

    window.addEventListener("load", async () => {

        // if there is no parent - there is nothing to do
        if (!window.opener) {
            logger.error("What are you looking for?")
            // window.location.replace(hostDomain)
            return null
        }

        // greet
        logger.info("Boom! 💥")

        // expose `sf` dev. namespace
        // and some convenience shortcuts
        if (devEnv()) {
            window.sf = {
                ...await dynamicImportLibs(),
                context, functions, message, logger,
            }
            window.to_ = to_
        }

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
        const
            messageHandler = new MessageHandler(hostDomain),
            postMessageBinder = func.partial(messageHandler.postMessage)
        messageHandler.setRecipient(window.opener, "root")

        // expose message handler
        if (devEnv() && window.sf) {
            window.sf.messageHandler = messageHandler
        }




        // ping-pong action
        messageHandler.handle(message.PING, pingPong(
            postMessageBinder(message.PONG), logger
        ))

        // account generation action
        messageHandler.handle(message.GENERATE_ADDRESS, generateAddress(
            postMessageBinder(message.GENERATE_ADDRESS), context, logger
        ))

        // account association action
        messageHandler.handle(message.ASSOCIATE_ADDRESS, associateAddress(
            postMessageBinder(message.ASSOCIATE_ADDRESS), logger
        ))

        // signing keys generation action
        messageHandler.handle(message.GENERATE_SIGNING_KEYS,
            generateSigningKeys(
                postMessageBinder(message.GENERATE_SIGNING_KEYS), logger
            )
        )

        // automatic keys association action
        messageHandler.handle(message.GENERATE_SIGNED_KEY_ASSOC_TX,
            generateSignedKeyAssocTx(
                postMessageBinder(message.GENERATE_SIGNED_KEY_ASSOC_TX),
                context, logger
            )
        )

        // manual keys association action
        messageHandler.handle(message.GENERATE_KEY_ASSOC_TX,
            generateKeyAssocTx(
                postMessageBinder(message.GENERATE_KEY_ASSOC_TX), logger
            )
        )

        // backup action
        messageHandler.handle(message.BACKUP, backup(
            postMessageBinder(message.BACKUP), logger
        ))

        // restore action
        messageHandler.handle(message.RESTORE, restore(
            postMessageBinder(message.RESTORE), logger
        ))

        // sign transaction action
        messageHandler.handle(message.SIGN_TRANSACTION, signTransaction(
            postMessageBinder(message.SIGN_TRANSACTION), logger
        ))




        // report readiness
        messageHandler.postMessage(message.READY, {
            hash: codec.bytesToHex(salt64()),
        })

    })

}
