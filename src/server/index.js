/**
 * Shambhala.
 *
 * Backend server.
 *
 * @module shambhala-server-app
 * @license Apache-2.0
 */




import express, {
    json,
    urlencoded,
} from "express"
import pg from "pg-promise"
import chalk from "chalk"
import * as cryptops from "../lib/cryptops"
import { Keypair } from "stellar-sdk"
import {
    codec,
    string,
} from "@xcmats/js-toolbox"
import { consoleWrapper } from "../lib/utils"
import {
    cn,
    sql,
} from "../lib/utils.backend"
import {
    database,
    tables,
} from "../config/server.credentials"
import { restApiPrefix } from "../config/env"
import * as message from "../lib/messages"
import generateAccount from "./actions/generate_account"




// ...
const
    // console logger
    logger = consoleWrapper("🏢"),

    // postgresql connection
    db = pg()(cn(database)),

    // http server
    app = express(),
    port = 8081




// extend logger
Object.assign(logger, {
    ok: (text) =>
        // eslint-disable-next-line no-console
        console.log(chalk.green(text)),
    err: (text) =>
        // eslint-disable-next-line no-console
        console.log(chalk.red(text)),
})




// basic express.js server config
app.use(json())
app.use(urlencoded({ extended: true }))
app.use((_req, res, next) => {
    res.header("X-Powered-By", "shambhala.server")
    next()
})




// simple request logger
app.use((req, _res, next) => {
    // eslint-disable-next-line no-console
    console.log(chalk.gray(req.method), req.url)
    next()
})




// "hello world" route ------------------------------------
app.get(
    "/" + restApiPrefix,
    (_req, res) => {
        db.many(sql("./src/server/pg_stats.sql"))
            .then((dbStats) => {
                res.status(200)
                    .send({
                        message: "shambhala - REST API",
                        version: 1,
                        dbStats,
                    })
                logger.ok("200")
            })
    }
)
// --------------------------------------------------------




// "generate account" route -------------------------------
app.post(
    "/" + restApiPrefix + message.GENERATE_ACCOUNT,
    generateAccount(db, logger)
)
// --------------------------------------------------------




// "signing keys generation" route ------------------------
app.post(
    "/" + restApiPrefix + message.GENERATE_SIGNING_KEYS,
    async (req, res) => {

        // receive G_PUBLIC, C_UUID
        let { G_PUBLIC, C_UUID } = req.body

        // base64 decode S_KEY
        let S_KEY = codec.b64dec(req.body.S_KEY)

        logger.info("  -> G_PUBLIC:", string.shorten(G_PUBLIC, 11))
        logger.info("  ->   C_UUID:", string.shorten(C_UUID, 7))
        logger.info("  ->    S_KEY:", string.shorten(req.body.S_KEY, 17))

        // generate S_SECRET
        let S_SECRET = Keypair.random().secret()

        // extract S_PUBLIC from generated S_SECRET
        let S_PUBLIC = Keypair.fromSecret(S_SECRET).publicKey()

        // generate PEPPER
        let PEPPER = cryptops.salt32()

        // encrypt PEPPER and S_SECRET
        let ENC_SKP = codec.b64enc(cryptops.encrypt(
            S_KEY,
            codec.concatBytes(
                PEPPER,
                codec.stringToBytes(S_SECRET)
            )
        ))

        // compute C_PASSPHRASE
        let C_PASSPHRASE = codec.b64enc(cryptops.genKey(S_KEY, PEPPER))

        try {

            // store S_PUBLIC and ENC_SKP
            await db.none(
                sql("./src/server/generate_signing_keys.sql"), {
                    key_table: tables.key_table,
                    G_PUBLIC, C_UUID,
                    S_PUBLIC, ENC_SKP,
                })

            logger.info("  <-     S_PUBLIC:", string.shorten(S_PUBLIC, 11))
            logger.info("  <- C_PASSPHRASE:", string.shorten(C_PASSPHRASE, 17))

            // all went smooth
            res.status(201)
                .send({
                    ok: true,
                    S_PUBLIC,
                    C_PASSPHRASE,
                })
            logger.ok("201")

            // [💥] mark things to destroy
            S_KEY = null
            S_SECRET = null
            PEPPER = null
            C_PASSPHRASE = null

        } catch (ex) {

            // unfortunately - error occured
            res.status(500)
                .send({ error: ex })
            logger.error(ex)
            logger.err("500")

        }

    }
)
// --------------------------------------------------------




// ...
app.listen(
    port,
    () => logger.info(`shambhala.serv::${port}`)
)
