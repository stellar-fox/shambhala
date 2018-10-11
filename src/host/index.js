/**
 * Shambhala.
 * Host application (playground).
 *
 * @module shambhala-host-app
 * @license Apache-2.0
 */




import {
    asyncRepeat,
    choose,
    delay,
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

import "./index.css"




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


    // expose `s` dev. namespace
    if (devEnv()  &&  isObject(window)) {
        window.s = {
            ...await dynamicImportLibs(),
        }
    }


    // do stuff

    // ...
    window.client = window.open(
        clientDomain + registrationPath + "shambhala.html",
        "shambhala-client"
    )



})




// listen to messages coming from shambhala
window.addEventListener("message", (e) => {

    // don't get fooled by potential messages from others
    if (e.origin !== clientDomain) { return }

    // ...
    logger.info("Shambhala said:", e.data)

    // undertake some action
    choose(e.data, {

        // ...
        "Ping!": () => {
            window.client.postMessage("Hey, ho!", clientDomain)
        },

    })

})
