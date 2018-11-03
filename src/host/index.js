/**
 * Shambhala.
 *
 * Host application (playground).
 *
 * @module host-app
 * @license Apache-2.0
 */




import axios from "axios"
import {
    Network,
    Networks,
    Server,
    Transaction,
} from "stellar-sdk"
import {
    async,
    devEnv,
    func,
    isObject,
    randomInt,
    string,
    timeUnit,
} from "@xcmats/js-toolbox"
import {
    consoleWrapper,
    drawEmojis,
} from "../lib/utils"
import { dynamicImportLibs } from "../lib/dynamic.import"
import {
    clientDomain,
    registrationPath,
} from "../config/env"
import Shambhala from "../lib/shambhala.client"

import "./index.css"




// console logger
const logger = consoleWrapper("💻")




// gentle start
window.addEventListener("load", async () => {

    // greet
    logger.info("Hi there! 🌴")


    // entertain...
    const toy = document.getElementById("toy")
    async.repeat(async () => {
        toy.innerHTML = drawEmojis(randomInt() % 4 + 1).join(string.space())
        await async.delay(0.8 * timeUnit.second)
    }, () => true)


    // instantiate shambhala client
    let shambhala = new Shambhala(
        clientDomain + registrationPath + "shambhala.html"
    )


    // expose `sf` dev. namespace
    if (devEnv()  &&  isObject(window)) {
        window.sf = {
            ...await dynamicImportLibs(),
            shambhala,
        }
    }




    // do meaningful stuff
    try {

        // Onboarding - [Variant A]


        // choose network and _stellar_ horizon server
        Network.use(new Network(Networks.TESTNET))
        let server = new Server("https://horizon-testnet.stellar.org/")




        // account generation
        // https://bit.ly/shambhalagenaccount
        logger.info("Requesting address generation...")

        let G_PUBLIC = await shambhala.generateAddress()

        logger.info("Got it:", string.shorten(G_PUBLIC, 11))
        await async.delay(0.1 * timeUnit.second)




        // signing keys generation
        // https://bit.ly/shambhalagensig
        logger.info("Requesting signing keys generation...")

        let { C_PUBLIC, S_PUBLIC } =
            await shambhala.generateSigningKeys(G_PUBLIC)

        logger.info(
            "Got them:",
            string.shorten(C_PUBLIC, 11),
            string.shorten(S_PUBLIC, 11)
        )
        await async.delay(0.1 * timeUnit.second)




        // account creation and initial funding
        // https://friendbot.stellar.org/
        logger.info("Requesting account generation and initial funds...")

        let friendbotResponse =
            await axios.get("https://friendbot.stellar.org/", {
                params: { addr: G_PUBLIC },
            })

        logger.info(
            "Got it:",
            func.compose(
                string.quote,
                (op) => `${op.type}: ${op.startingBalance} XLM`,
                (tx) => tx.operations[0],
                (xdr64) => new Transaction(xdr64)
            )(friendbotResponse.data.envelope_xdr)
        )
        await async.delay(0.1 * timeUnit.second)




        // find sequence number
        // http://bit.ly/stellarseqnumber
        logger.info("Getting account sequence...")

        let sequence = (
            await server.loadAccount(G_PUBLIC)
        ).sequenceNumber()

        logger.info("It's:", string.quote(sequence))
        await async.delay(0.1 * timeUnit.second)




        // automatic keys association
        // http://bit.ly/shambhalaautokeyassoc
        logger.info("Requesting transaction associating keys with account...")

        let tx = await shambhala.generateSignedKeyAssocTX(
            G_PUBLIC, sequence, Networks.TESTNET
        )

        logger.info(
            "It came:",
            func.compose(
                string.quote,
                (opTypes) => opTypes.join(string.space()),
                (ops) => ops.map((op) => op.type)
            )(tx.operations)
        )
        await async.delay(0.1 * timeUnit.second)




        // send transaction to the network
        // https://bit.ly/stellarsubmittx
        logger.info("Sending transaction to the stellar network.")

        await server.submitTransaction(tx)

        logger.info("Sent.")
        await async.delay(0.1 * timeUnit.second)




        logger.info("All done!")

    } catch (ex) {

        logger.error("Whoops...", ex)

    }

})
