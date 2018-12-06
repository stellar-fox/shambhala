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

import {
    composeWithDevTools as composeWithDevTools_prod
} from "redux-devtools-extension/developmentOnly"
import {
    composeWithDevTools as composeWithDevTools_dev
} from "redux-devtools-extension"

import {
    applyMiddleware,
    createStore,
    combineReducers,
} from "redux"
import thunk from "redux-thunk"

import {
    type,
    utils,
} from "@xcmats/js-toolbox"

import throttle from "lodash.throttle"
import {
    loadState,
    saveState,
} from "../../lib/state.persistence"

import * as thunks from "./thunks"
import reducers from "./redux"
import { theme } from "./theme"
import ShambhalaUi from "./components/root"

import {
    appRootDomId,
    ssSaveThrottlingTime,
} from "../../config/frontend"




/**
 * User Interface - entry point.
 *
 * @async
 * @function ui
 * @param {Function} logger
 * @param {Object} _context
 * @returns {Object} { store, thunks }
 */
export default async function ui (logger, _context) {

    // create redux store with thunk-middleware and redux-devtools-extension
    const store = (() => {
        let
            composeWithDevTools =
                !utils.devEnv() ?
                    composeWithDevTools_prod :
                    composeWithDevTools_dev,
            s =
                createStore(
                    combineReducers(reducers),
                    loadState(),
                    composeWithDevTools(
                        applyMiddleware(
                            thunk
                        )
                    )
                )

        // save state in session storage in 'ssSaveThrottlingTime' intervals
        s.subscribe(
            throttle(
                () => saveState(s.getState()),
                ssSaveThrottlingTime
            )
        )

        return s
    })()




    // because of save-restore session mechanism we need to take care of
    // initial application-readiness state (at this point it's not ready)
    store.dispatch(thunks.setAppReady(false))
    store.dispatch(thunks.setInfoMessage("Loading UI ..."))




    // add some elements to 'sf' dev. namespace
    if (utils.devEnv()) {
        if (!type.isObject(window.sf)) window.sf = {}
        window.sf = {
            ...window.sf,
            React, ReactDOM,
            store, dispatch: store.dispatch,
            theme,
        }
    }




    // render application's root into the DOM
    ReactDOM.render(
        React.createElement(ShambhalaUi, { store, theme }),
        document.getElementById(appRootDomId)
    )




    // greet
    logger.info("UI Loaded 🌈")




    return { store, thunks }
}
