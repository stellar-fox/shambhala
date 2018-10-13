/**
 * Shambhala.
 * Host application (playground).
 *
 * @module shambhala-host-app
 * @license Apache-2.0
 */




import {
    async,
    choose,
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

    // ...
    window.client = window.open(
        clientDomain + registrationPath + "shambhala.html",
        "shambhala-client"
    )



})




// ...
const shambhalaPacketReceiver = (e) => {

    // don't get fooled by potential messages from others
    if (e.origin !== clientDomain) { return }

    // packet of data
    let packet = JSON.parse(e.data)

    // undertake some action
    choose(packet.message, {

        // ...
        "Ping!": () => {
            logger.info("Shambhala is live and kickin' :)")
            window.client.postMessage(
                JSON.stringify({ message: "Hey, ho!" }),
                clientDomain
            )
        },

        // ...
        "I hear ya!": () => {
            logger.info(
                "That's the data from shambhala:",
                packet.payload
            )
        },

    }, () => logger.info("Shambhala send this:", packet))

}


// listen to messages coming from shambhala
window.addEventListener("message", shambhalaPacketReceiver)
