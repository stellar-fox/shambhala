/**
 * Shambhala.
 *
 * Generate signing keys action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import axios from "axios"
import forage from "localforage"
import {
    deriveKey,
    encrypt,
    salt64,
} from "../../lib/cryptops"
import { Keypair } from "stellar-sdk"
import {
    access,
    codec,
    handleRejection,
    string,
    toBool,
} from "@xcmats/js-toolbox"
import {
    clientDomain,
    registrationPath,
    restApiPrefix,
} from "../../config/env"
import * as message from "../../lib/messages"




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
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function generateSigningKeys (respond, logger) {

    return async (p) => {

        let G_PUBLIC = null, C_UUID = null

        logger.info("Signing keys generation requested.")




        // validate received G_PUBLIC
        // and check if it has been associated before
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey();
            ({ G_PUBLIC, C_UUID } = await forage.getItem(p.G_PUBLIC))

        } catch (_) {

            // report error
            respond({ error: "client:[invalid or not associated G_PUBLIC]" })

            logger.error("Invalid or not associated G_PUBLIC received.")

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

            // PIN - will be read from the user
            PIN = string.random(5, string.digits())

        // pretend this is UI
        logger.info("PIN:", PIN)




        let
            // compute S_KEY
            S_KEY = await deriveKey(
                codec.stringToBytes(PIN), SALT
            ),

            // send S_KEY to the server
            serverResponse = await handleRejection(
                async () => await axios.post(
                    backend + message.GENERATE_SIGNING_KEYS,
                    {
                        G_PUBLIC, C_UUID,
                        S_KEY: codec.b64enc(S_KEY),
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
            !access(serverResponse, ["data", "ok"], false)
        ) {

            // report error
            respond({ error: `server:[${serverResponse.status}]` })

            logger.error(
                "Signing keys generation failure.",
                serverResponse.data.error
            )

            // do nothing more
            return

        }




        let
            // receive C_PASSPHRASE ...
            { S_PUBLIC } = serverResponse.data,

            // ... and S_PUBLIC from the server
            C_PASSPHRASE = codec.b64dec(serverResponse.data.C_PASSPHRASE),

            // compute C_KEY
            C_KEY = await deriveKey(C_PASSPHRASE, SALT)

        // [💥] destroy C_PASSPHRASE
        C_PASSPHRASE = null




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
        let localResponse = await handleRejection(
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
        if (!toBool(localResponse.ok)) {

            // TODO / CONSIDER:
            // rollback server-side changes

            // report error
            respond({ error: "client:[failure]" })

            logger.error(
                "Signing keys generation failure.",
                localResponse.error
            )

        // all ok
        } else {

            // respond to the host application
            respond({ ok: true, C_PUBLIC, S_PUBLIC })

            logger.info(
                "Signing keys succesfully generated:",
                string.shorten(C_PUBLIC, 11),
                string.shorten(S_PUBLIC, 11)
            )

        }

    }

}
