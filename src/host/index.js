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
    string,
    timeUnit,
} from "@xcmats/js-toolbox"
import {
    consoleWrapper,
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
const logger = consoleWrapper("💻")




// gentle start
window.addEventListener("load", async () => {

    // greet
    logger.info("Hi there! 🌴")


    // do something...
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


    // do meaningful stuff
    let shambhala = new Shambhala(
        clientDomain + registrationPath + "shambhala.html"
    )

    try {

        // Onboarding - [Variant A]

        logger.info("Requesting account generation...")
        let G_PUBLIC = await shambhala.generateAccount()
        logger.info("Got it:", string.shorten(G_PUBLIC, 11))

        await async.delay(timeUnit.second)

        logger.info("Requesting initial funds...")
        ;((x) => (x))(G_PUBLIC)  // no-op
        await async.delay(0.5 * timeUnit.second)
        logger.info("Done.")

        await async.delay(timeUnit.second)

        logger.info("Requesting signing keys generation...")
        let { C_PUBLIC, S_PUBLIC } =
            await shambhala.generateSigningKeys(G_PUBLIC)
        logger.info(
            "Got them:",
            string.shorten(C_PUBLIC, 11),
            string.shorten(S_PUBLIC, 11)
        )

        await async.delay(timeUnit.second)

        logger.info("Receiving transaction associating keys with account...")
        let tx = await shambhala.generateSignedKeyAssocTX(G_PUBLIC)
        logger.info("It came.")

        await async.delay(timeUnit.second)

        logger.info("Sending transaction to the stellar network.")
        ;((x) => (x))(tx)  // no-op
        await async.delay(0.5 * timeUnit.second)
        logger.info("Sent.")

    } catch (ex) {
        logger.error("Whoops...", ex)
    }

})
