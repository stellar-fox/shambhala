/**
 * Shambhala.
 *
 * Associate address action.
 *
 * @module client-actions
 * @license Apache-2.0
 */




import axios from "axios"
import { Keypair } from "stellar-sdk"
import {
    access,
    codec,
    string,
    type,
    utils,
} from "@xcmats/js-toolbox"
import { promptUser } from "../functions"
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
 * Address association.
 *
 * @function associateAddress
 * @param {Function} respond MessageHandler::postMessage() with first argument
 *      bound to an appropriate message type.
 * @param {Object} thunkActions
 * @param {Object} cryptops "@stellar-fox/cryptops" module
 * @param {Object} forage "localforage" module
 * @param {Function} logger
 * @returns {Function} Message action.
 */
export default function associateAddress (
    respond,
    {
        setAccountId: ui_setAccountId,
        setError: ui_setError,
        setSuccess: ui_setSuccess,
    },
    { genUUID }, forage,
    logger
) {

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




        // pass G_PUBLIC to the UI
        ui_setAccountId(p.G_PUBLIC)

        // confirm that user wishes to associate this address
        if (
            !await promptUser(
                `Do you wish to associate ${string.quote(p.G_PUBLIC)}?`
            )
        ) {
            respond({ error: "user:[rejected]" })
            logger.error([
                "User doesn't want to associate this address.",
                "Operation aborted.",
            ].join(string.space()))
            ui_setError("Address association rejected.")

            return
        }




        // extract user's new public address
        G_PUBLIC = p.G_PUBLIC

        // generate user's new unique identifier
        C_UUID = codec.bytesToHex(genUUID())

        // store G_PUBLIC and C_UUID in local storage
        let localResponse = await utils.handleRejection(
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
                "Address association failure.",
                localResponse.error
            )
            ui_setError("Address association failure.")

            // don't do anything else
            return
        }




        // send G_PUBLIC and C_UUID to the server
        let serverResponse = await utils.handleRejection(
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
                "Address successfully associated:",
                G_PUBLIC
            )
            ui_setSuccess("Address associated.")

        // unfortunately - an error occured
        } else {

            // rollback all locally saved data (ignore any errors)
            await utils.handleRejection(
                async () => await forage.removeItem(G_PUBLIC)
            )

            // report error
            respond({ error: `server:[${serverResponse.status}]` })
            logger.error(
                "Address association failure.",
                serverResponse.data.error
            )
            ui_setError("Address association failure.")

        }

    }

}
