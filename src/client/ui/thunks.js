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
            let
                { message, throttledMessage } = getState().App,
                setState = (key, nm, pm) => func.pipe(
                    { [key]: [nm, array.head(pm)] }
                )(action.setState, dispatch)
            setThrottledMessage(
                func.partial(setState)(
                    "throttledMessage",
                    newMessage,
                    throttledMessage
                )
            )
            return await setState("message", newMessage, message)
        }
)(throttle(
    (setState) => setState(),
    messageThrottleTime, { leading: false }
))




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
export const basicResolve = (val = string.empty()) =>
    async (_dispatch, getState) => {
        if (type.isObject(store.context.promptMutex)) {
            let value = null
            if (val === string.empty()) {
                let { promptMutexResolveValue } = getState().App
                value = promptMutexResolveValue
            } else {
                value = val
            }
            store.context.promptMutex.resolve(value)
            return value
        }
        return val
    }




/**
 * To be deleted.
 * DEV. PROTO.
 *
 * @function setPromptMutexResolveValue
 * @param {String} val
 * @returns {Function} thunk action
 */
export const setPromptMutexResolveValue = (promptMutexResolveValue) =>
    async (dispatch, _getState) =>
        await dispatch(action.setState({ promptMutexResolveValue }))
