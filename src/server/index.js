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
import { string } from "@xcmats/js-toolbox"
import { consoleWrapper } from "../lib/utils"
import { cn } from "../lib/utils.backend"
import { database } from "../config/server.credentials"
import {
    registrationPath,
    restApiPrefix,
    restApiRoot,
} from "../config/env"
import {
    name as applicationName,
    version,
} from "../../package.json"
import * as message from "../lib/messages"
import hello from "./actions/hello"
import generateAccount from "./actions/generate_account"
import generateSigningKeys from "./actions/generate_signing_keys"




// ...
const
    // console logger
    logger = {
        ...consoleWrapper("🏢"),
        ok: (text) =>
            // eslint-disable-next-line no-console
            console.log(chalk.green(text)),
        err: (text) =>
            // eslint-disable-next-line no-console
            console.log(chalk.red(text)),
    },

    // postgresql connection
    db = pg()(cn(database)),

    // http server
    app = express(),
    port = 8081




// simple request logger
app.use((req, _res, next) => {
    // eslint-disable-next-line no-console
    console.log(
        chalk.gray(string.padLeft(req.method, 8)),
        req.url
    )
    next()
})




// basic express.js server config
app.use(json())
app.use(urlencoded({ extended: true }))
app.use((_req, res, next) => {
    res.header("X-Powered-By", applicationName)
    next()
})




// "hello world" route
app.get(
    "/" + restApiRoot,
    (_req, res, next) => {
        res.redirect(registrationPath + restApiPrefix)
        next()
    }
)
app.get("/" + restApiPrefix, hello(db, logger))

// "generate account" route
app.post(
    "/" + restApiPrefix + message.GENERATE_ACCOUNT,
    generateAccount(db, logger)
)

// "signing keys generation" route
app.post(
    "/" + restApiPrefix + message.GENERATE_SIGNING_KEYS,
    generateSigningKeys(db, logger)
)




// simple response-code logger
app.use((_req, res, next) => {
    if (res.statusCode < 400)
        logger.ok(string.padLeft(String(res.statusCode), 8))
    else
        logger.err(string.padLeft(String(res.statusCode), 8))
    next()
})




// ...
app.listen(
    port,
    () => logger.info(
        `shambhala.serv::${chalk.yellow(port)}`,
        `(${chalk.blueBright("v." + version)})`
    )
)
