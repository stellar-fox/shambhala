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
import { consoleWrapper } from "../lib/utils"
import {
    cn,
    sql,
} from "../lib/utils.backend"
import { database } from "../config/server.credentials"
import { restApiPrefix } from "../config/env"
import * as message from "../lib/messages"
import generateAccount from "./actions/generate_account"
import generateSigningKeys from "./actions/generate_signing_keys"




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
    generateSigningKeys(db, logger)
)
// --------------------------------------------------------




// ...
app.listen(
    port,
    () => logger.info(`shambhala.serv::${port}`)
)
