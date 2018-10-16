/**
 * Shambhala.
 *
 * Library for accessing the client.
 *
 * @module shambhala-client
 * @license Apache-2.0
 */




import { codec } from "@xcmats/js-toolbox"




/**
 * Handle the communication with a Shambhala instance.
 *
 * @class Shambhala
 * @param {String} url
 * @param {Object} [opts={}]
 */
export default class Shambhala {

    constructor (url, opts = {}) {
        this.url = url
        if (opts.token) { this.token = opts.token }
        else { this.token = null }
    }


    /**
     * Get library version.
     *
     * @async
     * @instance
     * @method getLibVersion
     * @memberof module:shambhala-client~Shambhala
     * @returns {Promise.<String>}
     */
    getLibVersion = () => Promise.resolve("NOT IMPLEMENTED")


    /**
     * Query the client for its version.
     *
     * @async
     * @instance
     * @method getVersion
     * @memberof module:shambhala-client~Shambhala
     * @returns {Promise.<String>}
     */
    getVersion = () => Promise.resolve("NOT IMPLEMENTED")


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
    getPublicKeys = (_accountId) => Promise.resolve(["NOT IMPLEMENTED"])


    /**
     * Generate account. Returns an `account id` (`G_PUBLIC`).
     *
     * @async
     * @instance
     * @method generateAccount
     * @memberof module:shambhala-client~Shambhala
     * @returns {Promise.<String>}
     */
    generateAccount = () => Promise.resolve("NOT IMPLEMENTED")


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
    associateAccount = (_accountId) => Promise.resolve("NOT IMPLEMENTED")


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
    generateSigningKeys = (_accountId) => Promise.resolve(["NOT IMPLEMENTED"])


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
        Promise.resolve(codec.stringToBytes("NOT IMPLEMENTED"))


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
        Promise.resolve(codec.stringToBytes("NOT IMPLEMENTED"))


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
        Promise.resolve([codec.stringToBytes("NOT IMPLEMENTED")])
}
