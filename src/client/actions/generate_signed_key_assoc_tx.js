/**
 * Shambhala.
 *
 * Generate signed key association transaction.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import forage from "localforage"
import {
    Keypair,
} from "stellar-sdk"
import {
    func,
    type,
    string,
} from "@xcmats/js-toolbox"
import * as message from "../../lib/messages"




/**
 * Signed key association transaction generation.
 *
 * @function generateSignedKeyAssocTx
 * @param {Object} messageHandler Instance of MessageHandler class.
 * @param {Object} context
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function generateSignedKeyAssocTx (
    messageHandler, context, logger
) {

    return async (p) => {

        let
            G_PUBLIC = null,
            C_PUBLIC = null,
            S_PUBLIC = null

        logger.info("Key association transaction generation requested.")

        // validate received G_PUBLIC,
        // check if it has been associated before
        // and compare it with public part of GKP
        // (implicit check if GKP is present in memory
        // and of appropriate type)
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey();
            (
                { G_PUBLIC, C_PUBLIC, S_PUBLIC } =
                    await forage.getItem(p.G_PUBLIC)
            )
            if (context.GKP.publicKey() !== G_PUBLIC) {
                throw new Error("Wrong G_PUBLIC.")
            }

        } catch (_) {

            // report error
            messageHandler.postMessage(
                message.GENERATE_SIGNED_KEY_ASSOC_TX,
                { error: "client:[invalid or not associated G_PUBLIC]" }
            )

            logger.error("Invalid or not associated G_PUBLIC received.")

            // don't do anything else
            return
        }

        // check received `sequence`
        if (
            !type.isString(p.sequence)  ||
            !p.sequence.split(string.empty())
                .every(func.compose(type.isNumber, Number))
        ) {

            // report error
            messageHandler.postMessage(
                message.GENERATE_SIGNED_KEY_ASSOC_TX,
                { error: "client:[invalid sequence]" }
            )

            logger.error("Invalid sequence received.")

            // don't do anything else if sequence is wrong
            return

        }

        logger.info(
            string.shorten(G_PUBLIC, 11),
            p.sequence,
            string.shorten(C_PUBLIC, 11),
            string.shorten(S_PUBLIC, 11)
        )


        // ...


    }

}
