/**
 * Shambhala.
 *
 * Generate account action.
 *
 * @module shambhala-client-actions
 * @license Apache-2.0
 */




import axios from "axios"
import forage from "localforage"
import * as redshift from "@stellar-fox/redshift"
import * as cryptops from "../lib/cryptops"
import {
    access,
    codec,
    func,
    handleRejection,
    string,
    toBool,
} from "@xcmats/js-toolbox"
import {
    clientDomain,
    registrationPath,
    restApiPrefix,
} from "../config/env"
import * as message from "../lib/messages"




/**
 * Backend url.
 *
 * @private
 * @constant backend
 */
const backend = clientDomain + registrationPath + restApiPrefix




/**
 * Account generation.
 *
 * @function generateAccount
 * @param {Object} messageHandler Instance of MessageHandler class.
 * @param {Object} context
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function generateAccount (messageHandler, context, logger) {

    return async () => {

        logger.info("Account generation requested.")

        // "genesis" mnemonic
        // has to be presented to the user
        let G_MNEMONIC = redshift.genMnemonic()

        // passphrase - will be read from the user
        let PASSPHRASE = string.random(10)

        // "genesis" key pair generation
        context.GKP = func.compose(
            redshift.keypair,
            redshift.hexSeed
        )(G_MNEMONIC, PASSPHRASE)

        // [💥] let's say this >>destroys<< G_MNEMONIC and PASSPHRASE
        G_MNEMONIC = null
        PASSPHRASE = null

        // extract user's new public account
        let G_PUBLIC = context.GKP.publicKey()

        // generate user's new unique identifier
        let C_UUID = codec.bytesToHex(cryptops.genUUID())

        // store G_PUBLIC and C_UUID in local storage
        let localResponse = await handleRejection(
            async () => {
                await forage.setItem(G_PUBLIC, { G_PUBLIC, C_UUID })
                return { ok: true }
            },
            async (ex) => ({ error: ex })
        )

        // something went wrong - data is not stored locally
        if (!toBool(localResponse.ok)) {

            // report error
            messageHandler.postMessage(
                message.GENERATE_ACCOUNT,
                { error: "client:[failure]" }
            )

            logger.error(
                "Account generation failure.",
                localResponse.error
            )

            // don't do anything else
            return
        }

        // send G_PUBLIC and C_UUID to the server
        let serverResponse = await handleRejection(
            async () => await axios.post(
                backend + message.GENERATE_ACCOUNT,
                { G_PUBLIC, C_UUID }
            ),
            async (ex) => ex.response
        )

        // all went smooth
        if (
            serverResponse.status === 201  &&
            access(serverResponse, ["data", "ok"], false)
        ) {

            // confirm account creation to the host application
            messageHandler.postMessage(
                message.GENERATE_ACCOUNT,
                { ok: true, G_PUBLIC }
            )

            logger.info(
                "Account succesfully generated:",
                G_PUBLIC
            )

        // unfortunately - an error occured
        } else {

            // rollback all locally saved data (ignore any errors)
            await handleRejection(
                async () => await forage.removeItem(G_PUBLIC)
            )

            // report error
            messageHandler.postMessage(
                message.GENERATE_ACCOUNT,
                { error: `server:[${serverResponse.status}]` }
            )

            logger.error(
                "Account generation failure.",
                serverResponse.data.error
            )

        }

    }

}
