/**
 * Shambhala.
 *
 * Client application (frontend).
 *
 * @module shambhala-client-app
 * @license Apache-2.0
 */




import axios from "axios"
import forage from "localforage"
import * as redshift from "@stellar-fox/redshift"
import * as cryptops from "../lib/cryptops"
import { Keypair } from "stellar-sdk"
import {
    access,
    codec,
    func,
    handleRejection,
    string,
    toBool,
} from "@xcmats/js-toolbox"
import MessageHandler from "../lib/message.handler"
import { consoleWrapper } from "../lib/utils"
import {
    clientDomain,
    hostDomain,
    registrationPath,
    restApiPrefix,
} from "../config/env"
import * as message from "../lib/messages"

import "./index.css"




// ...
const
    // console logger
    logger = consoleWrapper("🎭"),

    // backend url
    backend = clientDomain + registrationPath + restApiPrefix




// local memory, volatile context/store
let context = {}




// gentle start
window.addEventListener("load", async () => {

    // if there is no parent - there is nothing to do
    if (!window.opener) {
        logger.error("What are you looking for?")
        // window.location.replace(hostDomain)
        return null
    }


    // greet
    logger.info("Boom! 💥")


    // instantiate message handler
    const messageHandler = new MessageHandler(hostDomain)
    messageHandler.setRecipient(window.opener, "root")




    // PING-PONG ----------------------------------------------------
    messageHandler.handle(
        message.PING,
        async (p) => {

            logger.info("Root has spoken:", p)

            logger.info("getting data...")
            let resp = await axios.get(backend)
            logger.info("got:", resp)

            messageHandler.postMessage(
                message.PONG,
                resp.data
            )

            logger.info("data sent to root...")

        }
    )
    // --------------------------------------------------------------




    // account generation -------------------------------------------
    messageHandler.handle(
        message.GENERATE_ACCOUNT,
        async () => {

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
    )
    // --------------------------------------------------------------




    // signing keys generation --------------------------------------
    messageHandler.handle(
        message.GENERATE_SIGNING_KEYS,
        async (p) => {

            let G_PUBLIC = null, C_UUID = null

            logger.info("Signing keys generation requested.")

            // validate received G_PUBLIC
            // and check if it has been associated before
            try {

                Keypair.fromPublicKey(p.G_PUBLIC).publicKey();
                ({ G_PUBLIC, C_UUID } = await forage.getItem(p.G_PUBLIC))

            } catch (_) {

                // report error
                messageHandler.postMessage(
                    message.GENERATE_SIGNING_KEYS,
                    { error: "client:[invalid or not associated G_PUBLIC]" }
                )

                logger.error("Invalid or not associated G_PUBLIC received.")

                // don't do anything else
                return
            }

            logger.info(G_PUBLIC, C_UUID)

            // generate user-specific SALT
            let SALT = cryptops.salt64()

            // PIN - will be read from the user
            let PIN = string.random(5, string.digits())

            // compute S_KEY
            let S_KEY = await cryptops.deriveKey(
                codec.stringToBytes(PIN), SALT
            )

            // send S_KEY to the server
            let serverResponse = await handleRejection(
                async () => await axios.post(
                    backend + message.GENERATE_SIGNING_KEYS,
                    {
                        G_PUBLIC, C_UUID,
                        S_KEY: codec.b64enc(S_KEY),
                    }
                ),
                async (ex) => ex.response
            )






            // report error
            messageHandler.postMessage(
                message.GENERATE_SIGNING_KEYS,
                { error: "NOT IMPLEMENTED YET" }
            )

            logger.error(
                "Signing keys generation failure.",
                "NOT IMPLEMENTED"
            )

        }
    )
    // --------------------------------------------------------------




    // report readiness
    messageHandler.postMessage(message.READY)

})
