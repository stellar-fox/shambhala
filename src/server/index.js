/**
 * Shambhala.
 *
 * Backend server.
 *
 * @module shambhala-server-app
 * @license Apache-2.0
 */




import { join } from "path"
import express, {
    json,
    urlencoded,
} from "express"
import pg from "pg-promise"
import chalk from "chalk"
import {
    codec,
    string,
} from "@xcmats/js-toolbox"
import {
    cn,
    consoleWrapper,
} from "../lib/utils"
import * as message from "../lib/messages"
import {
    database,
    tables,
} from "../config/server.credentials"
import { restApiPrefix } from "../config/env"




// ...
const
    // console logger
    logger = consoleWrapper("🏢"),

    // postgresql connection
    db = pg()(cn(database)),

    // http server
    app = express(),
    port = 8081,

    // QueryFiles linking helper with memoization
    sql = ((qfs) =>
        (file) => {
            if (!(file in qfs)) {
                qfs[file] = new pg.QueryFile(
                    join(__dirname, file), { minify: true }
                )
            }
            return qfs[file]
        }
    )({})




// basic express.js server config
app.use(json())
app.use(urlencoded({ extended: true }))
app.use((_req, res, next) => {
    res.header("X-Powered-By", "shambhala.server")
    next()
})




// simple logger
app.use((req, _res, next) => {
    // eslint-disable-next-line no-console
    console.log(chalk.gray(req.method), req.url)
    next()
})




// "hello world" route ------------------------------------
app.get(
    "/" + restApiPrefix,
    (_req, res) =>
        db.many(sql("./pg_stats.sql"))
            .then((dbStats) =>
                res.status(200)
                    .send({
                        message: "shambhala - REST API",
                        version: 1,
                        dbStats,
                    })
            )
)
// --------------------------------------------------------




// "generate account" route -------------------------------
app.post(
    "/" + restApiPrefix + message.GENERATE_ACCOUNT,
    async (req, res) => {

        logger.info("    G_PUBLIC:", req.body.G_PUBLIC)
        logger.info("      C_UUID:", req.body.C_UUID)

        try {

            await db.none(
                sql("./generate_account.sql"), {
                    key_table: tables.key_table,
                    G_PUBLIC: req.body.G_PUBLIC,
                    C_UUID: req.body.C_UUID,
                })

            res.status(201)
                .send({ ok: true })

        } catch (ex) {

            res.status(500)
                .send({ error: ex })
            logger.error(ex)

        }

    }
)
// --------------------------------------------------------




// "signing keys generation" route ------------------------
app.post(
    "/" + restApiPrefix + message.GENERATE_SIGNING_KEYS,
    async (req, res) => {

        let { G_PUBLIC, C_UUID } = req.body
        let S_KEY = codec.b64dec(req.body.S_KEY)

        logger.info("    G_PUBLIC:", string.shorten(G_PUBLIC, 11))
        logger.info("      C_UUID:", string.shorten(C_UUID, 7))
        logger.info("       S_KEY:", string.shorten(req.body.S_KEY, 21))

        try {

            res.status(201)
                .send({ ok: true })

        } catch (ex) {

            res.status(500)
                .send({ error: ex })
            logger.error(ex)

        }

    }
)
// --------------------------------------------------------




// ...
app.listen(
    port,
    () => logger.info(`shambhala.serv::${port}`)
)
