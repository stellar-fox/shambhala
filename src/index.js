/**
 * Shambhala.
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */

import {
    asyncRepeat,
    delay,
    draw,
    timeUnit,
} from "@xcmats/js-toolbox"




// ...
const
    toy = document.getElementById("toy"),
    emojis = [
        "🎁", "🎀", "😊", "🍺", "💣", "💥", "🔥", "👊",
        "🦊", "👻", "🎶", "🍕", "🚀", "😂", "⚡", "⭐️",
    ]


// ...
console.log("Hi there... 🌴")


// ...
asyncRepeat(
    async () => {
        toy.innerHTML = draw(emojis)
        await delay(timeUnit.second * 0.5)
    },
    () => true
)
