/**
 * Shambhala.
 *
 * Client application (frontend-logic-controller).
 *
 * @module client-app
 * @license Apache-2.0
 */




import axios from "axios"
import {
    array,
    codec,
    func,
    string,
    struct,
    type,
    utils,
} from "@xcmats/js-toolbox"
import { salt64 } from "@stellar-fox/cryptops"
import MessageHandler from "../lib/message.handler"
import {
    consoleWrapper,
    miniHash,
} from "../lib/utils"
import { dynamicImportLibs } from "../lib/dynamic.import"
import * as functions from "./functions"
import {
    devOriginWhitelist,
    clientDomain,
    entrypoint,
    registrationPath,
    restApiPrefix,
} from "../config/env"
import * as message from "../lib/messages"

import heartbeat from "./actions/heartbeat"
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
    logger = consoleWrapper("🎭"),

    // backend url
    backend = clientDomain + registrationPath + restApiPrefix




// gentle start
if (type.isObject(window) && type.isFunction(window.addEventListener)) {

    window.addEventListener("load", async () => {

        // if there is no parent - there is nothing to do
        if (!window.opener) {
            logger.error("What are you looking for?")
            window.location.replace("https://stellarfox.net/")
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

        let
            // get claimed origin (domain of the host application)
            hostDomainHash = window.location.search.slice(1),

            // get origin whitelist
            originWhitelist = array.removeDuplicates(
                struct.access(
                    await axios.get(backend + entrypoint.WHITELIST),
                    ["data", "whitelist"], []
                ).concat(
                    // in devEnv allow also connections from 'dev' origins
                    utils.devEnv(true) ? devOriginWhitelist : []
                )
            ),

            // build 'miniHash' -> 'origin' dictionary
            originDict = struct.dict(
                originWhitelist.map((origin) => [miniHash(origin), origin])
            )

        // do whitelist check (don't worry if somebody just lied
        // about it's true location - messages won't work
        // in such case anyway)
        if (!type.isString(originDict[hostDomainHash])) {
            logger.warn("Domain not whitelisted.")
            window.location.replace("https://stellarfox.net/")
            return
        }

        // instantiate message handler
        const
            messageHandler = new MessageHandler(originDict[hostDomainHash]),
            postMessageBinder = func.partial(messageHandler.postMessage)
        messageHandler.setRecipient(window.opener, "root")

        // expose message handler
        if (utils.devEnv() && window.sf) {
            window.sf.messageHandler = messageHandler
        }




        // message handlers array
        [
            // heartbeat action
            { m: message.HEARTBEAT, a: heartbeat, args: [logger] },

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
                a: generateSigningKeys, args: [logger, context],
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
                a: signTransaction, args: [logger, context],
            },

        // for each "action definition" (ad) ...
        ].forEach((ad) => {
            let
                // ... prepare message responder ...
                respond = postMessageBinder(ad.m),

                // ... and create action with appropriate parameters bound
                act = func.curry(ad.a)(respond)(...ad.args)()

            // attach augmented action (act) to a message (ad.m):
            // before an action is invoked a check is performed
            // if another action is in progress - in such case a response
            // is formed ({ error: "busy" })
            messageHandler.handle(
                ad.m,
                async (...args) => {
                    if (ad.m !== message.HEARTBEAT) {
                        if (type.isString(context.message)) {
                            logger.warn(
                                string.quote(ad.m),
                                "requested while processing",
                                string.quote(context.message)
                            )
                            return respond({ error: "busy" })
                        }
                        context.message = ad.m
                        try { var x = await act(...args) }
                        finally { delete context.message }
                        return x
                    }
                    return await act(...args)
                }
            )
        })




        // report readiness
        messageHandler.postMessage(message.READY, {
            hash: codec.bytesToHex(salt64()),
        })

    })

}
