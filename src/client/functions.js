/**
 * Shambhala.
 *
 * Helper functions for working within client's context.
 *
 * @module client-functions
 * @license Apache-2.0
 */




import {
    async,
    codec,
    func,
    string,
    type,
} from "@xcmats/js-toolbox"
import forage from "localforage"
import { decodeUUID } from "@stellar-fox/cryptops"




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
 * @param {Object} logger
 * @param {Object} context
 * @param {String} [name]
 * @param {*} [defVal] default value
 * @returns {String}
 */
export const getValueFromUser = async (
    logger, context, name = "VALUE", defVal = null
) => {
    logger.warn(`Please provide a ${name}`)
    logger.info(`p.yes(${name})`, "p.no(REASON)")
    context.promptMutex = async.createMutex()
    if (type.isObject(window)) {
        window.p = {
            yes: (val = defVal) => context.promptMutex.resolve(val),
            no: (r = string.empty()) => context.promptMutex.reject(r),
        }
    }
    try { var val = await context.promptMutex.lock() }
    finally {
        if (type.isObject(window)) delete window.p
        delete context.promptMutex
    }
    return val
}




/**
 * Get user PASSPHRASE (from the console).
 *
 * @async
 * @function getPassphrase
 * @param {Object} logger
 * @param {Object} context
 * @returns {String}
 */
export const getPassphrase = func.partial(
    func.rearg(getValueFromUser)(2, 3, 0, 1)
)("PASSPHRASE", string.random(10))




/**
 * Get user PIN (from the console).
 *
 * @async
 * @function getPin
 * @param {Object} logger
 * @param {Object} context
 * @returns {String}
 */
export const getPin = func.partial(
    func.rearg(getValueFromUser)(2, 3, 0, 1)
)("PIN", "00000")
