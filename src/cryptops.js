/**
 * Crypto-related operations (library).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import {
    codec,
    func,
    handleException,
    isBrowser,
    math,
    range,
    string,
} from "@xcmats/js-toolbox"
import crypto from "crypto-browserify"
import {
    codec as sjclCodec,
    hash as sjclHash,
    misc as sjclMisc,
} from "sjcl"
import {
    hash as naclHash,
    randomBytes as naclRandomBytes,
    secretbox as naclSecretbox,
} from "tweetnacl"




/**
 * Concatenate contents of given byte arrays (Uint8Array) into new
 * byte array (Uint8Array).
 *
 * @function concatBytes
 * @param {...Uint8Array} u8as
 * @return {Uint8Array}
 */
export const concatBytes = (...u8as) => {
    let result = new Uint8Array(math.sum(u8as.map((u8a) => u8a.length)))
    u8as.reduce((pointer, u8a) => {
        result.set(u8a, pointer)
        return pointer + u8a.length
    }, 0)
    return result
}




/**
 * Retrieve 'n' random bytes from CSPRNG pool.
 * Alias for tweetnacl.randomBytes.
 *
 * @function random
 * @param {Number} n
 * @returns {Uint8Array}
 */
export const random = naclRandomBytes




/**
 * Compute a sha256 hash from a given input.
 * Uses sjcl's sha256 implementation.
 *
 * @function sha256
 * @param {Uint8Array} input
 * @returns {Uint8Array}
 */
export const sha256 = func.compose(
    codec.hexToBytes,
    sjclCodec.hex.fromBits,
    sjclHash.sha256.hash,
    sjclCodec.hex.toBits,
    codec.bytesToHex,
)




/**
 * Compute a sha512 hash from a given input.
 * Uses tweetnacl's sha512 implementation.
 *
 * @function sha512
 * @param {Uint8Array} input
 * @returns {Uint8Array}
 */
export const sha512 = naclHash




/**
 * Password-based key-derivation.
 * Uses pbkdf2 implemented in sjcl.
 *
 * @function genKey
 * @param {String} [pass=string.empty()] A password to derive key from.
 * @param {Uint8Array} [salt=(new Uint8Array(32)).fill(0)]
 * @param {Number} [count=2**12] Difficulty.
 * @returns {Uint8Array}
 */
export const genKey = (
    pass = string.empty(),
    salt = (new Uint8Array(32)).fill(0),
    count = 2**12
) => func.compose(
    codec.hexToBytes,
    sjclCodec.hex.fromBits
)(
    sjclMisc.pbkdf2(
        sjclCodec.utf8String.toBits(pass),
        func.compose(sjclCodec.hex.toBits, codec.bytesToHex)(salt),
        count
    )
)




/**
 * Generate 48 bits (6 bytes) timestamp - miliseconds since epoch
 *
 * @function timestamp
 * @returns {Uint8Array}
 */
export const timestamp = () => (
    (rd) => codec.hexToBytes(
        range(6*2)
            .reduce(
                (acc, _el, i) =>
                    i < rd.length ?
                        [rd[i],].concat(acc) :
                        [0,].concat(acc),
                []
            ).join(string.empty())
    )
)(Date.now().toString(16).split(string.empty()).reverse())




/**
 * Generate 128 bits UUID. Comprised of:
 * - 48 bits of miliseconds since epoch
 * - 32 bits of truncated SHA256 sum of userAgent string
 * - 48 random bits
 *
 * @function genUUID
 * @returns {Uint8Array}
 */
export const genUUID = () => concatBytes(

    // 48 bits (6 bytes): timestamp - miliseconds since epoch
    timestamp(),

    // 32 bits (4 bytes): truncated SHA256 sum of userAgent string
    func.compose(
        sha256,
        codec.stringToBytes
    )(
        handleException(
            () => isBrowser() ?
                navigator.userAgent :
                "non-browser-env"
        )
    ).slice(0, 4),

    // 48 random bits (6 bytes)
    random(6)

)




/**
 * Extract 'timestamp', 'user agent id' and 'random' component
 * from given 'uuid', which was generated using genUUID().
 *
 * @function uuidDecode
 * @param {Uint8Array} uuid
 * @returns {Object}
 */
export const uuidDecode = (uuid) => ({
    timestamp: new Date(parseInt(codec.bytesToHex(uuid.slice(0, 6)), 16)),
    uaId: codec.bytesToHex(uuid.slice(6, 6 + 4)),
    rnd: codec.bytesToHex(uuid.slice(10, 10 + 6)),
})




/**
 * Generate nonce suitable to use with encrypt/decrypt functions.
 *
 * @function nonce
 * @returns {Uint8Array}
 */
export const nonce = () => concatBytes(
    timestamp(),
    random(naclSecretbox.nonceLength - 6)
)




/**
 * Symmetric AES-256 decryption.
 * It'll throw an exception if given key is wrong.
 *
 * @function decrypt
 * @param {String} key
 * @param {String} ciphertext A hex-encoded content to decrypt.
 * @returns {String}
 */
export const decrypt = (key, ciphertext) => {
    let decipher = crypto.createDecipher("aes256", key)
    return decipher.update(ciphertext, "hex", "utf8") + decipher.final("utf8")
}




/**
 * Symmetric AES-256 encryption.
 *
 * @function encrypt
 * @param {String} key
 * @param {String} secret A content to encrypt.
 * @returns {String}
 */
export const encrypt = (key, secret) => {
    let cipher = crypto.createCipher("aes256", key)
    return cipher.update(secret, "utf8", "hex") + cipher.final("hex")
}




/**
 * Covert a given b64-encoded string to the hex-encoded string
 * (a point-free implementation).
 *
 * @function b64ToHex
 * @param {String} input
 * @returns {String}
 */
export const b64ToHex = func.compose(codec.bytesToHex, codec.b64dec)




/**
 * Covert a given hex-encoded string to the b64-encoded string
 * (a point-free implementation).
 *
 * @function hexToB64
 * @param {String} input
 * @returns {String}
 */
export const hexToB64 = func.compose(codec.b64enc, codec.hexToBytes)
