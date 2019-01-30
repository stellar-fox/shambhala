/**
 * Shambhala.
 *
 * Generate address action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import axios from "axios"
import { Keypair } from "stellar-sdk"
import {
    genKeypair,
    mnemonicToSeedHex,
    validateMnemonic,
} from "@stellar-fox/redshift"
import {
    access,
    codec,
    func,
    handleRejection,
    string,
    type,
} from "@xcmats/js-toolbox"
import {
    getMnemonic,
    getPassphrase,
} from "../functions"
import * as message from "../../lib/messages"
import {
    registrationPath,
    restApiPrefix,
} from "../../config/env"
import { domain as clientDomain } from "../../config/client.json"




/**
 * Backend url.
 *
 * @private
 * @constant backend
 */
const backend = clientDomain + registrationPath + restApiPrefix




/**
 * Address generation.
 *
 * @function generateAddress
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Object} thunkActions
 * @param {Object} cryptops "@stellar-fox/cryptops" module
 * @param {Object} forage "localforage" module
 * @param {Function} logger
 * @param {Object} context
 * @returns {Function} Message action.
 */
export default function generateAddress (
    respond,
    {
        setError: ui_setError,
        setSuccess: ui_setSuccess,
    },
    { genUUID }, forage,
    logger, context
) {

    return async () => {

        logger.info("Address generation requested.")




        let G_MNEMONIC = null, PASSPHRASE = null

        // read "genesis" MNEMONIC from the user
        try {
            G_MNEMONIC = String(await getMnemonic())
            if (!validateMnemonic(G_MNEMONIC)) throw new Error("bad mnemonic")
        } catch (ex) {
            respond({ error: `user:[${ex}]` })
            logger.error("User refused to give MNEMONIC. Operation aborted.")
            ui_setError("Mnemonic generation aborted.")

            return
        }

        // read PASSPHRASE from the user
        try {
            PASSPHRASE = String(await getPassphrase())
        } catch (ex) {
            respond({ error: `user:[${ex}]` })
            logger.error("User refused to give PASSPHRASE. Operation aborted.")
            ui_setError("Passphrase generation aborted.")

            return
        }

        // pretend this is UI
        logger.info(
            `(${string.quote(G_MNEMONIC)}, ${string.quote(PASSPHRASE)})`
        )




        // "genesis" key pair generation
        context.GKP = func.pipe(G_MNEMONIC, PASSPHRASE)(
            mnemonicToSeedHex,
            genKeypair,
            (kp) => kp.rawSecretKey(),
            context.fuzz.in
        )

        // [💥] let's say this >>destroys<< G_MNEMONIC and PASSPHRASE
        G_MNEMONIC = null
        PASSPHRASE = null




        let
            // extract user's new public address
            G_PUBLIC = func.pipe(context.GKP)(
                context.fuzz.out,
                Keypair.fromRawEd25519Seed.bind(Keypair),
                (kp) => kp.publicKey()
            ),

            // generate user's new unique identifier
            C_UUID = codec.bytesToHex(genUUID()),

            // store G_PUBLIC and C_UUID in local storage
            localResponse = await handleRejection(
                async () => {
                    await forage.setItem(G_PUBLIC, { G_PUBLIC, C_UUID })
                    return { ok: true }
                },
                async (ex) => ({ error: ex })
            )

        // something went wrong - data is not stored locally
        if (!type.toBool(localResponse.ok)) {

            // report error
            respond({ error: "client:[failure]" })
            logger.error(
                "Address generation failure.",
                localResponse.error
            )
            ui_setError("Address generation client failure.")

            // don't do anything else
            return
        }




        // send G_PUBLIC and C_UUID to the server
        let serverResponse = await handleRejection(
            async () => await axios.post(
                backend + message.GENERATE_ADDRESS,
                { G_PUBLIC, C_UUID }
            ),
            async (ex) => ex.response
        )

        // all went smooth
        if (
            serverResponse.status === 201  &&
            access(serverResponse, ["data", "ok"], false)
        ) {

            // confirm address creation to the host application
            respond({ ok: true, G_PUBLIC })
            logger.info(
                "Address successfully generated:",
                G_PUBLIC
            )
            ui_setSuccess("Address generated.")

        // unfortunately - an error occured
        } else {

            // rollback all locally saved data (ignore any errors)
            await handleRejection(
                async () => await forage.removeItem(G_PUBLIC)
            )

            // report error
            respond({ error: `server:[${serverResponse.status}]` })
            logger.error(
                "Address generation failure.",
                serverResponse.data.error
            )
            ui_setError("Address generation server failure.")

        }

    }

}
