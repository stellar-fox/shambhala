/**
 * Shambhala.
 *
 * Thunks.
 *
 * @module client-ui-thunks
 * @license Apache-2.0
 */




import {
    array,
    async,
    func,
    string,
    type,
} from "@xcmats/js-toolbox"
import throttle from "lodash.throttle"
import { duration } from "@material-ui/core/styles/transitions"
import { action } from "./redux"
import { messageThrottleTime } from "../../config/frontend"




/**
 * Private store.
 * This has nothing to do with redux.
 *
 * @private
 * @constant store
 */
const store = {}




/**
 * Pass "context" to the private store.
 *
 * Thunk actions (which are dispatched from the "react ui world"
 * as well as from the "shambhala actions world") has to have access
 * to the volatile memory. See it's definition in src/client/ui/index.js.
 *
 * @function setImperativeContext
 * @param {Object} context
 * @returns {Function} thunk action
 */
export const setImperativeContext = (context) =>
    async (_dispatch, _getState) => {
        store.context = context
    }




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
        if (ready) {
            await dispatch(action.setState({ showLoader: !ready }))
            await async.delay(duration.leavingScreen * 1.1)
            await dispatch(action.setState({ ready }))
            await dispatch(action.setState({ showUi: ready }))
        } else {
            await dispatch(action.setState({ showUi: ready }))
            await async.delay(duration.leavingScreen * 1.1)
            await dispatch(action.setState({ ready }))
            await dispatch(action.setState({ showLoader: !ready }))
        }
    }




/**
 * Set info message.
 *
 * @function setInfoMessage
 * @param {String} infoMessage
 * @returns {Function} thunk action
 */
export const setInfoMessage = (infoMessage = string.empty()) =>
    async (dispatch, getState) => {
        if (infoMessage === string.empty()) {
            let { infoMessage } = getState().App
            if (infoMessage === string.empty()) return infoMessage
        }
        return await dispatch(action.setState({ infoMessage }))
    }




/**
 * Set message that is currently being processed.
 * Also take care of "throttled" version and previous messages.
 *
 * @function setMessage
 * @param {String} newMessage
 * @returns {Function} thunk action
 */
export const setMessage = ((setThrottledMessage) =>
    (newMessage) =>
        async (dispatch, getState) => {
            let { message, throttledMessage } = getState().App
            setThrottledMessage(() =>
                func.pipe({
                    throttledMessage: [
                        newMessage, array.head(throttledMessage),
                    ],
                    viewNumber: 1,
                })(action.setState, dispatch)
            )
            return await func.pipe(
                { message: [newMessage, array.head(message)] }
            )(action.setState, dispatch)
        }
)(throttle(
    (setState) => setState(),
    messageThrottleTime, { leading: false }
))




/**
 * Sets `promptMutexLocked` key in redux.
 * Invoked from `getValueFromUser()` function in `functions.js`.
 *
 * @function setPromptMutexLocked
 * @param {Boolean} promptMutexLocked
 * @returns {Function} thunk action
 */
export const setPromptMutexLocked = (promptMutexLocked) =>
    async (dispatch, _getState) =>
        await dispatch(action.setState({ promptMutexLocked }))




/**
 * Reject promptMutex if it exists in imperative context.
 *
 * @function basicReject
 * @param {String} reason
 * @returns {Function} thunk action
 */
export const basicReject = (reason = string.empty()) =>
    async (_dispatch, _getState) => {
        if (type.isObject(store.context.promptMutex)) {
            store.context.promptMutex.reject(reason)
        }
        return reason
    }




/**
 * Resolve promptMutex if it exists in imperative context.
 *
 * @function basicResolve
 * @param {String} val
 * @returns {Function} thunk action
 */
export const basicResolve = (val) =>
    async (_dispatch, _getState) => {
        if (type.isObject(store.context.promptMutex)) {
            let value = null
            if (typeof val === "undefined") {
                value = store.context.promptMutexDefVal
            } else {
                value = val
            }
            store.context.promptMutex.resolve(value)
            return value
        }
        return val
    }




/**
 * redux -> action -> nextView() exposed to be used outside
 * of a UI context (see getMnemonic() in functions.js file).
 *
 * @function nextView
 * @returns {Function} thunk action
 */
export const nextView = () =>
    async (dispatch, _getState) =>
        await dispatch(action.nextView())
