/**
 * Shambhala.
 *
 * Helper functions for working within client context.
 *
 * @module client-functions
 * @license Apache-2.0
 */




import {
    async,
    codec,
    func,
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
