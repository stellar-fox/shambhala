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
    devEnv,
    randomInt,
    string,
    type,
    timeUnit,
    to_,
} from "@xcmats/js-toolbox"
import shambhalaTestingModule from "../lib/shambhala.testing"
import {
    consoleWrapper,
    drawEmojis,
} from "../lib/utils"
import { dynamicImportLibs } from "../lib/dynamic.import"

import "./index.css"




const
    // local memory, volatile context/store
    context = {},

    // console logger
    logger = consoleWrapper("💻"),

    // all basic shambhala elements in action
    testing = shambhalaTestingModule(context, logger)




// gentle start
if (type.isObject(window) && window.addEventListener) {

    window.addEventListener("load", async () => {

        // greet
        logger.info("Hi there! 🌴")


        // expose `sf` dev. namespace
        // and some convenience shortcuts
        if (devEnv()) {
            window.sf = {
                ...await dynamicImportLibs(),
                context, logger, testing,
            }
            window.to_ = to_
        }


        // entertain...
        const toy = document.getElementById("toy")
        async.repeat(async () => {
            toy.innerHTML =
                drawEmojis(randomInt() % 4 + 1).join(string.space())
            await async.delay(0.8 * timeUnit.second)
        }, () => true)


        // do meaningful stuff
        await testing.setEnv()
        await testing.instantiate()
        await context.shambhala._openShambhala()


        // instruct what to do next
        logger.info(
            `Try one of these:${string.nl()}`,
            Object.keys(testing.scenario).map(
                (n) => `sf.testing.scenario.${n}()`
            ).join(`${string.nl()}${string.space()}`)
        )

    })

}
