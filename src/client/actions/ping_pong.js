/**
 * Shambhala.
 *
 * Ping-pong message action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import axios from "axios"
import { sha512 } from "../../lib/cryptops"
import {
    codec,
    func
} from "@xcmats/js-toolbox"
import {
    clientDomain,
    registrationPath,
    restApiPrefix,
} from "../../config/env"




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
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function pingPong (respond, logger) {

    return async () => {

        logger.info("-> PING")

        let resp = await axios.get(backend)

        respond({
            hash: func.compose(
                codec.bytesToHex,
                sha512,
                codec.stringToBytes,
                JSON.stringify
            )(resp.data),
        })

        logger.info("<- PONG")

    }

}
