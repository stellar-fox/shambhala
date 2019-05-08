/**
 * Shambhala.
 *
 * Test functions and scenarios.
 *
 * @module testing-lib
 * @license Apache-2.0
 */




import {
    array,
    codec,
    func,
    handleRejection,
    string,
    type,
    timeUnit,
} from "@xcmats/js-toolbox"
import axios from "axios"
import {
    Asset,
    Keypair,
    Memo,
    Network,
    Networks,
    Operation,
    Server,
    Transaction,
    TransactionBuilder,
    xdr,
} from "stellar-sdk"
import { newAddress } from "@stellar-fox/redshift"
import {
    registrationPath,
} from "../config/env"
import { domain as clientDomain } from "../config/client.json"
import { friendbotAddress } from "../config/host.json"




/**
 * shambhala.client integration testing
 *
 * @function shambhalaTesting
 * @param {Object} logger
 * @param {Object} context
 * @returns {Object} Test functions and scenarios.
 */
export function shambhalaTesting (
    { Shambhala, signTSP },
    logger,
    context,
    {
        client = clientDomain + registrationPath + "shambhala.html",
    } = {}
) {

    let that = { scenario: {} }




    // choose network and _stellar_ horizon server
    that.setEnv = async ({
        network = Networks.TESTNET,
        horizonUrl = "https://horizon-testnet.stellar.org/",
    } = {}) => {

        Network.use(new Network(network))
        context.network = network

        context.server = new Server(horizonUrl)
        context.horizonUrl = horizonUrl

        logger.info(`Network: ${string.quote(network)}`)
        logger.info(` Server: ${horizonUrl}`)

        return context

    }




    // instantiate client
    that.instantiate = async (url = client) => {

        if (!type.isObject(context.shambhala)) {
            context.shambhala = new Shambhala(url)
            context.shambhalaUrl = url
            logger.info(`Instance pointing to ${string.quote(url)} created.`)
        }

        return context

    }




    // sign using txops.signTSP (testing txops)
    that.txopsSign = (secret, tx = context.tx) => {

        tx.signatures.push(
            func.pipe(secret, tx.signatureBase())(
                signTSP,
                xdr.DecoratedSignature.fromXDR.bind(xdr.DecoratedSignature)
            )
        )

        return tx
    }




    // address generation
    // https://bit.ly/shambhalagenaccount
    that.generateAddress = async () => {

        logger.info("Requesting address generation...")
        logger.warn([
            "Go to the shambhala window,",
            "open console and follow the instructions.",
        ].join(string.space()))

        context.G_PUBLIC = await context.shambhala.generateAddress()

        logger.info("Got it:", string.quote(context.G_PUBLIC))

        return context.G_PUBLIC

    }




    // address association
    // https://bit.ly/shambhalaassocacount
    that.associateAddress = async (G_PUBLIC) => {

        logger.info("Requesting address association...")
        logger.warn([
            "Go to the shambhala window,",
            "open console and follow the instructions.",
        ].join(string.space()))

        context.G_PUBLIC = await context.shambhala.associateAddress(G_PUBLIC)

        logger.info("Successfully associated!")

        return context.G_PUBLIC

    }




    // signing keys generation
    // https://bit.ly/shambhalagensig
    that.generateSigningKeys = async (G_PUBLIC = context.G_PUBLIC) => {

        logger.info("Requesting signing keys generation...")
        logger.warn([
            "Go to the shambhala window,",
            "open console and follow the instructions.",
        ].join(string.space()))

        let { C_PUBLIC, S_PUBLIC } =
            await context.shambhala.generateSigningKeys(G_PUBLIC)
        context.C_PUBLIC = C_PUBLIC
        context.S_PUBLIC = S_PUBLIC

        logger.info(
            "Got them:",
            string.shorten(C_PUBLIC, 11),
            string.shorten(S_PUBLIC, 11)
        )

        return { C_PUBLIC, S_PUBLIC }

    }




    // account creation and initial funding
    // https://friendbot.stellar.org/
    that.createAccountOnLedger = async (G_PUBLIC = context.G_PUBLIC) => {

        logger.info("Requesting account generation and initial funds...")

        let friendbotResponse =
            await axios.get(friendbotAddress, {
                params: { addr: G_PUBLIC },
            })
        context.G_PUBLIC = G_PUBLIC

        logger.info(
            "Got it:",
            func.pipe(friendbotResponse.data.envelope_xdr)(
                (xdr64) => new Transaction(xdr64),
                (tx) => array.head(tx.operations),
                (op) => `${op.type}: ${op.startingBalance} XLM`,
                string.quote
            )
        )

        return context

    }




    // finding current sequence number
    // https://bit.ly/stellarseqnumber
    that.getSequenceNumber = async (G_PUBLIC = context.G_PUBLIC) => {

        logger.info("Getting account sequence...")

        context.account = await context.server.loadAccount(G_PUBLIC)
        context.sequence = context.account.sequenceNumber()

        logger.info("It's:", string.quote(context.sequence))

        return context.sequence

    }




    // automatic keys association
    // https://bit.ly/shambhalaautokeyassoc
    that.generateSignedKeyAssocTX = async (
        G_PUBLIC = context.G_PUBLIC,
        sequence = context.sequence,
        network = context.network
    ) => {

        logger.info(
            "Requesting signed transaction associating keys with account..."
        )

        context.tx = new Transaction(
            await context.shambhala.generateSignedKeyAssocTX(
                G_PUBLIC, sequence, network
            )
        )

        logger.info(
            "It came:",
            func.pipe(context.tx.operations)(
                (ops) => ops.map((op) => op.type),
                (opTypes) => opTypes.join(string.space()),
                string.quote
            )
        )

        return context.tx
    }




    // manual keys association
    // https://bit.ly/shambhalamanualkeyassoc
    that.generateKeyAssocTX = async (
        G_PUBLIC = context.G_PUBLIC,
        sequence = context.sequence,
        network = context.network
    ) => {

        logger.info(
            "Requesting unsigned transaction associating keys with account..."
        )

        context.tx = new Transaction(
            await context.shambhala.generateKeyAssocTX(
                G_PUBLIC, sequence, network
            )
        )

        logger.info(
            "It came:",
            func.pipe(context.tx.operations)(
                (ops) => ops.map((op) => op.type),
                (opTypes) => opTypes.join(string.space()),
                string.quote
            )
        )

        return context.tx
    }




    // send transaction to the network
    // https://bit.ly/stellarsubmittx
    that.submitTransaction = async (tx = context.tx) => {

        logger.info("Sending transaction to the stellar network.")

        context.lastServerResponse = await context.server.submitTransaction(tx)

        logger.info("Sent.")

        return context.lastServerResponse

    }




    // build transaction sending >>value<< from `source` to `destination`
    // if `destination` doesn't exists it'll be created
    that.buildTransferTransaction = async (
        source, destination, amount,
        memoText = "https://bit.ly/shambhalasrc", fee = 100
    ) => {

        logger.info(
            `Building test transaction:${string.nl()}`,
            "[",
            string.quote(string.shorten(source, 11)),
            "->",
            string.quote(string.shorten(destination, 11)),
            "],",
            `amount: ${amount} XLM,`,
            `memo: ${string.quote(memoText)}`
        )

        let
            // try loading `sourceAccount`
            // if it doesn't exist - let the exception propagate out
            // as nothing can be done in such case
            sourceAccount = await context.server.loadAccount(source),

            // try loading `destinationAccount`, but handle
            // the eventual rejection - if there is no `destination`
            // then it shall be created,
            // so `destinationAccount` can be set to null
            destinationAccount = await handleRejection(
                context.server.loadAccount.bind(context.server, destination),
                () => null
            ),

            tx = func.pipe(new TransactionBuilder(sourceAccount, { fee }))(

                // first ...
                destinationAccount ?

                    // ... if `destination` exists - create payment or ...
                    (tb) => tb.addOperation(Operation.payment({
                        destination,
                        asset: Asset.native(),
                        amount: String(amount),
                    })) :

                    // ... if `destination` doesn't exist - create account ...
                    (tb) => tb.addOperation(Operation.createAccount({
                        destination,
                        startingBalance: String(amount),
                    })),


                // ... and then add memo ...
                (tb) => tb.addMemo(Memo.text(memoText)),

                // ... with some time bounds ...
                (tb) => tb.setTimeout(10 * timeUnit.second),

                // ... and finally build the transaction
                (tb) => tb.build(),

            )

        context.tx = tx

        logger.info("Transaction built.")

        return tx

    }




    // sign the transaction `tx` on behalf of an `accountId`
    // https://bit.ly/shambhalasigning
    that.sign = async (accountId = context.G_PUBLIC, tx = context.tx) => {

        logger.info("Request transaction to be signed by shambhala.")
        logger.warn([
            "Go to the shambhala window,",
            "open console and follow the instructions.",
        ].join(string.space()))

        tx.signatures.push(
            ...(
                await context.shambhala.signTransaction(
                    accountId, tx.signatureBase()
                )
            ).map(
                (sigXDR) => xdr.DecoratedSignature.fromXDR(sigXDR, "base64")
            )
        )

        logger.info("Success!")

        return tx

    }




    // backup (test)
    that.backup = async (G_PUBLIC = context.G_PUBLIC) => {

        logger.info(`Requesting encrypted backup for ${G_PUBLIC}.`)

        context.backup = await context.shambhala.backup(G_PUBLIC)

        logger.info("Here it is:", context.backup)

        return context.backup
    }




    // restore (test)
    that.restore = async (
        G_PUBLIC = context.G_PUBLIC,
        backup = context.backup
    ) => {

        logger.info(`Trying to restore backup for ${G_PUBLIC}.`)

        await context.shambhala.restore(
            G_PUBLIC, backup
        )

        logger.info("All good.")

        return context
    }




    // try account creation
    //
    // * shambhala is responsible for:
    //     - paper-wallet generation through redshift library
    //         (24-word mnemonic + passphrase),
    //     - `account id` derivation (_stellar_ public G...)
    //     - signing keys generation,
    //     - generating SIGNED transaction associating keys with `account id`
    // * host application is responsible for:
    //     - creating account on ledger (e.g. through friendbot),
    //     - getting current `sequence number` for generated account,
    //     - submitting signed transaction associating keys with account
    //         to stellar network,
    that.scenario.createAccount = async () => {

        logger.info("Account Creation Test BEGIN")
        // eslint-disable-next-line no-console
        console.time("Account Creation")

        try {

            await that.generateAddress()
            await that.generateSigningKeys()
            await that.createAccountOnLedger()
            await that.getSequenceNumber()
            await that.generateSignedKeyAssocTX()
            await that.submitTransaction()

        } catch (ex) {
            // eslint-disable-next-line no-console
            console.timeEnd("Account Creation")
            logger.error(ex)
            logger.warn("Account Creation Test FAILED.")
            return context
        }

        // eslint-disable-next-line no-console
        console.timeEnd("Account Creation")
        logger.info("Account Creation Test END")

        return context

    }




    // try account association
    //
    // * shambhala is responsible for:
    //     - signing keys generation,
    //     - generating UNSIGNED transaction associating keys with `account id`
    // * host application is responsible for:
    //     - providing already existing `account id` to shambhala
    //     - getting current `sequence number` for generated account,
    //     - signing transaction associating keys with account,
    //     - submitting signed transaction associating keys with account
    //         to the stellar network,
    that.scenario.associateAccount = async () => {

        logger.info("Account Association Test BEGIN")
        // eslint-disable-next-line no-console
        console.time("Account Association")

        try {

            let addr = func.rearg(newAddress)(0, 3)(
                "TstHostGen", { Keypair }
            )

            logger.info(
                `(${string.quote(addr.mnemonic)},`,
                `${string.quote(addr.passphrase)})`
            )

            await that.associateAddress(addr.keypair.publicKey())
            await that.generateSigningKeys(addr.keypair.publicKey())
            await that.createAccountOnLedger(addr.keypair.publicKey())
            await that.getSequenceNumber()

            let tx = await that.generateKeyAssocTX()

            logger.info("Signing received transaction.")

            tx.sign(addr.keypair)

            logger.info(
                "OK:", codec.b64enc(array.head(tx.signatures).toXDR())
            )

            await that.submitTransaction()

        } catch (ex) {
            // eslint-disable-next-line no-console
            console.timeEnd("Account Association")
            logger.error(ex)
            logger.warn("Account Association Test FAILED.")
            return context
        }

        // eslint-disable-next-line no-console
        console.timeEnd("Account Association")
        logger.info("Account Association Test END")

        return context

    }




    // perform backup and then restore
    that.scenario.backupRestore = async (G_PUBLIC = context.G_PUBLIC) => {

        logger.info("Backup-Restore Test BEGIN")
        // eslint-disable-next-line no-console
        console.time("Backup-Restore")

        try {

            await that.backup(G_PUBLIC)
            await that.restore(G_PUBLIC)

        } catch (ex) {
            // eslint-disable-next-line no-console
            console.timeEnd("Backup-Restore")
            logger.error(ex)
            logger.warn("Backup-Restore Test FAILED.")
            return context
        }

        // eslint-disable-next-line no-console
        console.timeEnd("Backup-Restore")
        logger.info("Backup-Restore Test END")

        return context

    }




    // try some money transferring
    that.scenario.transferMoney = async (
        source = context.G_PUBLIC,
        destination = null,
        amount = null,
        memoText = "https://bit.ly/shambhalasrc"
    ) => {

        logger.info("Transaction-Signing Test BEGIN")
        // eslint-disable-next-line no-console
        console.time("Transaction-Signing")

        try {

            let randomDestination = null

            if (!destination) {
                randomDestination = Keypair.random()
                logger.info("Using some random, ad-hoc generated destination.")
            }

            await that.buildTransferTransaction(
                source,
                destination || randomDestination.publicKey(),
                amount || array.head(array.sparse(2, 9, 1)),
                memoText
            )
            await that.sign(source)
            await that.submitTransaction()

            if (!destination) {
                logger.info(
                    "Here's destination SECRET:",
                    randomDestination.secret()
                )
            }

        } catch (ex) {
            // eslint-disable-next-line no-console
            console.timeEnd("Transaction-Signing")
            logger.error(ex)
            logger.warn("Transaction-Signing Test FAILED.")
            return context
        }

        // eslint-disable-next-line no-console
        console.timeEnd("Transaction-Signing")
        logger.info("Transaction-Signing Test END")

        return context

    }




    return Object.freeze(that)

}
