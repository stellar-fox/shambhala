/**
 * Shambhala.
 *
 * Thunks.
 *
 * @module client-ui-thunks
 * @license Apache-2.0
 */




import { action } from "./reducers"




/**
 * Set application ready state.
 *
 * @function setAppReady
 * @param {Boolean} ready
 * @returns {Function} thunk action
 */
export const setAppReady = (ready) =>
    async (dispatch, _getState) =>
        await dispatch(action.setState({ ready }))
