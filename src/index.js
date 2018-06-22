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
import { register as registerShambhala } from "./shambhala"
import {
    drawEmojis,
    dynamicImportLibs,
} from "./utils"




// greet
console.info("Hi there... 🌴")


// do something...
const toy = document.getElementById("toy")
asyncRepeat(
    async () => {
        toy.innerHTML = drawEmojis(randomInt() % 4 + 1).join(" ")
        await delay(timeUnit.second * 0.8)
    },
    () => true
)


// expose 's' dev. namespace
if (isObject(window)) (
    async () => { window.s = await dynamicImportLibs() }
)()




// juice
registerShambhala()
