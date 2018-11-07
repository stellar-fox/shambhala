/**
 * Shambhala.
 *
 * Helper functions for working within client context.
 *
 * @module client-functions
 * @license Apache-2.0
 */




import { async } from "@xcmats/js-toolbox"
import forage from "localforage"




/**
 * Get all data from shambhala-client local storage.
 *
 * @function getAllClientData
 * @returns {Promise.<Array>}
 */
export const getAllClientData = async () =>
    await async.map(await forage.keys(), async (G_PUBLIC) =>
        await forage.getItem(G_PUBLIC)
    )
