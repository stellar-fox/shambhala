/**
 * Shambhala.
 *
 * Thunks.
 *
 * @module client-ui-thunks
 * @license Apache-2.0
 */




import {
    async,
    string,
} from "@xcmats/js-toolbox"
import { action } from "./redux"




/**
 * Set application ready state.
 *
 * @function setAppReady
 * @param {Boolean} ready
 * @param {Number} [delay]
 * @returns {Function} thunk action
 */
export const setAppReady = (ready, delay = 0) =>
    async (dispatch, _getState) => {
        if (delay > 0) { await async.delay(delay) }
        await dispatch(action.setState({ ready }))
    }




/**
 * Set info message.
 *
 * @function setInfoMessage
 * @param {Boolean} ready
 * @returns {Function} thunk action
 */
export const setInfoMessage = (infoMessage = string.empty()) =>
    async (dispatch, _getState) =>
        await dispatch(action.setState({ infoMessage }))
