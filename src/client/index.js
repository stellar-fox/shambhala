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
        async () => {

            logger.info("-> PING")

            let resp = await axios.get(backend)

            messageHandler.postMessage(
                message.PONG,
                {
                    hash: func.compose(
                        codec.bytesToHex,
                        cryptops.sha512,
                        codec.stringToBytes,
                        JSON.stringify
                    )(resp.data),
                }
            )

            logger.info("<- PONG")

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

            logger.info(
                string.shorten(G_PUBLIC, 11),
                string.shorten(C_UUID, 7)
            )

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

            // unfortunately - an error occured
            if (
                serverResponse.status !== 201  ||
                !access(serverResponse, ["data", "ok"], false)
            ) {

                // report error
                messageHandler.postMessage(
                    message.GENERATE_SIGNING_KEYS,
                    { error: `server:[${serverResponse.status}]` }
                )

                logger.error(
                    "Signing keys generation failure.",
                    serverResponse.data.error
                )

                // do nothing more
                return

            }

            // receive C_PASSPHRASE and S_PUBLIC from the server
            let { S_PUBLIC } = serverResponse.data
            let C_PASSPHRASE = codec.b64dec(serverResponse.data.C_PASSPHRASE)

            // compute C_KEY
            let C_KEY = await cryptops.deriveKey(C_PASSPHRASE, SALT)

            // [💥] destroy C_PASSPHRASE
            C_PASSPHRASE = null

            // generate C_SECRET
            let C_SECRET = Keypair.random().secret()

            // compute and store ENC_CKP
            let ENC_CKP = cryptops.encrypt(
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
                messageHandler.postMessage(
                    message.GENERATE_SIGNING_KEYS,
                    { error: "client:[failure]" }
                )

                logger.error(
                    "Signing keys generation failure.",
                    localResponse.error
                )

            // all ok
            } else {

                // respond to the host application
                messageHandler.postMessage(
                    message.GENERATE_SIGNING_KEYS,
                    { ok: true, C_PUBLIC, S_PUBLIC }
                )

                logger.info(
                    "Signing keys succesfully generated:",
                    string.shorten(C_PUBLIC, 11),
                    string.shorten(S_PUBLIC, 11)
                )

            }

        }
    )
    // --------------------------------------------------------------




    // automatic keys association -----------------------------------
    messageHandler.handle(
        message.GENERATE_SIGNED_KEY_ASSOC_TX,
        async (p) => {

            let
                G_PUBLIC = null,
                C_PUBLIC = null,
                S_PUBLIC = null

            logger.info("Key association transaction generation requested.")

            // validate received G_PUBLIC,
            // check if it has been associated before
            // and compare it with public part of GKP
            // (implicit check if GKP is present in memory
            // and of appropriate type)
            try {

                Keypair.fromPublicKey(p.G_PUBLIC).publicKey();
                (
                    { G_PUBLIC, C_PUBLIC, S_PUBLIC } =
                        await forage.getItem(p.G_PUBLIC)
                )
                if (context.GKP.publicKey() !== G_PUBLIC) {
                    throw new Error("Wrong G_PUBLIC.")
                }

            } catch (_) {

                // report error
                messageHandler.postMessage(
                    message.GENERATE_SIGNED_KEY_ASSOC_TX,
                    { error: "client:[invalid or not associated G_PUBLIC]" }
                )

                logger.error("Invalid or not associated G_PUBLIC received.")

                // don't do anything else
                return
            }

            logger.info(
                string.shorten(G_PUBLIC, 11),
                string.shorten(C_PUBLIC, 11),
                string.shorten(S_PUBLIC, 11)
            )




        }
    )
    // --------------------------------------------------------------




    // report readiness
    messageHandler.postMessage(
        message.READY,
        { hash: codec.bytesToHex(cryptops.salt64()) }
    )

})
