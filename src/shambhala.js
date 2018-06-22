/**
 * Shambhala (library).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




/**
 * Register shambhala service worker.
 *
 * @function register
 */
export const register = () => {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            console.info("Registering...")
            navigator.serviceWorker
                .register("static/sw.bundle.js")
                .then((r) => {
                    console.info("Registration successful: ", r.scope)
                })
                .catch((e) => {
                    console.error("Registration failed: ", e)
                })
        })
    }
}
