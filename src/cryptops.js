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
    range,
    string,
} from "@xcmats/js-toolbox"
import crypto from "crypto-browserify"
import {
    codec as sjclCodec,
    hash as sjclHash,
    misc as sjclMisc,
    random as sjclRandom,
} from "sjcl"




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
 * Password-based key-derivation.
 *
 * @function genKey
 * @param {String} pass A password to derive key from.
 * @param {String} [salt=""]
 * @param {Number} [count=2**12] Difficulty.
 * @returns {String}
 */
export const genKey = (pass, salt = string.empty(), count = 2**12) =>
    sjclCodec.hex.fromBits(
        sjclMisc.pbkdf2(pass, salt, count)
    )




/**
 * SHA256 hex-encoded string computed from a CSPRNG-generated output.
 *
 * @function genRandomSHA256
 * @returns {String}
 */
export const genRandomSHA256 = () =>
    sjclCodec.hex.fromBits(
        sjclHash.sha256.hash(sjclRandom.randomWords(16))
    )




/**
 * Generate 128 bits UUID. Comprised of:
 * - 48 bits of miliseconds since epoch
 * - 32 bits of truncated SHA256 sum of userAgent string
 * - 48 random bits
 *
 * @function genUUID
 * @returns {String}
 */
export const genUUID = () => {
    let rd = Date.now().toString(16).split(string.empty()).reverse()
    return (
        // 48 bits (6 bytes): timestamp - miliseconds since epoch
        range(6*2)
            .reduce(
                (acc, _el, i) =>
                    i < rd.length ?
                        [rd[i],].concat(acc) :
                        [0,].concat(acc),
                []
            ).join(string.empty())
    ) + (
        // 32 bits (4 bytes): truncated SHA256 sum of userAgent string
        sjclCodec.hex.fromBits(
            sjclHash.sha256.hash(
                sjclCodec.utf8String.toBits(
                    handleException(
                        () => isBrowser() ?
                            navigator.userAgent :
                            "non-browser-env"
                    )
                )
            )
        ).slice(0, 4*2)
    ) + (
        // 48 random bits (6 bytes)
        sjclCodec.hex.fromBits(
            sjclRandom.randomWords(2)
        ).slice(0, 6*2)
    )
}




/**
 * Covert a given hex-encoded string to the b64-encoded string
 * (a point-free implementation).
 *
 * @function hexToB64
 * @param {String} input
 * @returns {String}
 */
export const hexToB64 = func.compose(codec.b64enc, codec.hexToBytes)




/**
 * SHA256 hex-encoded string computed from an utf8 input.
 *
 * @function sha256
 * @param {String} input
 * @returns {String}
 */
export const sha256 = (input) =>
    sjclCodec.hex.fromBits(
        sjclHash.sha256.hash(sjclCodec.utf8String.toBits(input))
    )




/**
 * Extract 'timestamp', 'user agent id' and 'random' component
 * from given 'uuid', which was generated using genUUID().
 *
 * @function uuidDecode
 * @param {String} uuid
 * @returns {Object}
 */
export const uuidDecode = (uuid) => ({
    timestamp: new Date(parseInt(uuid.slice(0, 6*2), 16)),
    uaId: uuid.slice(6*2, 6*2 + 4*2),
    rnd: uuid.slice(10*2, 10*2 + 6*2),
})
