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
    Account,
    Keypair,
    Memo,
    MemoHash,
    Network,
    Operation,
    TransactionBuilder,
} from "stellar-sdk"
import { sha256 } from "../../lib/cryptops"
import {
    codec,
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
            S_PUBLIC = null,
            transaction = null


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


        // check received `sequence` and `networkPassphrase`
        if (
            !type.isString(p.sequence)  ||
            !p.sequence.split(string.empty())
                .every(func.compose(type.isNumber, Number))  ||
            !type.isString(p.networkPassphrase)
        ) {

            // report error
            messageHandler.postMessage(
                message.GENERATE_SIGNED_KEY_ASSOC_TX,
                { error: "client:[invalid sequence or network]" }
            )

            logger.error("Invalid sequence or network received.")

            // don't do anything else if sequence is wrong
            return

        }


        logger.info(
            string.shorten(G_PUBLIC, 11),
            p.sequence,
            string.quote(p.networkPassphrase),
            string.shorten(C_PUBLIC, 11),
            string.shorten(S_PUBLIC, 11)
        )


        // use appropriate network
        Network.use(new Network(p.networkPassphrase))

        // build key association transaction
        try {

            transaction = new TransactionBuilder(
                new Account(G_PUBLIC, p.sequence)
            )
                .addMemo(new Memo(MemoHash, func.compose(
                    // stellar-sdk uses https://www.npmjs.com/package/buffer
                    // but we're not, so hex-string is used here
                    codec.bytesToHex, sha256, codec.stringToBytes
                )("shambhala genesis transaction - key association")))
                .addOperation(Operation.setOptions({
                    masterWeight: 100,
                    lowThreshold: 20,
                    medThreshold: 20,
                    highThreshold: 40,
                    signer: {
                        ed25519PublicKey: C_PUBLIC,
                        weight: 10,
                    },
                }))
                .addOperation(Operation.setOptions({
                    signer: {
                        ed25519PublicKey: S_PUBLIC,
                        weight: 10,
                    },
                }))
                .build()

            // sign the transaction with MASTER KEY ("genesis" keypair)
            transaction.sign(context.GKP)

        } catch (_) {

            // report error
            messageHandler.postMessage(
                message.GENERATE_SIGNED_KEY_ASSOC_TX,
                { error: "client:[transaction build error]" }
            )

            logger.error("Transaction build failed.")

            // don't do anything else
            return

        }

        // [💥] destroy GKP
        delete context.GKP

        // respond to the host application
        messageHandler.postMessage(
            message.GENERATE_SIGNED_KEY_ASSOC_TX,
            { ok: true, tx: codec.b64enc(transaction.toEnvelope().toXDR()) }
        )

        logger.info("Generated.")

    }

}
