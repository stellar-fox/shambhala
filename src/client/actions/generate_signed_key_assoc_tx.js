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




/**
 * Signed key association transaction generation.
 *
 * @function generateSignedKeyAssocTx
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @param {Object} context
 * @returns {Function} Message action.
 */
export default function generateSignedKeyAssocTx (
    respond, logger, context
) {

    return async (p) => {

        let
            G_PUBLIC = null,
            C_PUBLIC = null,
            S_PUBLIC = null,
            transaction = null

        logger.info("Signed key association transaction generation requested.")




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
            respond({ error: "client:[can't do that]" })

            logger.error("Invalid, not associated G_PUBLIC or no secret.")

            // don't do anything else
            return
        }




        // check received `sequence` and `networkPassphrase`
        if (
            !type.isString(p.sequence)  ||
            !p.sequence.split(string.empty())
                .every(func.flow(Number, type.isNumber))  ||
            !type.isString(p.networkPassphrase)
        ) {

            // report error
            respond({ error: "client:[invalid sequence or network]" })

            logger.error("Invalid sequence or network received.")

            // don't do anything else
            // if `sequence` or `networkPassphrase` is wrong
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
                .addMemo(new Memo(MemoHash, func.pipe(
                    "shambhala genesis transaction - key association"
                )(
                    codec.stringToBytes,
                    sha256,
                    // stellar-sdk uses https://www.npmjs.com/package/buffer
                    // but we're not, so hex-string is used here
                    codec.bytesToHex,
                )))
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
            respond({ error: "client:[transaction build error]" })

            logger.error("Transaction build failed.")

            // don't do anything else
            return

        }

        // [💥] destroy GKP
        delete context.GKP




        // respond to the host application
        respond({
            ok: true,
            tx: func.pipe(transaction)(
                (t) => t.toEnvelope(),
                (e) => e.toXDR(),
                codec.b64enc
            ),
        })

        logger.info("Generated.")

    }

}
