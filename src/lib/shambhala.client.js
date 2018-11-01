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
import { maximumWindowOpeningTime } from "../config/env"
import MessageHandler from "./message.handler"
import * as message from "./messages"




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
    getLibVersion = () => Promise.reject("NOT IMPLEMENTED")




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
     * Generate account. Returns an `account id` (`G_PUBLIC`).
     *
     * @async
     * @instance
     * @method generateAccount
     * @memberof module:client-lib~Shambhala
     * @returns {Promise.<String>}
     */
    generateAccount = async () => {
        await this._openShambhala()
        _store.messageHandler.postMessage(message.GENERATE_ACCOUNT)
        let data = await (
            _store.messageHandler
                .receiveMessage(message.GENERATE_ACCOUNT)
        )
        if (data.ok) return data.G_PUBLIC
        else throw new Error(data.error)
    }




    /**
     * Associate account. Returns an `account id` (`G_PUBLIC`).
     *
     * @async
     * @instance
     * @method associateAccount
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @returns {Promise.<String>}
     */
    associateAccount = (_accountId) => Promise.reject("NOT IMPLEMENTED")




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
     * @returns {Promise.<Uint8Array>}
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
        if (data.ok) codec.b64dec(data.tx)
        else throw new Error(data.error)
    }




    /**
     * Generate key association transaction. This transaction has to be signed
     * with an appropriate `SECRET` before it can be sent
     * to the _stellar network_.
     *
     * @async
     * @instance
     * @method generateKeyAssocTX
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @returns {Promise.<Uint8Array>}
     */
    generateKeyAssocTX = (_accountId) =>
        Promise.reject(codec.stringToBytes("NOT IMPLEMENTED"))




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
     * On behalf of an `account id` sign a given `transaction` (provided as
     * `StellarSDK.xdr.TransactionSignatureBase`).
     * Returns array of `StellarSDK.xdr.DecoratedSignature`.
     *
     * @async
     * @instance
     * @method signTransaction
     * @memberof module:client-lib~Shambhala
     * @param {String} accountId
     * @param {Uint8Array} transaction
     * @returns {Promise.<Array>}
     */
    signTransaction = (_accountId, _transaction) =>
        Promise.reject([codec.stringToBytes("NOT IMPLEMENTED")])
}
