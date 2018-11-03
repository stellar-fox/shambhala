/**
 * Shambhala.
 *
 * Backup action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import {
    codec,
    func,
    string,
} from "@xcmats/js-toolbox"
import * as message from "../../lib/messages"




/**
 * Backup dumping.
 *
 * @function backup
 * @param {Object} messageHandler Instance of MessageHandler class.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function backup (messageHandler, logger) {

    return async (p) => {

        logger.info(`Backup requested for ${string.quote(p.G_PUBLIC)}.`)


        // ...


        // send encrypted backup to the host application
        messageHandler.postMessage(
            message.BACKUP,
            {
                ok: true,
                payload: func.compose(
                    codec.b64enc,
                    codec.stringToBytes
                )("NOT IMPLEMENTED"),
            }
        )

        logger.info("Done.")

    }

}
