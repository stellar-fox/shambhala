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
    func,
    type,
    utils,
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
import getPublicKeys from "./actions/get_public_keys"
import backup from "./actions/backup"
import restore from "./actions/restore"
import canSignFor from "./actions/can_sign_for"
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
        if (utils.devEnv()) {
            window.sf = {
                ...await dynamicImportLibs(),
                context, functions, message, logger,
            }
            window.to_ = utils.to_
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
        if (utils.devEnv() && window.sf) {
            window.sf.messageHandler = messageHandler
        }




        // assign message handlers
        [
            // ping-pong action
            { m: message.PING_PONG, a: pingPong, args: [logger] },

            // account generation action
            {
                m: message.GENERATE_ADDRESS,
                a: generateAddress, args: [logger, context],
            },

            // account association action
            {
                m: message.ASSOCIATE_ADDRESS,
                a: associateAddress, args: [logger],
            },

            // signing keys generation action
            {
                m: message.GENERATE_SIGNING_KEYS,
                a: generateSigningKeys, args: [logger],
            },

            // automatic keys association action
            {
                m: message.GENERATE_SIGNED_KEY_ASSOC_TX,
                a: generateSignedKeyAssocTx, args: [logger, context],
            },

            // manual keys association action
            {
                m: message.GENERATE_KEY_ASSOC_TX,
                a: generateKeyAssocTx, args: [logger],
            },

            // public keys retrieval action
            { m: message.GET_PUBLIC_KEYS, a: getPublicKeys, args: [logger] },

            // backup action
            { m: message.BACKUP, a: backup, args: [logger] },

            // restore action
            { m: message.RESTORE, a: restore, args: [logger] },

            // transaction signing check
            { m: message.CAN_SIGN_FOR, a: canSignFor, args: [logger] },

            // sign transaction action
            {
                m: message.SIGN_TRANSACTION,
                a: signTransaction, args: [logger],
            },

        ].forEach((ad) => messageHandler.handle(
            ad.m, func.curry(ad.a)(postMessageBinder(ad.m))(...ad.args)()
        ))




        // report readiness
        messageHandler.postMessage(message.READY, {
            hash: codec.bytesToHex(salt64()),
        })

    })

}
