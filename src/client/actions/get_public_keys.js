/**
 * Shambhala.
 *
 * Get public keys action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import { Keypair } from "stellar-sdk"
import { string } from "@xcmats/js-toolbox"




/**
 * Public keys retrieval.
 *
 * @function getPublicKeys
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Object} forage "localforage" module
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function getPublicKeys (respond, forage, logger) {

    return async (p) => {

        let C_PUBLIC = null, S_PUBLIC = null

        logger.info(`Public keys for ${p.G_PUBLIC} requested.`)




        // validate received G_PUBLIC
        // and check if it has been associated before
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey();
            ({ C_PUBLIC, S_PUBLIC } = await forage.getItem(p.G_PUBLIC))

        } catch (_) {

            // report error
            respond({ error: "client:[invalid or not associated G_PUBLIC]" })
            logger.error("Invalid or not associated G_PUBLIC received.")

            // don't do anything else
            return
        }




        // respond to the host application
        respond({ ok: true, G_PUBLIC: p.G_PUBLIC, C_PUBLIC, S_PUBLIC })
        logger.info(
            "Public keys successfully retrieved:",
            string.shorten(C_PUBLIC, 11),
            string.shorten(S_PUBLIC, 11)
        )

    }

}
