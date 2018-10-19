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
import { cn } from "../lib/utils"
import * as message from "../lib/messages"
import {
    database,
    tables,
} from "../config/server.credentials"
import { restApiPrefix } from "../config/env"




// ...
const
    db = pg()(cn(database)),
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




// "hello world" route
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
// -------------------------------------------




// "generate account" route
app.post(
    "/" + restApiPrefix + message.GENERATE_ACCOUNT,
    async (req, res) => {
        // eslint-disable-next-line no-console
        console.log("    G_PUBLIC:", req.body.G_PUBLIC)
        // eslint-disable-next-line no-console
        console.log("      C_UUID:", req.body.C_UUID)

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
            // eslint-disable-next-line no-console
            console.log(ex)
        }
    }
)
// -------------------------------------------




// ...
app.listen(
    port,
    // eslint-disable-next-line no-console
    () => console.log(`shambhala.serv::${port}`)
)
