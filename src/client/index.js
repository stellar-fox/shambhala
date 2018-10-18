/**
 * Shambhala.
 *
 * Client application (frontend).
 *
 * @module shambhala-client-app
 * @license Apache-2.0
 */




import axios from "axios"
import * as redshift from "@stellar-fox/redshift"
import * as cryptops from "../lib/cryptops"
import {
    func,
    string,
} from "@xcmats/js-toolbox"
import MessageHandler from "../lib/message.handler"
import { console } from "../lib/utils"
import {
    clientDomain,
    hostDomain,
    registrationPath,
    restApiPrefix,
} from "../config/env"
import * as message from "../lib/messages"

import "./index.css"




// console logger
const logger = console("🤖")




// ...
const backend = clientDomain + registrationPath + restApiPrefix




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


    // assign some action to "PING" message
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


    // account generation
    messageHandler.handle(
        message.GENERATE_ACCOUNT,
        async () => {

            logger.info("Account generation requested.")

            // "genesis" mnemonic
            // has to be presented to the user
            let G_MNEMONIC = redshift.genMnemonic()

            // passphrase - will be read from user
            let PASSPHRASE = string.random(10)

            // "genesis" key pair generation
            let GKP = func.compose(
                redshift.keypair,
                redshift.hexSeed
            )(G_MNEMONIC, PASSPHRASE)

            // [💥] let's say this >>destroys<< G_MNEMONIC and PASSPHRASE
            G_MNEMONIC = null
            PASSPHRASE = null

            // user's new public account
            let G_PUBLIC = GKP.publicKey()

            // user's new unique identifier
            let C_UUID = cryptops.genUUID()

            // confirm account creation to the host application
            messageHandler.postMessage(
                message.GENERATE_ACCOUNT,
                { ok: true, G_PUBLIC }
            )

        }
    )


    // report readiness
    messageHandler.postMessage(message.READY)

})
