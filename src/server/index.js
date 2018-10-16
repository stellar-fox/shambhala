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
import { database } from "../config/server.credentials"
import { cn } from "../lib/utils"




// ...
const
    db = pg()(cn(database)),
    app = express(),
    port = 8081




// ...
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
    "/api/v1/",
    (_req, res) =>
        db.many("SELECT datname, pid, usename FROM pg_stat_activity;")
            .then((dbStats) =>
                res
                    .status(200)
                    .send({
                        message: "shambhala - REST API",
                        version: 1,
                        dbStats,
                    })
            )
)




// ...
app.listen(
    port,
    // eslint-disable-next-line no-console
    () => console.log(`shambhala.serv::${port}`)
)
