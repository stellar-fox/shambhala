/**
 * Shambhala.
 *
 * Client application (frontend).
 *
 * @module shambhala-client-app
 * @license Apache-2.0
 */




import forage from "localforage"
import * as cryptops from "../lib/cryptops"
import { Keypair } from "stellar-sdk"
import {
    codec,
    string,
} from "@xcmats/js-toolbox"
import MessageHandler from "../lib/message.handler"
import { consoleWrapper } from "../lib/utils"
import { hostDomain } from "../config/env"
import * as message from "../lib/messages"
import pingPong from "./ping_pong"
import generateAccount from "./generate_account"
import generateSigningKeys from "./generate_signing_keys"

import "./index.css"




// console logger
const logger = consoleWrapper("🎭")




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




    // ping-pong ----------------------------------------------------
    messageHandler.handle(
        message.PING,
        pingPong(messageHandler, context, logger)
    )
    // --------------------------------------------------------------




    // account generation -------------------------------------------
    messageHandler.handle(
        message.GENERATE_ACCOUNT,
        generateAccount(messageHandler, context, logger)
    )
    // --------------------------------------------------------------




    // signing keys generation --------------------------------------
    messageHandler.handle(
        message.GENERATE_SIGNING_KEYS,
        generateSigningKeys(messageHandler, context, logger)
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
