/**
 * Shambhala.
 *
 * Can any transaction be signed for a given account?
 *
 * @module client-actions
 * @license Apache-2.0
 */




import forage from "localforage"
import { Keypair } from "stellar-sdk"
import { func } from "@xcmats/js-toolbox"




/**
 * Transaction signing - check.
 *
 * @function canSignFor
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function canSignFor (respond, logger) {

    return async (p) => {

        logger.info("Transaction signing capabilities check requested.")




        // validate received G_PUBLIC
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey()

        } catch (_) {

            // report error
            respond({ error: "client:[invalid G_PUBLIC]" })

            logger.error("Invalid G_PUBLIC received.")

            // don't do anything else
            return
        }




        // try to read from local storage all necessary entries
        try {

            let {
                G_PUBLIC, C_UUID, SALT, ENC_CKP,
            } = await forage.getItem(p.G_PUBLIC)

            func.identity({ C_UUID, SALT, ENC_CKP })

            // respond to the host application
            respond({
                ok: true,
                answer: true,
            })

            logger.info(`Yay! Can sign for ${G_PUBLIC}.`)

        } catch (_) {

            // respond to the host application
            respond({
                ok: true,
                answer: false,
            })

            logger.info(`Oh no. Can't sign for ${p.G_PUBLIC}.`)
        }

    }

}
