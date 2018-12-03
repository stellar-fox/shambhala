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
    homepage,
    registrationPath,
    restApiPrefix,
} from "../config/env"
import { domain as clientDomain } from "../config/client.json"
import { version } from "../../package.json"
import * as message from "../lib/messages"
import {
    consoleWrapper,
    mDef,
    miniHash,
    run,
} from "../lib/utils"




/**
 * Some code splitting for a libraries.
 *
 * @async
 * @function importLibs
 * @returns {Object}
 */
const importLibs = async () => ({
    axios: await import(
        /* webpackChunkName: "axios" */
        "axios"
    ).then(mDef),
    cryptops: await import(
        /* webpackChunkName: "cryptops" */
        "@stellar-fox/cryptops"
    ),
    functions: await import(
        /* webpackChunkName: "functions" */
        "./functions"
    ),
    MessageHandler: await import(
        /* webpackChunkName: "message_handler" */
        "../lib/message.handler"
    ).then(mDef),
})




/**
 * Development environment libraries.
 *
 * @async
 * @function devEnvLibs
 * @returns {Object}
 */
const devEnvLibs = async () => ({
    redshift: await import(
        /* webpackChunkName: "redshift" */
        "@stellar-fox/redshift"
    ),
    stellar: await import(
        /* webpackChunkName: "stellar" */
        "stellar-sdk"
    ),
    toolbox: await import(
        /* webpackChunkName: "toolbox" */
        "@xcmats/js-toolbox"
    ),
    txops: await import(
        /* webpackChunkName: "txops" */
        "../lib/txops"
    ),
    utils: await import(
        /* webpackChunkName: "utils" */
        "../lib/utils"
    ),
})




// gentle start
run(async () => {

    const
        // console logger
        logger = consoleWrapper("🎭"),

        // local memory, volatile context/store
        context = {},

        // backend url
        backend = clientDomain + registrationPath + restApiPrefix




    // greet
    logger.info("Boom! 💥")




    // if there is no parent - there is nothing to do
    if (!window.opener) {
        logger.error("What are you looking for?")
        window.location.replace(homepage)
        return null
    }




    // load and run User Interface
    (await import(
        /* webpackChunkName: "ui_main" */
        "./ui/main"
    ).then(mDef))(logger, context)




    // lazy-load some heavy libs
    logger.info("Loading libs... ⏳")
    const {
        axios,
        cryptops,
        functions,
        MessageHandler,
    } = await importLibs()




    // expose `sf` dev. namespace
    // and some convenience shortcuts
    if (utils.devEnv()) {
        if (!type.isObject(window.sf)) window.sf = {}
        window.sf = {
            ...window.sf,
            axios, cryptops, functions,
            forage, message, logger,
            ...await devEnvLibs(),
        }
        window.to_ = utils.to_
    }
    // strict devEnv check for exposing 'context'
    if (utils.devEnv(true) && type.isObject(window.sf)) {
        window.sf.context = context
    }




    let
        // get claimed origin (domain of the host application)
        hostDomainHash = window.location.search.slice(1),

        originWhitelist = null, originDict = null

    // get origin whitelist
    logger.info("Getting origin whitelist... ⏳")
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
    originDict = func.compose(
        struct.dict, (f) => originWhitelist.map(f)
    )((origin) => [miniHash(cryptops.sha256)(origin), origin])

    // do whitelist check (don't worry if somebody just lied
    // about it's true location - messages won't work
    // in such case anyway)
    if (!type.isString(originDict[hostDomainHash])) {
        logger.warn("Domain not whitelisted.")
        window.location.replace(homepage)
        return
    }





    // instantiate message handler
    const messageHandler = new MessageHandler(originDict[hostDomainHash])
    messageHandler.setRecipient(window.opener, "root")

    // expose message handler
    if (utils.devEnv() && type.isObject(window.sf)) {
        window.sf.messageHandler = messageHandler
    }

    // attach all handlers to messageHandler allowing actions to execute
    // in response to messages - lazy logic load
    logger.info("Attaching handlers... ⏳");
    (await import(
        /* webpackChunkName: "handlers" */
        "./handlers"
    ).then(mDef))(
        logger, context, messageHandler,
        cryptops, forage, message,
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
    messageHandler.postMessage(message.READY, { ok: true, version })
    logger.info("Ready! ✅")

})
