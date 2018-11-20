/**
 * Shambhala.
 *
 * Heartnbeat message action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




/**
 * Heartbeat.
 *
 * @function heartbeat
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function heartbeat (respond, logger) {

    return async () => {

        logger.info("❤")
        respond({ message: "still alive" })

    }

}
