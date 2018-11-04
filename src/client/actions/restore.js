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
import * as message from "../../lib/messages"




/**
 * Restoring from a backup.
 *
 * @function restore
 * @param {Object} messageHandler Instance of MessageHandler class.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function restore (messageHandler, logger) {

    return async (p) => {

        logger.info(`Restore requested for ${string.quote(p.G_PUBLIC)}.`)


        // ...


        // confirm backup restoration
        messageHandler.postMessage(
            message.RESTORE,
            { error: "NOT IMPLEMENTED" }
        )

        logger.info("Done.")

    }

}
