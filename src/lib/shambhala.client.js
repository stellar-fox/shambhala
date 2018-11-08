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
    // string,
    timeUnit,
    type,
} from "@xcmats/js-toolbox"
import { Transaction } from "stellar-sdk"
import { maximumWindowOpeningTime } from "../config/env"
import MessageHandler from "./message.handler"
import * as message from "./messages"
import { version } from "../../package.json"




/**
 * Private store.
 *
 * @private
 * @constant _store
 */
const _store = {}




/**
 * Handle the communication with a Shambhala instance.
 *
 * @class Shambhala
 * @param {String} url
 * @param {Object} [opts={}]
 */
export default class Shambhala {

    constructor (url, opts = {}) {
        if (!_store.url) { _store.url = new URL(url) }
        if (!_store.token) {
            if (opts.token) { _store.token = opts.token }
            else { _store.token = null }
        }
        if (!_store.messageHandler) {
            _store.messageHandler = new MessageHandler(_store.url.origin)
        }
    }




    /**
     * ...
     *
     * @instance
     * @private
     * @method _generateRandomWindowName
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<String>}
     */
    _generateRandomWindowName = () =>
        "shambhala-client-" // + string.random(6)




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

            return await this._ping()

        // 'ping' can throw because there was no recipient set
        // for 'postMessage' to work or because 'receiveMessage'
        // reached timeout which mean that shambhala was opened
        // but then closed and now it's gone
        } catch (_) {

            if (!type.isString(_store.windowName)) {
                _store.windowName = this._generateRandomWindowName()
            }

            // open shambhala window and set recipient in message handler
            _store.client = window.open(
                `${_store.url.href}?${window.location.origin}`,
                _store.windowName
            )
            _store.messageHandler.setRecipient(
                _store.client, _store.windowName
            )

            // wait for 'message.READY' and resolve
            return await _store.messageHandler.receiveMessage(
                message.READY, maximumWindowOpeningTime
            )

        }

    }




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
    _ping = async () => {
        _store.messageHandler.postMessage(message.PING)

        let data = await (
            _store.messageHandler
                .receiveMessage(
                    message.PONG,
                    1 * timeUnit.second
                )
        )

        return data.hash
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
     * Get associated `public keys` for a given `account id`.
     *
     * @async
     * @instance
     * @method getPublicKeys
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @returns {Promise.<Array>}
     */
    getPublicKeys = (_accountId) => Promise.reject(["NOT IMPLEMENTED"])




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

        _store.messageHandler.postMessage(message.GENERATE_ADDRESS)

        let data = await (
            _store.messageHandler
                .receiveMessage(message.GENERATE_ADDRESS)
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
    associateAddress = (_accountId) => Promise.reject("NOT IMPLEMENTED")




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

        _store.messageHandler.postMessage(
            message.GENERATE_SIGNING_KEYS,
            { G_PUBLIC: accountId }
        )

        let data = await (
            _store.messageHandler
                .receiveMessage(
                    message.GENERATE_SIGNING_KEYS,
                    20 * timeUnit.second
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
     * @returns {Promise.<Transaction>}
     */
    generateSignedKeyAssocTX = async (
        accountId, sequence, networkPassphrase
    ) => {
        await this._openShambhala()

        _store.messageHandler.postMessage(
            message.GENERATE_SIGNED_KEY_ASSOC_TX,
            {
                G_PUBLIC: accountId,
                sequence,
                networkPassphrase,
            }
        )

        let data = await (
            _store.messageHandler
                .receiveMessage(message.GENERATE_SIGNED_KEY_ASSOC_TX)
        )

        if (data.ok) return new Transaction(data.tx)
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
     * @returns {Promise.<Transaction>}
     */
    generateKeyAssocTX = async (
        accountId, sequence, networkPassphrase
    ) => {
        await this._openShambhala()

        _store.messageHandler.postMessage(
            message.GENERATE_KEY_ASSOC_TX,
            {
                G_PUBLIC: accountId,
                sequence,
                networkPassphrase,
            }
        )

        let data = await (
            _store.messageHandler
                .receiveMessage(message.GENERATE_KEY_ASSOC_TX)
        )

        if (data.ok) return new Transaction(data.tx)
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

        _store.messageHandler.postMessage(
            message.BACKUP,
            { G_PUBLIC: accountId }
        )

        let data = await (
            _store.messageHandler
                .receiveMessage(message.BACKUP)
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
     * @returns {Promise.<Boolean>}
     */
    restore = async (accountId, payload) => {
        await this._openShambhala()

        _store.messageHandler.postMessage(
            message.RESTORE,
            { G_PUBLIC: accountId, payload }
        )

        let data = await (
            _store.messageHandler
                .receiveMessage(message.RESTORE)
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
    canSignFor = (_accountId) => Promise.resolve(false)




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

        _store.messageHandler.postMessage(
            message.SIGN_TRANSACTION,
            {
                G_PUBLIC: accountId,
                TX_PAYLOAD: codec.b64enc(tspXDR),
            }
        )

        let data = await (
            _store.messageHandler
                .receiveMessage(
                    message.SIGN_TRANSACTION,
                    20 * timeUnit.second
                )
        )

        if (data.ok) return [
            data.C_SIGNATURE,
            data.S_SIGNATURE,
        ]
        else throw new Error(data.error)
    }

}
