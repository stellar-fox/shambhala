/**
 * Shambhala.
 *
 * Functions for working within client's context.
 *
 * @module client-functions
 * @license Apache-2.0
 */




import {
    async,
    codec,
    func,
    string,
    struct,
    type,
    utils,
} from "@xcmats/js-toolbox"
import forage from "localforage"
import { decodeUUID } from "@stellar-fox/cryptops"




/**
 * Private store.
 *
 * @private
 * @constant store
 */
const store = {

    // default "no-op" logger
    logger: struct.dict(
        ["log", "info", "warn", "error"].map((m) => [m, func.identity])
    ),

    // default imperative context
    context: {},

    // thunkActions has to be passed from the outside (thunks bound to
    // a concrete instance of redux store)
    thunkActions: null,

}




/**
 * Pass all needed "global" data to the private store.
 *
 * Functions defined in this module require access to an application
 * singletons like `logger`, `context`, `thunkActions` (which are `thunks`
 * bound to an application's `redux store`). It would really be inconvenient
 * to pass around the needed variables as an explicit parameters to
 * functions. Instead - this function can be invoked once (or many
 * times in fact) with all the needed variables. As a result of this
 * invocation these variables will be assigned to the "private store" defined
 * at the top-level of this file, which is a global (module-level) variable
 * visible to all functions.
 *
 * Thanks to ES6 module "aliasing bindings" semantics and the way that
 * side effects are handled (initial const assignment), whenever any of the
 * exported functions is imported in another module it has access to the
 * "private store" with all its contents, while, of course, no other entity
 * from that module has access to it. Just like in a "module pattern"
 * leveraging closures.
 *
 * The same mechanism is used in 'src/client/ui/thunks.js' and
 * 'src/lib/shambhala.client.js' modules.
 *
 * @function setImperativeData
 * @param {Object} data
 */
export const setImperativeData = (data) => {
    Object.assign(store, data)
}




/**
 * Get all data from shambhala-client local storage.
 *
 * @function getAllClientData
 * @returns {Promise.<Array>}
 */
export const getAllClientData = async () => {

    let timestamp = func.flow(
        (key) => key.C_UUID,
        codec.hexToBytes,
        decodeUUID,
        (dUUID) => dUUID.timestamp,
    )

    return (
        await async.map(
            await forage.keys(),
            forage.getItem.bind(forage)
        )
    )
        .map((item) => ({ _ts: timestamp(item), ...item }))
        .sort((a, b) => timestamp(a).getTime() - timestamp(b).getTime())

}




/**
 * Get value from user (console).
 *
 * @async
 * @function getValueFromUser
 * @param {String} [promptText]
 * @param {String} [name]
 * @param {*} [defVal] default value
 * @returns {Promise.<String>}
 */
export const getValueFromUser = async (
    promptText = "Enter", name = "VALUE", defVal = null
) => {
    store.logger.warn(`${promptText} ${name}`)
    store.logger.info(`p.yes(${name})`, "p.no(optional:REASON)")
    store.context.promptMutex = async.createMutex()
    await store.thunkActions.setPromptMutexResolveValue(defVal)
    if (type.isObject(window)) {
        window.p = {
            yes: (val = defVal) => store.context.promptMutex.resolve(val),
            no: (r = string.empty()) => store.context.promptMutex.reject(r),
        }
    }
    try { var val = await store.context.promptMutex.lock() }
    finally {
        if (type.isObject(window)) delete window.p
        delete store.context.promptMutex
        await store.thunkActions.setPromptMutexResolveValue(null)
    }
    return val
}




/**
 * Ask user a question (`promptText`) and expect yes/no answer.
 *
 * @async
 * @function promptUser
 * @param {String} [promptText]
 * @returns {Promise.<Boolean>}
 */
export const promptUser = async (
    promptText = "Yes or no?"
) =>
    await utils.handleRejection(
        async () => await getValueFromUser(promptText, string.empty(), true),
        async () => false
    )




/**
 * Get user PASSPHRASE (from the console).
 *
 * @async
 * @function getPassphrase
 * @returns {Promise.<String>}
 */
export const getPassphrase = func.partial(
    func.rearg(getValueFromUser)(1, 2)
)("PASSPHRASE", string.random(10))




/**
 * Get user PIN (from the console).
 *
 * @async
 * @function getPin
 * @returns {Promise.<String>}
 */
export const getPin = func.partial(
    func.rearg(getValueFromUser)(1, 2)
)("PIN", "00000")
