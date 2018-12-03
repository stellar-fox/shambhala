/**
 * Shambhala.
 *
 * Client application (User Interface entry point).
 *
 * @module client-ui
 * @license Apache-2.0
 */




import React from "react"
import ReactDOM from "react-dom"
import Shambhala from "./shambhala"
import { appRootDomId } from "../../config/frontend"




/**
 * User Interface - entry point.
 *
 * @async
 * @function ui
 * @param {Function} logger
 * @param {Object} _context
 */
export default async function ui (logger, _context) {

    // render application's root into the DOM
    ReactDOM.render(
        React.createElement(Shambhala),
        document.getElementById(appRootDomId)
    )

    // greet
    logger.info("UI Loaded 🌈")

}
