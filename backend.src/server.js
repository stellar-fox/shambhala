/**
 * Shambhala backend server.
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */



import express, {
    json,
    urlencoded,
} from "express"




// ...
const
    app = express(),
    port = 8081




// ...
app.use(json())
app.use(urlencoded({ extended: true, }))
app.use(function (req, res, next) {
    // eslint-disable-next-line no-console
    console.log(req.method, req.url)
    res.header("X-Powered-By", "shambhala.server")
    next()
})




// ...
app.get(
    "/api/v1/",
    (_req, res) =>
        res
            .status(200)
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
