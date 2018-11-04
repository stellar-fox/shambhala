/**
 * Shambhala.
 *
 * Backup action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import forage from "localforage"
import { Keypair } from "stellar-sdk"
import {
    deriveKey,
    encrypt,
    salt64,
} from "../../lib/cryptops"
import {
    array,
    codec,
    func,
    string,
} from "@xcmats/js-toolbox"
import * as message from "../../lib/messages"




/**
 * Backup dumping.
 *
 * @function backup
 * @param {Object} messageHandler Instance of MessageHandler class.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function backup (messageHandler, logger) {

    return async (p) => {

        let
            G_PUBLIC = null, C_UUID = null,
            C_PUBLIC = null, S_PUBLIC = null,
            SALT = null, ENC_CKP = null


        logger.info(`Backup requested for ${string.quote(p.G_PUBLIC)}.`)




        // validate received G_PUBLIC
        // and fetch needed data from the local storage
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey();
            (
                {
                    G_PUBLIC, C_UUID,
                    C_PUBLIC, S_PUBLIC,
                    SALT, ENC_CKP,
                } = await forage.getItem(p.G_PUBLIC)
            )

        } catch (_) {

            // report error
            messageHandler.postMessage(
                message.BACKUP,
                { error: "client:[invalid or not associated G_PUBLIC]" }
            )

            logger.error("Invalid or not associated G_PUBLIC received.")

            // don't do anything else
            return
        }




        // generate BACKUP_SALT (needed for key derivation)
        let BACKUP_SALT = salt64()

        // BACKUP_PASSPHRASE - will be read from the user
        let BACKUP_PASSPHRASE = array.range(6).map(
            (_) => func.compose(
                string.capitalize,
                string.random
            )(
                func.compose(array.draw, array.range)(3, 12),
                string.asciiLowercase()
            )
        ).join(string.space())


        // pretend this is UI
        logger.info("BACKUP_PASSPHRASE:", string.quote(BACKUP_PASSPHRASE))


        // encrypt data
        let BACKUP_CIPHERTEXT = encrypt(
            await deriveKey(
                codec.stringToBytes(BACKUP_PASSPHRASE),
                BACKUP_SALT
            ),
            func.compose(
                codec.stringToBytes,
                JSON.stringify
            )({
                G_PUBLIC, C_UUID,
                C_PUBLIC, S_PUBLIC,
                SALT, ENC_CKP,
            })
        )

        // [💥] destroy BACKUP_PASSPHRASE
        BACKUP_PASSPHRASE = null




        // send encrypted backup to the host application
        messageHandler.postMessage(
            message.BACKUP,
            {
                ok: true,
                payload: func.compose(
                    codec.b64enc,
                    codec.concatBytes
                )(
                    BACKUP_SALT,
                    BACKUP_CIPHERTEXT
                ),
            }
        )




        logger.info("Done.")

    }

}
