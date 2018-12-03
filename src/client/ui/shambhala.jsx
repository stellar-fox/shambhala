/**
 * Shambhala.
 *
 * Main frontend application component.
 *
 * @module components
 * @license Apache-2.0
 */




import React from "react"

import {
    applyMiddleware,
    createStore,
    combineReducers,
} from "redux"
import thunk from "redux-thunk"
import { Provider } from "react-redux"
import {
    composeWithDevTools as composeWithDevTools_prod
} from "redux-devtools-extension/developmentOnly"
import {
    composeWithDevTools as composeWithDevTools_dev
} from "redux-devtools-extension"

import {
    type,
    utils,
} from "@xcmats/js-toolbox"

import throttle from "lodash.throttle"
import {
    loadState,
    saveState,
} from "../../lib/state.persistence"
import { ssSaveThrottlingTime } from"../../config/frontend"

import reducers from "./reducers"

import "./index.css"




/**
 * Redux store with redux-devtools-extension.
 *
 * @constant {Object} store
 */
export const store = (() => {
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




/**
 * <Shambhala> - main component.
 *
 * @function Shambhala
 * @returns {React.ReactElement}
 */
export default () =>
    <Provider store={store}>
        <span role="img" aria-label="rocket">🚀</span>
    </Provider>




// add some elements to 'sf' dev. namespace
if (utils.devEnv()) {
    if (!type.isObject(window.sf)) window.sf = {};
    (async () => {
        window.sf = {
            ...window.sf,
            store, React,
            dispatch: store.dispatch,
        }
    })()
}
