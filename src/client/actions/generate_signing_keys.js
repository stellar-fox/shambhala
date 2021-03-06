/**
 * Shambhala.
 *
 * Generate signing keys action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import axios from "axios"
import { Keypair } from "stellar-sdk"
import {
    codec,
    string,
    struct,
    type,
    utils,
} from "@xcmats/js-toolbox"
import { getPin } from "../functions"
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
 * Signing keys generation.
 *
 * @function generateSigningKeys
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Object} thunkActions
 * @param {Object} cryptops "@stellar-fox/cryptops" module
 * @param {Object} forage "localforage" module
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function generateSigningKeys (
    respond,
    {
        setError: ui_setError,
        setSuccess: ui_setSuccess,
        setProgress: ui_setProgress,
    },
    { deriveKey, encrypt, salt64 }, forage,
    logger
) {

    return async (p) => {

        let G_PUBLIC = null, C_UUID = null

        logger.info("Signing keys generation requested.")




        // validate received G_PUBLIC
        // and check if it has been associated before
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey()
            let lsData = await forage.getItem(p.G_PUBLIC);
            ({ G_PUBLIC, C_UUID } = lsData)

            // do not engage the generation procedure if signing keys
            // has been already generated
            if (
                type.isString(lsData.C_PUBLIC)  &&
                type.isString(lsData.S_PUBLIC)
            ) {
                // report error
                respond({ error: "client:[signing keys already generated]" })
                logger.error("Signing keys has been already generated before.")
                ui_setError("Signing keys has been already generated before.")

                // don't do anything else
                return
            }

        } catch (_) {

            // report error
            respond({ error: "client:[invalid or not associated G_PUBLIC]" })
            logger.error("Invalid or not associated G_PUBLIC received.")
            ui_setError("Invalid or not associated G_PUBLIC received.")

            // don't do anything else
            return
        }




        logger.info(
            string.shorten(G_PUBLIC, 11),
            string.shorten(C_UUID, 7)
        )




        let
            // generate user-specific SALT
            SALT = salt64(),

            PIN = null

        // read PIN from the user
        try {
            PIN = String(await getPin())
        } catch (ex) {
            respond({ error: `user:[${ex}]` })
            logger.error("User refused to give PIN. Operation aborted.")
            ui_setError("Signing keys generation aborted.")

            return
        }

        // pretend this is UI
        logger.info("PIN:", PIN)




        // inform UI of actual progress state
        ui_setProgress(0)

        let
            // compute S_KEY
            S_KEY = await deriveKey(
                codec.stringToBytes(PIN), SALT,
                { progressCallback: (p) => ui_setProgress(0.5 * p) && false }
            ),

            // send S_KEY to the server
            serverResponse = await utils.handleRejection(
                async () => await axios.post(
                    backend + message.GENERATE_SIGNING_KEYS,
                    {
                        G_PUBLIC, C_UUID,
                        S_KEY: codec.b64enc(S_KEY),
                        AUTH_TOKEN: p.AUTH_TOKEN,
                    }
                ),
                async (ex) => ex.response
            )

        // [💥] destroy PIN and S_KEY
        PIN = null
        S_KEY = null

        // unfortunately - an error occured
        if (
            serverResponse.status !== 201  ||
            !struct.access(serverResponse, ["data", "ok"], false)
        ) {

            // report error
            respond({ error: `server:[${serverResponse.status}]` })
            logger.error(
                "Signing keys generation failure.",
                serverResponse.data.error
            )
            ui_setError(string.capitalize(serverResponse.data.error) + ".")

            // do nothing more
            return

        }




        let

            // compute C_KEY using C_PASSPHRASE from the server ...
            C_KEY = await deriveKey(
                codec.b64dec(serverResponse.data.C_PASSPHRASE),
                SALT,
                {
                    progressCallback: (p) =>
                        ui_setProgress(0.5 + 0.5 * p) && false,
                }
            ),

            // ... and receive S_PUBLIC
            { S_PUBLIC } = serverResponse.data

        // [💥] destroy C_PASSPHRASE (it was needed only to derive C_KEY)
        delete serverResponse.data.C_PASSPHRASE




        let
            // generate C_SECRET
            C_SECRET = Keypair.random().secret(),

            // compute ENC_CKP
            ENC_CKP = encrypt(
                C_KEY,
                codec.stringToBytes(C_SECRET)
            )

        // [💥] destroy C_KEY
        C_KEY = null

        // extract C_PUBLIC from C_SECRET
        let C_PUBLIC = Keypair.fromSecret(C_SECRET).publicKey()

        // [💥] destroy C_SECRET
        C_SECRET = null




        // store all needed data in local storage
        let localResponse = await utils.handleRejection(
            async () => {
                await forage.setItem(
                    G_PUBLIC,
                    {
                        G_PUBLIC, C_UUID,
                        C_PUBLIC, S_PUBLIC,
                        SALT: codec.b64enc(SALT),
                        ENC_CKP: codec.b64enc(ENC_CKP),
                    }
                )
                return { ok: true }
            },
            async (ex) => ({ error: ex })
        )

        // something went wrong - data is not stored locally
        if (!type.toBool(localResponse.ok)) {

            // TODO / CONSIDER:
            // rollback server-side changes

            // report error
            respond({ error: "client:[failure]" })
            logger.error(
                "Signing keys generation failure.",
                localResponse.error
            )
            ui_setError("Signing keys generation failure.")

        // all ok
        } else {

            // respond to the host application
            respond({ ok: true, C_PUBLIC, S_PUBLIC })
            logger.info(
                "Signing keys successfully generated:",
                string.shorten(C_PUBLIC, 11),
                string.shorten(S_PUBLIC, 11)
            )
            ui_setSuccess("Keys successfully generated.")

        }

    }

}
