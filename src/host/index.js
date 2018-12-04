/**
 * Shambhala.
 *
 * Host application (playground).
 *
 * @module host-app
 * @license Apache-2.0
 */




import {
    async,
    math,
    string,
    utils,
} from "@xcmats/js-toolbox"
import {
    consoleWrapper,
    drawEmojis,
    mDef,
    run,
} from "../lib/utils"

import "./index.css"




/**
 * Some code splitting for a libraries.
 *
 * @async
 * @function importLibs
 * @returns {Object}
 */
const importLibs = async () => ({
    shambhala: await import(
        /* webpackChunkName: "shc" */
        "../lib/shambhala.client"
    ),
})




/**
 * Development environment libraries.
 *
 * @async
 * @function devEnvLibs
 * @returns {Object}
 */
const devEnvLibs = async () => ({
    axios: await import(
        /* webpackChunkName: "axs" */
        "axios"
    ).then(mDef),
    cryptops: await import(
        /* webpackChunkName: "cps" */
        "@stellar-fox/cryptops"
    ),
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
        // local memory, volatile context/store
        context = {},

        // console logger
        logger = consoleWrapper("💻")




    // greet
    logger.info("Hi there! 🌴")




    // lazy-load some heavy libs
    logger.info("Loading libs... ⏳")
    const {
        shambhala: { shambhalaTestingModule },
    } = await importLibs()




    // all basic shambhala elements in action
    const testing = shambhalaTestingModule(logger, context)




    // expose `sf` dev. namespace
    // and some convenience shortcuts
    if (utils.devEnv()) {
        window.sf = {
            ...await devEnvLibs(),
            context, logger, testing,
        }
        window.to_ = utils.to_
    }




    // entertain...
    const toy = document.getElementById("toy")
    async.repeat(async () => {
        toy.innerHTML =
            drawEmojis(math.randomInt() % 4 + 1).join(string.space())
        await async.delay(0.8 * utils.timeUnit.second)
    }, () => true)




    // do meaningful stuff
    await testing.setEnv()
    await testing.instantiate()
    await context.shambhala.open()




    // instruct what to do next
    logger.info(
        `Try one of these:${string.nl()}`,
        Object.keys(testing.scenario).map(
            (n) => `sf.testing.scenario.${n}()`
        ).join(`${string.nl()}${string.space()}`)
    )
    logger.info("Ready! ✅")

})
