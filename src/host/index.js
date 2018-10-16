/**
 * Shambhala.
 *
 * Host application (playground).
 *
 * @module shambhala-host-app
 * @license Apache-2.0
 */




import {
    async,
    devEnv,
    isObject,
    randomInt,
    timeUnit,
} from "@xcmats/js-toolbox"
import {
    console,
    drawEmojis,
} from "../lib/utils"
import { dynamicImportLibs } from "../lib/dynamic.import"
import {
    clientDomain,
    registrationPath,
} from "../config/env"
import Shambhala from "../lib/shambhala.client"

import "./index.css"




// console logger
const logger = console("🐧")




// gentle start
window.addEventListener("load", async () => {

    // greet
    logger.info("Hi there! 🌴")


    // do something on screen ...
    const toy = document.getElementById("toy")
    async.repeat(async () => {
        toy.innerHTML = drawEmojis(randomInt() % 4 + 1).join(" ")
        await async.delay(timeUnit.second * 0.8)
    }, () => true)


    // expose `s` dev. namespace
    if (devEnv()  &&  isObject(window)) {
        window.s = {
            ...await dynamicImportLibs(),
        }
    }


    // do stuff
    let shambhala = new Shambhala(
        clientDomain + registrationPath + "shambhala.html"
    )
    logger.info("Trying...")
    let G_PUBLIC = await shambhala.generateAccount()
    logger.info("Got it:", G_PUBLIC)

})
