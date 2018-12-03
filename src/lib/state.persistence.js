/**
 * Shambhala.
 *
 * Persisting redux state in `sessionStorage`.
 *
 * @module state-persistence
 * @license Apache-2.0
 */




import {
    type,
    utils,
} from "@xcmats/js-toolbox"
import { ssAppStateKey } from "../config/frontend"




/**
 * Restore current Redux state from `sessionStorage`.
 *
 * @function loadState
 */
export const loadState = () =>
    utils.handleException(
        () => type.nullToUndefined(
            JSON.parse(sessionStorage.getItem(ssAppStateKey))
        ),
        // eslint-disable-next-line no-console
        (ex) => type.nullToUndefined(console.log(ex))
    )




/**
 * Persists current state of the application.
 *
 * @function saveState
 * @param {Object} state
 */
export const saveState = (state) =>
    utils.handleException(
        () => sessionStorage.setItem(ssAppStateKey, JSON.stringify(state)),
        // eslint-disable-next-line no-console
        console.log
    )
