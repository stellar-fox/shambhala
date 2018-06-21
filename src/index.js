/**
 * Shambhala (dev-playground).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */

import {
    asyncRepeat,
    delay,
    randomInt,
    shuffle,
    timeUnit,
} from "@xcmats/js-toolbox"




// ...
const
    toy = document.getElementById("toy"),
    drawEmojis = ((emojis) =>
        (windowSize) => {
            let i = randomInt() % (emojis.length - windowSize)
            return shuffle(emojis).slice(i, i + windowSize).join(" ")
        }
    )([
        "🎁", "🎀", "🎧", "🍺", "💣", "💥", "🔥", "👊",
        "🦊", "👻", "🔨", "🍕", "🚀", "🚗", "⛅️", "🐼",
        "🍷", "🌹", "💰", "📷", "👍", "🍒", "⚽️", "⏳",
    ])


// ...
console.log("Hi there... 🌴")


// ...
asyncRepeat(
    async () => {
        toy.innerHTML = drawEmojis(randomInt() % 4 + 1)
        await delay(timeUnit.second * 0.8)
    },
    () => true
)
