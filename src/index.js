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
    timeout,
    timeUnit,
} from "@xcmats/js-toolbox"
import {
    console,
    drawEmojis,
    dynamicImportLibs,
} from "./utils"
import { register as registerShambhala } from "./shambhala"




// console logger
const logger = console("🐧")


// greet
logger.info("Hi there! 🌴")


// do something...
const toy = document.getElementById("toy")
asyncRepeat(async () => {
    toy.innerHTML = drawEmojis(randomInt() % 4 + 1).join(" ")
    await delay(timeUnit.second * 0.8)
}, () => true)


// expose `s` dev. namespace
if (isObject(window)) (async () => {
    window.s = await dynamicImportLibs()
})()


// fresh juice
registerShambhala(logger)
    .then((pageIsControlled) => {
        if (!pageIsControlled) {
            logger.warn("Reloading...")
            timeout(() => history.go("/"))
        }
    })
    .catch((e) =>
        logger.error("Registration failed: ", e)
    )
