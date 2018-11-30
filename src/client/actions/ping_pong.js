/**
 * Shambhala.
 *
 * Ping-pong message action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import { utils } from "@xcmats/js-toolbox"
import axios from "axios"
import {
    registrationPath,
    restApiPrefix,
} from "../../config/env"
import { domain as clientDomain } from "../../config/client.json"
import { version } from "../../../package.json"




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
 * @function pingPong
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function pingPong (respond, logger) {

    return async () => {

        logger.info("🔄 🏓")

        respond({ ok: true, version })
        respond({
            backend: await utils.handleRejection(
                async () => (await axios.get(backend)).data
            ),
        })

    }

}
