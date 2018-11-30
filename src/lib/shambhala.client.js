/**
 * Shambhala.
 *
 * Library for accessing the client.
 *
 * @module client-lib
 * @license Apache-2.0
 */




import {
    async,
    codec,
    func,
    string,
    type,
} from "@xcmats/js-toolbox"
import { sha256 } from "@stellar-fox/cryptops"
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
         * @private
         * @function generateRandomWindowName
         * @returns {Promise.<String>}
         */
        generateRandomWindowName: () => {
            return "shambhala-client-" // + string.random(6)
        },




        /**
         * Ping - pong.
         *
         * @async
         * @private
         * @function ping
         * @returns {Promise.<String>}
         */
        ping: async () => {
            store.messageHandler.postMessage(
                message.PING_PONG
            )

            // first - client response (short waiting time)
            let data = await store.messageHandler
                .receiveMessage(
                    message.PING_PONG
                )

            // second - server response (longer waiting time)
            await store.messageHandler
                .receiveMessage(
                    message.PING_PONG,
                    defaultBackendPingTimeout
                )
                .then((backendData) => {
                    if (type.isObject(data))
                        Object.assign(data, backendData)
                })

            return data
        },




        /**
         * Handle shambhala target window opening.
         *
         * @async
         * @private
         * @function open
         * @returns {Promise.<String>}
         */
        open: async () => {

            // maybe shambhala is already up-and-running?
            try {

                return (await store.fn.ping()).version

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
                    `${
                        store.url.href
                    }?${
                        miniHash(sha256)(window.location.origin)
                    }`,
                    store.windowName
                )
                store.messageHandler.setRecipient(
                    store.client, store.windowName
                )

                // wait for 'message.READY' and resolve
                return (await store.messageHandler.receiveMessage(
                    message.READY, maximumWindowOpeningTime
                )).version

            }

        },




        /**
         * Communicate with shambhala instance.
         * Pass message with payload and wait for returned value.
         * Take care of cancellation and don't allow multiple simultaneous
         * communication attempts.
         *
         * @async
         * @private
         * @function communicate
         * @param {String} msg
         * @param {Object} [options] { payload, opts }
         * @returns {Promise}
         */
        communicate: async (
            msg,
            { payload = {}, opts = { hbCallback: func.identity } } = {}
        ) => {

            // don't try to communicate if there is any ongoing operation
            if (type.isString(store.currentlyProcessedMessage)) {
                throw `busy with ${
                    string.quote(store.currentlyProcessedMessage)
                }`
            }

            // save information about ongoing operation
            store.currentlyProcessedMessage = msg

            try {

                // ensure shambhala is opened
                await store.fn.open()

                // send message with appropriate payload
                store.messageHandler.postMessage(msg, payload)

                // make message receiving process cancellable
                let { promise, cancel } = async.cancellable(

                    // receive message with "heartbeat" in background
                    store.messageHandler.receiveMessageHB(msg, {
                        ...opts,

                        // stop the heartbeat if there is no ongoing
                        // operation (if it was cancelled externally)
                        hbCallback: (hbPayload, abortReceiving) => {
                            if (!type.isString(
                                store.currentlyProcessedMessage
                            )) {
                                abortReceiving()
                                opts.hbCallback(hbPayload, func.identity)
                            } else {
                                opts.hbCallback(hbPayload, abortReceiving)
                            }
                        },
                    })
                )

                // allow current receiving process to be cancelled externally
                store.cancelCurrentOperation = cancel

                // wait for the data-response from shambhala
                var data = await promise

            } finally {

                // whatever happen - clear information about ongoing
                // operation after it finishes work (either if it finish
                // normally or through exception)
                delete store.cancelCurrentOperation
                delete store.currentlyProcessedMessage

            }

            // return data that came from shambhala
            return data

        },

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
        let newurl = new URL(url)
        if (
            !type.toBool(store.url)  ||
            newurl.href !== store.url.href
        ) { store.url = newurl }
        if (!store.token) {
            if (opts.token) { store.token = opts.token }
            else { store.token = null }
        }
        if (
            !type.toBool(store.messageHandler)  ||
            newurl.href !== store.url.href
        ) {
            store.messageHandler = new MessageHandler(store.url.origin)
        }
    }




    /**
     * Handle shambhala target window opening.
     * Dev. - test.
     *
     * @async
     * @instance
     * @method open
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<String>}
     */
    open = store.fn.open




    /**
     * Ping - pong.
     * Dev. - test.
     *
     * @async
     * @instance
     * @method ping
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<String>}
     */
    ping = store.fn.ping




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
    getVersion = this.open




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
        let data = await store.fn.communicate(
            message.GENERATE_ADDRESS
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
        let data = await store.fn.communicate(
            message.ASSOCIATE_ADDRESS, {
                payload: { G_PUBLIC: accountId },
            }
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
        let data = await store.fn.communicate(
            message.GENERATE_SIGNING_KEYS, {
                payload: { G_PUBLIC: accountId },
            }
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
        let data = await store.fn.communicate(
            message.GENERATE_SIGNED_KEY_ASSOC_TX, {
                payload: {
                    G_PUBLIC: accountId,
                    sequence,
                    networkPassphrase,
                },
            }
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
        let data = await store.fn.communicate(
            message.GENERATE_KEY_ASSOC_TX, {
                payload: {
                    G_PUBLIC: accountId,
                    sequence,
                    networkPassphrase,
                },
            }
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
        let data = await store.fn.communicate(
            message.GET_PUBLIC_KEYS, {
                payload: { G_PUBLIC: accountId },
            }
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
        let data = await store.fn.communicate(
            message.BACKUP, {
                payload: { G_PUBLIC: accountId },
            }
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
     * @param {String} backup output of the `backup` method
     * @returns {Promise.<Object>}
     */
    restore = async (accountId, backup) => {
        let data = await store.fn.communicate(
            message.RESTORE, {
                payload: { G_PUBLIC: accountId, backup },
            }
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
        let data = await store.fn.communicate(
            message.CAN_SIGN_FOR, {
                payload: { G_PUBLIC: accountId },
            }
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
        let data = await store.fn.communicate(
            message.SIGN_TRANSACTION, {
                payload: {
                    G_PUBLIC: accountId,
                    TX_PAYLOAD: codec.b64enc(tspXDR),
                },
            }
        )

        if (data.ok) return [
            data.C_SIGNATURE,
            data.S_SIGNATURE,
        ]
        else throw new Error(data.error)
    }




    /**
     * Cancel current operation.
     *
     * @async
     * @instance
     * @method cancel
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<Boolean>}
     */
    cancel = async (reason = "cancelled") => {
        if (type.isFunction(store.cancelCurrentOperation)) {
            store.messageHandler.postMessage(message.CANCEL)
            store.cancelCurrentOperation(reason)
            return true
        }
        return false
    }




    /**
     * Close shambhala target window.
     *
     * @async
     * @instance
     * @method close
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<Boolean>}
     */
    close = async () => {
        let data = await store.fn.communicate(
            message.CLOSE
        )

        if (data.ok) return true
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
