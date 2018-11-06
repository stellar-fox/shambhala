/**
 * Shambhala.
 *
 * Sign transaction action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import axios from "axios"
import forage from "localforage"
import {
    decrypt,
    deriveKey,
} from "../../lib/cryptops"
import {
    inspectTSP,
    signTSP,
} from "../../lib/txops"
import { Keypair } from "stellar-sdk"
import {
    access,
    codec,
    handleRejection,
    string,
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
 * Transaction signing.
 *
 * @function signTransaction
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function signTransaction (respond, logger) {

    return async (p) => {

        let
            G_PUBLIC = null, TX_PAYLOAD = null,
            C_UUID = null, SALT = null, ENC_CKP = null

        logger.info("Transaction signatures requested.")




        // validate received G_PUBLIC, check if it has been associated before,
        // try to read from local storage all necessary entries
        // and try to decode TX_PAYLOAD
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey();
            (
                {
                    G_PUBLIC,
                    C_UUID, SALT, ENC_CKP,
                } = await forage.getItem(p.G_PUBLIC)
            )
            TX_PAYLOAD = codec.b64dec(p.TX_PAYLOAD)

        } catch (_) {

            // report error
            respond({ error: "client:[invalid G_PUBLIC or TX_PAYLOAD]" })

            logger.error("Invalid G_PUBLIC or TX_PAYLOAD received.")

            // don't do anything else
            return
        }




        logger.info(
            string.shorten(G_PUBLIC, 11),
            string.shorten(C_UUID, 7),
            inspectTSP(TX_PAYLOAD)
        )




        // PIN - will be read from the user
        let PIN = string.random(5, string.digits())

        // pretend this is UI
        logger.info("PIN:", PIN)




        // compute S_KEY
        let S_KEY = await deriveKey(
            codec.stringToBytes(PIN), SALT
        )

        // send S_KEY with TX_PAYLOAD to the server
        let serverResponse = await handleRejection(
            async () => await axios.post(
                backend + message.SIGN_TRANSACTION,
                {
                    G_PUBLIC, C_UUID,
                    S_KEY: codec.b64enc(S_KEY),
                    TX_PAYLOAD: p.TX_PAYLOAD,
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
                "Transaction signing failure.",
                serverResponse.data.error
            )

            // do nothing more
            return

        }




        let
            // receive C_PASSPHRASE
            C_PASSPHRASE = codec.b64dec(serverResponse.data.C_PASSPHRASE),

            // compute C_KEY
            C_KEY = await deriveKey(C_PASSPHRASE, SALT)

        // [💥] destroy C_PASSPHRASE
        C_PASSPHRASE = null




        // decrypt C_SECRET
        let C_SECRET = decrypt(C_KEY, codec.b64dec(ENC_CKP))

        // [💥] destroy C_KEY
        C_KEY = null

        // sign TX_PAYLOAD with C_SECRET
        let C_SIGNATURE = signTSP(C_SECRET, TX_PAYLOAD)

        // [💥] destroy C_SECRET
        C_SECRET = null




        // respond to the host application
        respond({
            ok: true,
            C_SIGNATURE: codec.b64enc(C_SIGNATURE),
            S_SIGNATURE: serverResponse.data.S_SIGNATURE,
        })

        logger.info("Transaction signatures succesfully generated")

    }

}
