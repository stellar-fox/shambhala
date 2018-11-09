/**
 * Shambhala.
 *
 * Associate address action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import axios from "axios"
import forage from "localforage"
import { Keypair } from "stellar-sdk"
import { genUUID } from "../../lib/cryptops"
import {
    access,
    codec,
    handleRejection,
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
 * Address association.
 *
 * @function associateAddress
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function associateAddress (respond, logger) {

    return async (p) => {

        let
            G_PUBLIC = null,
            C_UUID = null

        logger.info("Address association requested.")





        // validate received G_PUBLIC,
        // and check if it has been associated before
        try {

            Keypair.fromPublicKey(p.G_PUBLIC).publicKey()
            if (await forage.getItem(p.G_PUBLIC)) {
                throw new Error("G_PUBLIC already associated")
            }

        } catch (_) {

            // report error
            respond({
                error: "client:[invalid or already associated G_PUBLIC]",
            })

            logger.error("Invalid or already associated G_PUBLIC received.")

            // don't do anything else
            return
        }




        // extract user's new public address
        G_PUBLIC = p.G_PUBLIC

        // generate user's new unique identifier
        C_UUID = codec.bytesToHex(genUUID())

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
            respond({ error: "client:[failure]" })

            logger.error(
                "Address association failure.",
                localResponse.error
            )

            // don't do anything else
            return
        }




        // send G_PUBLIC and C_UUID to the server
        let serverResponse = await handleRejection(
            async () => await axios.post(
                backend + message.ASSOCIATE_ADDRESS,
                { G_PUBLIC, C_UUID }
            ),
            async (ex) => ex.response
        )

        // all went smooth
        if (
            serverResponse.status === 201  &&
            access(serverResponse, ["data", "ok"], false)
        ) {

            // confirm address association to the host application
            respond({ ok: true, G_PUBLIC })

            logger.info(
                "Address succesfully associated:",
                G_PUBLIC
            )

        // unfortunately - an error occured
        } else {

            // rollback all locally saved data (ignore any errors)
            await handleRejection(
                async () => await forage.removeItem(G_PUBLIC)
            )

            // report error
            respond({ error: `server:[${serverResponse.status}]` })

            logger.error(
                "Address association failure.",
                serverResponse.data.error
            )

        }

    }

}
