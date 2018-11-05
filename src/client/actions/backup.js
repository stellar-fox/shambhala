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
import { passphraseEncrypt } from "../../lib/cryptops"
import {
    codec,
    string,
} from "@xcmats/js-toolbox"




/**
 * Binary pack client data.
 * Much more space-efficient than simple `JSON.stringify`.
 *
 * @param {Object} data Object with all client-data fields.
 * @returns {Uint8Array} Binary representation of a client data.
 */
const packClientData = ({
    C_UUID, C_PUBLIC, S_PUBLIC,
    SALT, ENC_CKP,
}) =>
    codec.concatBytes(
        codec.hexToBytes(C_UUID),
        codec.stringToBytes(C_PUBLIC),
        codec.stringToBytes(S_PUBLIC),
        codec.b64dec(SALT),
        codec.b64dec(ENC_CKP)
    )




/**
 * Backup dumping.
 *
 * @function backup
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function backup (respond, logger) {

    return async (p) => {

        let
            C_UUID = null, C_PUBLIC = null, S_PUBLIC = null,
            SALT = null, ENC_CKP = null

        logger.info(`Backup requested for ${string.quote(p.G_PUBLIC)}.`)




        // validate received G_PUBLIC
        // and fetch needed data from the local storage
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey();
            (
                {
                    C_UUID, C_PUBLIC, S_PUBLIC,
                    SALT, ENC_CKP,
                } = await forage.getItem(p.G_PUBLIC)
            )

        } catch (_) {

            // report error
            respond({
                error: "client:[invalid or not associated G_PUBLIC]",
            })

            logger.error("Invalid or not associated G_PUBLIC received.")

            // don't do anything else
            return
        }




        // BACKUP_PASSPHRASE - will be read from the user
        // this is a constant just for the 'restore' action
        // testing purposes
        let BACKUP_PASSPHRASE = "Some very long and multi-word phrase!"

        // pretend this is UI
        logger.info("BACKUP_PASSPHRASE:", string.quote(BACKUP_PASSPHRASE))




        // send encrypted backup to the host application
        respond({
            ok: true,
            payload: await passphraseEncrypt(
                BACKUP_PASSPHRASE,
                packClientData({
                    C_UUID, C_PUBLIC, S_PUBLIC,
                    SALT, ENC_CKP,
                })
            ),
        })




        // [💥] destroy BACKUP_PASSPHRASE
        BACKUP_PASSPHRASE = null

        logger.info("Done.")

    }

}
