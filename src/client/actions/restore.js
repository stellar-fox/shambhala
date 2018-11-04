/**
 * Shambhala.
 *
 * Restore action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import {
    string,
} from "@xcmats/js-toolbox"




/**
 * Restoring from a backup.
 *
 * @function restore
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function restore (respond, logger) {

    return async (p) => {

        logger.info(`Restore requested for ${string.quote(p.G_PUBLIC)}.`)


        // ...


        // confirm backup restoration
        respond({ error: "NOT IMPLEMENTED" })

        logger.info("Done.")

    }

}
