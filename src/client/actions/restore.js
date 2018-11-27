/**
 * Shambhala.
 *
 * Restore action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import forage from "localforage"
import { Keypair } from "stellar-sdk"
import {
    codec,
    handleRejection,
    string,
    type,
} from "@xcmats/js-toolbox"
import { passphraseDecrypt } from "@stellar-fox/cryptops"




/**
 * Unpack binary client data.
 * Much more space-efficient than simple `JSON.stringify`.
 *
 * @param {Uin8Array} data Binary representation of a client data.
 * @returns {Object} Object with all client-data fields.
 */
const unpackClientData = (data) => ({
    // 16 bytes of UUID
    C_UUID: codec.bytesToHex(data.slice(0, 16)),
    // 56 bytes of a _stellar_ public key
    C_PUBLIC: codec.bytesToString(data.slice(16, 72)),
    // 56 bytes of a _stellar_ public key
    S_PUBLIC: codec.bytesToString(data.slice(72, 128)),
    // 64 bytes of salt
    SALT: codec.b64enc(data.slice(128, 192)),
    // rest of the data - encrypted client keypair structure
    ENC_CKP: codec.b64enc(data.slice(192)),
})




/**
 * Restoring from a backup.
 *
 * @function restore
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function restore (respond, logger) {

    return async (p) => {

        logger.info(`Restore requested for ${string.quote(p.G_PUBLIC)}.`)




        // validate received G_PUBLIC
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey()

        } catch (_) {

            // report error
            respond({
                error: "client:[invalid G_PUBLIC]",
            })

            logger.error("Invalid G_PUBLIC received.")

            // don't do anything else
            return
        }




        // BACKUP_PASSPHRASE - will be read from the user
        // this is a constant just for the testing purposes
        let BACKUP_PASSPHRASE = "Some very long and multi-word phrase!"

        // pretend this is UI
        logger.info("BACKUP_PASSPHRASE:", string.quote(BACKUP_PASSPHRASE))




        // attempt decryption
        let
            deciphered = await passphraseDecrypt(
                BACKUP_PASSPHRASE, p.backup
            ),
            unpacked = null




        // check if the deciphered data has any sense
        try {

            unpacked = unpackClientData(deciphered)
            Keypair.fromPublicKey(unpacked.C_PUBLIC).publicKey()
            Keypair.fromPublicKey(unpacked.S_PUBLIC).publicKey()

            // TODO:
            // consider server-checking if given S_PUBLIC and UUID
            // is associated with given G_PUBLIC

            logger.info(unpacked)

        } catch (_) {

            // report error
            respond({
                error: "client:[decryption not possible or garbage received]",
            })

            logger.info("(Epic) fail.")

            // don't do anything else
            return
        }




        // store all needed data in the local storage
        let localResponse = await handleRejection(
            async () => {
                await forage.setItem(p.G_PUBLIC, {
                    G_PUBLIC: p.G_PUBLIC,
                    ...unpacked,
                })
                return { ok: true }
            },
            async (ex) => ({ error: ex })
        )

        // something went wrong - data is not stored locally
        if (!type.toBool(localResponse.ok)) {

            // report error
            respond({ error: "client:[local storage failure]" })

            logger.error(
                "Restoring from backup has failed.",
                localResponse.error
            )

        // all ok
        } else {

            // respond to the host application
            respond({
                ok: true,
                C_PUBLIC: unpacked.C_PUBLIC,
                S_PUBLIC: unpacked.S_PUBLIC,
            })

            logger.info("Restoring from backup succeeded.")

        }

    }

}
