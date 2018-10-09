/**
 * Shambhala (dev-playground).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import {
    asyncRepeat,
    delay,
    isObject,
    randomInt,
    timeUnit,
} from "@xcmats/js-toolbox"
import { embed } from "./lib/shambhala.sw"
import {
    console,
    drawEmojis,
    dynamicImportLibs,
} from "./lib/utils"
import { serviceWorkerDomain } from "./config/env"

import "../public/index.css"




// console logger
const logger = console("🐧")




// gentle start
window.addEventListener("load", async () => {

    // greet
    logger.info("Hi there! 🌴")


    // do something on screen ...
    const toy = document.getElementById("toy")
    asyncRepeat(async () => {
        toy.innerHTML = drawEmojis(randomInt() % 4 + 1).join(" ")
        await delay(timeUnit.second * 0.8)
    }, () => true)


    // instantiate shambhala
    let shambhala = await embed()


    // expose `s` dev. namespace
    if (isObject(window)) {
        window.s = {
            ...await dynamicImportLibs(),
            shambhala,
        }
    }

})




// listen to messages coming from shambhala
window.addEventListener("message", (e) => {

    // don't get fooled by potential messages from others
    if (e.origin !== serviceWorkerDomain) { return }

    // ...
    logger.info("Shambhala said:", e.data)

})
