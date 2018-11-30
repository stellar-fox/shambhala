/**
 * Shambhala.
 *
 * Close message action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




/**
 * Close.
 *
 * @function close
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function close (respond, logger) {

    return async () => {

        logger.info("⛔")

        respond({ ok: true })
        window.close()

    }

}
