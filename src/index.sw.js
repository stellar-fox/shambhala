/**
 * Shambhala (service worker).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




/* global WorkerGlobalScope */




// greet (FF only)
if (WorkerGlobalScope) {
    WorkerGlobalScope.console.info("We're in! 👽")
}
