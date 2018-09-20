/**
 * Shambhala backend server.
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




// ...
const
    express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    port = 8081




// ...
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, }))
app.use(function (_req, res, next) {
    express.json()
    res.header("X-Powered-By", "shambhala.server")
    next()
})




// ...
app.get(
    "/api/v1/",
    (_req, res) =>
        res.status(200)
            .send({
                message: "shambhala - REST API",
                version: 1,
            })
)




// ...
app.listen(
    port,
    // eslint-disable-next-line no-console
    () => console.log(`shambhala.serv::${port}`)
)
