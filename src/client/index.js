/**
 * Shambhala.
 *
 * Client application (frontend-logic-controller).
 *
 * @module client-app
 * @license Apache-2.0
 */




import {
    array,
    async,
    func,
    string,
    struct,
    type,
    utils,
} from "@xcmats/js-toolbox"
import forage from "localforage"
import {
    devOriginWhitelist,
    entrypoint,
    registrationPath,
    restApiPrefix,
} from "../config/env"
import { domain as clientDomain } from "../config/client.json"
import { version } from "../../package.json"
import * as message from "../lib/messages"

import axios from "axios"
import MessageHandler from "../lib/message.handler"
import {
    consoleWrapper,
    miniHash,
} from "../lib/utils"
import { dynamicImportLibs } from "../lib/dynamic.import"
import * as functions from "./functions"

import "./index.css"




/**
 * Run "main" function in browser on "load" event.
 *
 * @param {Function} main
 */
const run = (main) => {
    if (
        type.isObject(window)  &&
        type.isFunction(window.addEventListener)
    ) {
        window.addEventListener("load", main)
    }
}




/**
 * Extract default export from a module.
 *
 * @param {Object} m
 * @returns {any}
 */
const mDef = (m) => m.default




// gentle start
run(async () => {

    const
        // local memory, volatile context/store
        context = {},

        // console logger
        logger = consoleWrapper("🎭"),

        // backend url
        backend = clientDomain + registrationPath + restApiPrefix




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
    const messageHandler = new MessageHandler(originDict[hostDomainHash])
    messageHandler.setRecipient(window.opener, "root")

    // expose message handler
    if (utils.devEnv() && window.sf) {
        window.sf.messageHandler = messageHandler
    }

    // attach all handlers to messageHandler allowing actions to execute
    // in response to messages - lazy logic load
    logger.info("Attaching handlers... ⏳");
    (await import(/* webpackChunkName: "handlers" */ "./handlers").then(mDef))(
        message, logger, forage, context, messageHandler,
        {
            cancellable: async.cancellable,
            curry: func.curry,
            identity: func.identity,
            isString: type.isString,
            partial: func.partial,
            quote: string.quote,
        }
    )




    // report readiness
    messageHandler.postMessage(message.READY, { version })
    logger.info("Ready! ✅")

})
