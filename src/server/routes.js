/**
 * Shambhala.
 *
 * Routes configuration.
 *
 * @module server-routes
 * @license Apache-2.0
 */




import {
    registrationPath,
    restApiPrefix,
    restApiRoot,
} from "../config/env"
import * as message from "../lib/messages"
import hello from "./actions/hello"
import generateAddress from "./actions/generate_address"
import generateSigningKeys from "./actions/generate_signing_keys"




/**
 * Shambhala routes configuration.
 *
 * @function configureRoutes
 * @param {Object} app
 * @param {Object} db
 * @param {Object} logger
 */
export default function configureRoutes (app, db, logger) {

    // redirect from 'restApiRoot' to 'restApiPrefix'
    // (just for the purpose of saying 'hello')
    app.get(
        "/" + restApiRoot,
        (_req, res, next) => {
            res.redirect(registrationPath + restApiPrefix)
            next()
        }
    )

    // "hello world" route
    app.get("/" + restApiPrefix, hello(db, logger))

    // "generate address" route
    app.post(
        "/" + restApiPrefix + message.GENERATE_ADDRESS,
        generateAddress(db, logger)
    )

    // "signing keys generation" route
    app.post(
        "/" + restApiPrefix + message.GENERATE_SIGNING_KEYS,
        generateSigningKeys(db, logger)
    )

}
