/**
 * Shambhala (service worker).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




// /* global WorkerGlobalScope */




// greet (FF only)
if (
    typeof self !== "undefined"  &&
    typeof self.console !== "undefined"
) {
    self.console.info("We're in! 👽")
}
