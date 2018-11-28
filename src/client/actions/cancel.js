/**
 * Shambhala.
 *
 * Cancel message action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import { type } from "@xcmats/js-toolbox"




/**
 * Ongoing operation cancel.
 *
 * @function cancel
 * @param {Function} _respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @param {Object} context
 * @returns {Function} Message action.
 */
export default function cancel (_respond, logger, context) {

    return async () => {

        if (type.isObject(context.promptMutex)) {
            context.promptMutex.reject("cancelled")
        }

        if (type.isFunction(context.cancelCurrentOperation)) {
            context.cancelCurrentOperation("cancelled by host")
        }

        logger.warn("host has cancelled current operation")

    }

}
