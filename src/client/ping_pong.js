/**
 * Shambhala.
 *
 * Ping-pong message action.
 *
 * @module shambhala-client-actions
 * @license Apache-2.0
 */




import axios from "axios"
import * as cryptops from "../lib/cryptops"
import {
    codec,
    func
} from "@xcmats/js-toolbox"
import {
    clientDomain,
    registrationPath,
    restApiPrefix,
} from "../config/env"
import * as message from "../lib/messages"




/**
 * Backend url.
 *
 * @private
 * @constant backend
 */
const backend = clientDomain + registrationPath + restApiPrefix




/**
 * Ping-pong.
 *
 * @function pingPongAction
 * @param {Object} messageHandler Instance of MessageHandler class.
 * @param {Object} context
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function pingPong (messageHandler, _context, logger) {

    return async () => {

        logger.info("-> PING")

        let resp = await axios.get(backend)

        messageHandler.postMessage(
            message.PONG,
            {
                hash: func.compose(
                    codec.bytesToHex,
                    cryptops.sha512,
                    codec.stringToBytes,
                    JSON.stringify
                )(resp.data),
            }
        )

        logger.info("<- PONG")

    }

}
