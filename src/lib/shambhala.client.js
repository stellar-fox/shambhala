/**
 * Shambhala.
 *
 * Library for accessing the client.
 *
 * @module client-lib
 * @license Apache-2.0
 */




import {
    codec,
    func,
    // string,
    type,
} from "@xcmats/js-toolbox"
import { miniHash } from "./utils"
import {
    inspectTSP,
    signTSP,
} from "./txops"
import { shambhalaTesting as testingModule } from "./shambhala.testing"
import {
    defaultBackendPingTimeout,
    maximumWindowOpeningTime,
} from "../config/env"
import MessageHandler from "./message.handler"
import * as message from "./messages"
import { version } from "../../package.json"




/**
 * Private store.
 *
 * @private
 * @constant store
 */
const store = {

    // private functions namespace
    fn: {

        /**
         * ...
         *
         * @instance
         * @private
         * @method generateRandomWindowName
         * @memberof module:client-lib~Shambhala
         * @returns {Promise.<String>}
         */
        generateRandomWindowName: () => {
            return "shambhala-client-" // + string.random(6)
        },


        /**
         * Ping-Pong.
         *
         * @async
         * @instance
         * @private
         * @method ping
         * @memberof module:client-lib~Shambhala
         * @returns {Promise.<String>}
         */
        ping: async () => {
            store.messageHandler.postMessage(message.PING_PONG)

            let data = await store.messageHandler
                .receiveMessage(
                    message.PING_PONG,
                    defaultBackendPingTimeout
                )

            return data.hash
        },


        /**
         * ...
         */
        cancellable: func.identity,

    },

}




/**
 * Handle the communication with a Shambhala instance.
 *
 * @class Shambhala
 * @param {String} url
 * @param {Object} [opts={}]
 */
export class Shambhala {

    constructor (url, opts = {}) {
        if (!store.url) { store.url = new URL(url) }
        if (!store.token) {
            if (opts.token) { store.token = opts.token }
            else { store.token = null }
        }
        if (!store.messageHandler) {
            store.messageHandler = new MessageHandler(store.url.origin)
        }
    }




    /**
     * Handle shambhala target window opening.
     *
     * @async
     * @instance
     * @private
     * @method _openShambhala
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<String>}
     */
    _openShambhala = async () => {

        // maybe shambhala is already up-and-running?
        try {

            return await store.fn.ping()

        // 'ping' can throw because there was no recipient set
        // for 'postMessage' to work or because 'receiveMessage'
        // reached timeout which mean that shambhala was opened
        // but then closed and now it's gone
        } catch (_) {

            if (!type.isString(store.windowName)) {
                store.windowName = store.fn.generateRandomWindowName()
            }

            // open shambhala window and set recipient in message handler
            store.client = window.open(
                `${store.url.href}?${miniHash(window.location.origin)}`,
                store.windowName
            )
            store.messageHandler.setRecipient(
                store.client, store.windowName
            )

            // wait for 'message.READY' and resolve
            return await store.messageHandler.receiveMessage(
                message.READY, maximumWindowOpeningTime
            )

        }

    }




    /**
     * Get library version.
     *
     * @async
     * @instance
     * @method getLibVersion
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<String>}
     */
    getLibVersion = async () => version




    /**
     * Query the client for its version.
     *
     * @async
     * @instance
     * @method getVersion
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<String>}
     */
    getVersion = () => Promise.reject("NOT IMPLEMENTED")




    /**
     * Generate address. Returns an `account id` (`G_PUBLIC`).
     *
     * @async
     * @instance
     * @method generateAddress
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<String>}
     */
    generateAddress = async () => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.GENERATE_ADDRESS
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.GENERATE_ADDRESS
                )
        )

        if (data.ok) return data.G_PUBLIC
        else throw new Error(data.error)
    }




    /**
     * Associate address. Returns an `account id` (`G_PUBLIC`).
     *
     * @async
     * @instance
     * @method associateAddress
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @returns {Promise.<String>}
     */
    associateAddress = async (accountId) => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.ASSOCIATE_ADDRESS,
            { G_PUBLIC: accountId }
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.ASSOCIATE_ADDRESS
                )
        )

        if (data.ok) return data.G_PUBLIC
        else throw new Error(data.error)
    }




    /**
     * Generate set of signing keys for a given `account id`.
     * Returns object with `C_PUBLIC` and `S_PUBLIC`.
     *
     * @async
     * @instance
     * @method generateSigningKeys
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @returns {Promise.<Object>}
     */
    generateSigningKeys = async (accountId) => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.GENERATE_SIGNING_KEYS,
            { G_PUBLIC: accountId }
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.GENERATE_SIGNING_KEYS
                )
        )

        if (data.ok) return {
            C_PUBLIC: data.C_PUBLIC,
            S_PUBLIC: data.S_PUBLIC,
        }
        else throw new Error(data.error)
    }




    /**
     * Generate **signed** key association transaction, ready to be submitted
     * to the _stellar network_. If such transaction can't be generated
     * an exception is thrown. This operation can be invoked maximum once.
     *
     * @async
     * @instance
     * @method generateSignedKeyAssocTX
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @param {String} sequence
     * @param {String} networkPassphrase
     * @returns {Promise.<String>} b64-encoded TransactionEnvelope XDR
     */
    generateSignedKeyAssocTX = async (
        accountId, sequence, networkPassphrase
    ) => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.GENERATE_SIGNED_KEY_ASSOC_TX,
            {
                G_PUBLIC: accountId,
                sequence,
                networkPassphrase,
            }
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.GENERATE_SIGNED_KEY_ASSOC_TX
                )
        )

        if (data.ok) return data.tx
        else throw new Error(data.error)
    }




    /**
     * Generate key association transaction. This transaction has to be signed
     * with an appropriate `SECRET` before it can submitted
     * to the _stellar_ network.
     *
     * @async
     * @instance
     * @method generateKeyAssocTX
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @param {String} sequence
     * @param {String} networkPassphrase
     * @returns {Promise.<String>} b64-encoded TransactionEnvelope XDR
     */
    generateKeyAssocTX = async (
        accountId, sequence, networkPassphrase
    ) => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.GENERATE_KEY_ASSOC_TX,
            {
                G_PUBLIC: accountId,
                sequence,
                networkPassphrase,
            }
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.GENERATE_KEY_ASSOC_TX
                )
        )

        if (data.ok) return data.tx
        else throw new Error(data.error)
    }




    /**
     * Get associated `public keys` for a given `account id`.
     *
     * @async
     * @instance
     * @method getPublicKeys
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @returns {Promise.<Array>}
     */
    getPublicKeys = async (accountId) => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.GET_PUBLIC_KEYS,
            { G_PUBLIC: accountId }
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.GET_PUBLIC_KEYS
                )
        )

        if (data.ok) return {
            G_PUBLIC: data.G_PUBLIC,
            C_PUBLIC: data.C_PUBLIC,
            S_PUBLIC: data.S_PUBLIC,
        }
        else throw new Error(data.error)
    }




    /**
     * Request (encrypted) backup of a shambhala frontend
     * web-storage contents for a given `account id`.
     *
     * @async
     * @instance
     * @method backup
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @returns {Promise.<String>} base64-encoded, encrypted content
     */
    backup = async (accountId) => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.BACKUP,
            { G_PUBLIC: accountId }
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.BACKUP
                )
        )

        if (data.ok) return data.payload
        else throw new Error(data.error)
    }




    /**
     * Request restoring of shambhala frontend (web-storage)
     * contents from a given `payload` for a given `account id`.
     *
     * @async
     * @instance
     * @method restore
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @param {String} payload output of the `backup` method
     * @returns {Promise.<Object>}
     */
    restore = async (accountId, payload) => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.RESTORE,
            { G_PUBLIC: accountId, payload }
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.RESTORE
                )
        )

        if (data.ok) return {
            C_PUBLIC: data.C_PUBLIC,
            S_PUBLIC: data.S_PUBLIC,
        }
        else throw new Error(data.error)
    }




    /**
     * Returns `true` if transaction can be signed
     * on behalf of an `account id`, `false` otherwise.
     *
     * @async
     * @instance
     * @method canSignFor
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @returns {Promise.<Boolean>}
     */
    canSignFor = async (accountId) => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.CAN_SIGN_FOR,
            { G_PUBLIC: accountId }
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.CAN_SIGN_FOR
                )
        )

        if (data.ok) return data.answer
        else throw new Error(data.error)
    }




    /**
     * On behalf of an `account id` compute appropriate signatures
     * for `transaction` (provided as XDR-encoded - `Uint8Array` -
     * `StellarSDK.xdr.TransactionSignaturePayload`). Returns array
     * of base64-encoded `DecoratedSignature`.
     *
     * Example:
     *
     * ```
     * let signatures = await shambhala.signTransaction(
     *     "G...", tx.signatureBase()
     * )
     *
     * tx.signatures.push(
     *     ...(signatures.map((s) =>
     *         xdr.DecoratedSignature.fromXDR(s, "base64")
     *     ))
     * )
     * ```
     *
     * @async
     * @instance
     * @method signTransaction
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @param {Uint8Array} tspXDR XDR-encoded `TransactionSignaturePayload`
     * @returns {Promise.<Array>} Array of b64-XDR-ecoded `DecoratedSignature`.
     */
    signTransaction = async (accountId, tspXDR) => {
        await this._openShambhala()

        store.messageHandler.postMessage(
            message.SIGN_TRANSACTION,
            {
                G_PUBLIC: accountId,
                TX_PAYLOAD: codec.b64enc(tspXDR),
            }
        )

        let data = await store.fn.cancellable(
            store.messageHandler
                .receiveMessageHB(
                    message.SIGN_TRANSACTION
                )
        )

        if (data.ok) return [
            data.C_SIGNATURE,
            data.S_SIGNATURE,
        ]
        else throw new Error(data.error)
    }

}




/**
 * @see {@link module:txops-lib}
 */
export {
    inspectTSP,
    signTSP,
} from "./txops"




/**
 * @see {@link module:testing-lib}
 */
export const shambhalaTestingModule = func.partial(testingModule)({
    Shambhala, inspectTSP, signTSP,
})




/**
 * Default export.
 */
export default Shambhala
