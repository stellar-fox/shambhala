/**
 * Shambhala.
 *
 * Library for accessing the client.
 *
 * @module shambhala-client
 * @license Apache-2.0
 */




import {
    codec,
    //string,
    type,
} from "@xcmats/js-toolbox"
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
            _store.messageHandler = new MessageHandler(_store)
        }
    }


    /**
     * ...
     */
    _generateRandomWindowName = () =>
        "shambhala-client-" //+ string.random(6)


    /**
     * ...
     */
    _openShambhala = () =>
        new Promise((resolve, _reject) => {
            if (!type.isString(_store.windowName)) {
                _store.windowName = this._generateRandomWindowName()
            }
            _store.client = window.open(
                _store.url.href,
                _store.windowName
            )
            _store.messageHandler.handle(message.READY, resolve)
        })


    /**
     * Get library version.
     *
     * @async
     * @instance
     * @method getLibVersion
     * @memberof module:shambhala-client~Shambhala
     * @returns {Promise.<String>}
     */
    getLibVersion = () => Promise.reject("NOT IMPLEMENTED")


    /**
     * Query the client for its version.
     *
     * @async
     * @instance
     * @method getVersion
     * @memberof module:shambhala-client~Shambhala
     * @returns {Promise.<String>}
     */
    getVersion = () => Promise.reject("NOT IMPLEMENTED")


    /**
     * Get associated `public keys` for a given `account id`.
     *
     * @async
     * @instance
     * @method getPublicKeys
     * @memberof module:shambhala-client~Shambhala
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
     * @memberof module:shambhala-client~Shambhala
     * @returns {Promise.<String>}
     */
    generateAccount = async () => {
        await this._openShambhala()

        _store.client.postMessage(
            JSON.stringify({ message: message.PING }),
            _store.url.origin
        )

        return "NOT IMPLEMENTED"
    }


    /**
     * Associate account. Returns an `account id` (`G_PUBLIC`).
     *
     * @async
     * @instance
     * @method associateAccount
     * @memberof module:shambhala-client~Shambhala
     * @param {String} accountId
     * @returns {Promise.<String>}
     */
    associateAccount = (_accountId) => Promise.reject("NOT IMPLEMENTED")


    /**
     * Generate set of signing keys for a given `account id`.
     * Returns array with `C_PUBLIC` and `S_PUBLIC`.
     *
     * @async
     * @instance
     * @method generateSigningKeys
     * @memberof module:shambhala-client~Shambhala
     * @param {String} accountId
     * @returns {Promise.<Array>}
     */
    generateSigningKeys = (_accountId) => Promise.reject(["NOT IMPLEMENTED"])


    /**
     * Generate **signed** key association transaction, ready to be submitted
     * to the _stellar network_. If such transaction can't be generated
     * an exception is thrown. This operation can be invoked maximum once.
     *
     * @async
     * @instance
     * @method generateSignedKeyAssocTX
     * @memberof module:shambhala-client~Shambhala
     * @param {String} accountId
     * @returns {Promise.<Uint8Array>}
     */
    generateSignedKeyAssocTX = (_accountId) =>
        Promise.reject(codec.stringToBytes("NOT IMPLEMENTED"))


    /**
     * Generate key association transaction. This transaction has to be signed
     * with an appropriate `SECRET` before it can be sent
     * to the _stellar network_.
     *
     * @async
     * @instance
     * @method generateKeyAssocTX
     * @memberof module:shambhala-client~Shambhala
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
     * @memberof module:shambhala-client~Shambhala
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
     * @memberof module:shambhala-client~Shambhala
     * @param {String} accountId
     * @param {Uint8Array} transaction
     * @returns {Promise.<Array>}
     */
    signTransaction = (_accountId, _transaction) =>
        Promise.reject([codec.stringToBytes("NOT IMPLEMENTED")])
}
