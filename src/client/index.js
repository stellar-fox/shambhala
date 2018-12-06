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
import { install as newMuiStylesApi } from "@material-ui/styles"
import {
    consoleAugmenter,
    consoleWrapper,
    mDef,
    miniHash,
    run,
} from "../lib/utils"
import {
    devOriginWhitelist,
    entrypoint,
    homepage,
    registrationPath,
    restApiPrefix,
} from "../config/env"
import { fancyDelay } from "../config/frontend"
import { domain as clientDomain } from "../config/client.json"
import { version } from "../../package.json"
import * as message from "../lib/messages"




/**
 * Some code splitting for a libraries.
 *
 * @async
 * @function importLibs
 * @returns {Object}
 */
const importLibs = async () => ({
    axios: await import(
        /* webpackChunkName: "axs" */
        "axios"
    ).then(mDef),
    cryptops: await import(
        /* webpackChunkName: "cps" */
        "@stellar-fox/cryptops"
    ),
    functions: await import(
        /* webpackChunkName: "fns" */
        "./functions"
    ),
    MessageHandler: await import(
        /* webpackChunkName: "mh" */
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
        /* webpackChunkName: "rs" */
        "@stellar-fox/redshift"
    ),
    stellar: await import(
        /* webpackChunkName: "slr" */
        "stellar-sdk"
    ),
    toolbox: await import(
        /* webpackChunkName: "tbx" */
        "@xcmats/js-toolbox"
    ),
    txops: await import(
        /* webpackChunkName: "tps" */
        "../lib/txops"
    ),
    utils: await import(
        /* webpackChunkName: "ut" */
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




    // Switch from default material-ui style implementation to the newest one.
    // Temporary call enabling hooks api - has to be invoked before
    // any of the material-ui component is imported
    // https://material-ui.com/css-in-js/basics/#migration-for-material-ui-core-users
    newMuiStylesApi()

    // load and run User Interface
    let
        { store, thunks }  = await (await import(
            /* webpackChunkName: "ui" */
            "./ui/main"
        ).then(mDef))(logger, context),
        uiLogger = consoleAugmenter(logger, (_, ...args) =>
            store.dispatch(thunks.setInfoMessage(
                args.map((a) => String(a)).join(string.space())
            ))
        )




    // lazy-load some heavy libs
    uiLogger.info("Loading libs... ⏳")
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
    uiLogger.info("Getting origin whitelist... ⏳")
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
    uiLogger.info("Attaching handlers... ⏳");
    (await import(
        /* webpackChunkName: "hns" */
        "./handlers"
    ).then(mDef))(
        uiLogger, context, messageHandler,
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




    // report readiness:

    // 1. let host know (cross-window communication)
    messageHandler.postMessage(message.READY, { ok: true, version })

    // 2. let user know (UI)
    store.dispatch(thunks.setAppReady(true, fancyDelay))

    // 3. let dev know (console)
    uiLogger.info("Ready! ✅")

})
