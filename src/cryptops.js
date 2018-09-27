/**
 * Crypto-related operations (library).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import {
    emptyString,
    handleException,
    isBrowser,
    range,
} from "@xcmats/js-toolbox"
import crypto from "crypto-browserify"
import sjcl from "sjcl"




/**
 * Symmetric AES-256 decryption.
 * It'll throw an exception if given key is wrong.
 *
 * @function decrypt
 * @param {String} key
 * @param {String} ciphertext A content to decrypt.
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
export const genKey = (pass, salt = emptyString(), count = 2**12) =>
    sjcl.codec.hex.fromBits(
        sjcl.misc.pbkdf2(pass, salt, count)
    )




/**
 * SHA256 hex-encoded string computed from a CSPRNG-generated output.
 *
 * @function genRandomSHA256
 * @returns {String}
 */
export const genRandomSHA256 = () =>
    sjcl.codec.hex.fromBits(
        sjcl.hash.sha256.hash(sjcl.random.randomWords(16))
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
    let rd = Date.now().toString(16).split(emptyString()).reverse()
    return (
        // 48 bits (6 bytes): timestamp - miliseconds since epoch
        range(6*2)
            .reduce(
                (acc, _el, i) =>
                    i < rd.length ?
                        [rd[i],].concat(acc) :
                        [0,].concat(acc),
                []
            ).join(emptyString())
    ) + (
        // 32 bits (4 bytes): truncated SHA256 sum of userAgent string
        sjcl.codec.hex.fromBits(
            sjcl.hash.sha256.hash(
                sjcl.codec.utf8String.toBits(
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
        sjcl.codec.hex.fromBits(
            sjcl.random.randomWords(2)
        ).slice(0, 6*2)
    )
}




/**
 * SHA256 hex-encoded string computed from an UTF8 input.
 *
 * @function sha256
 * @param {String} input
 * @returns {String}
 */
export const sha256 = (input) =>
    sjcl.codec.hex.fromBits(
        sjcl.hash.sha256.hash(sjcl.codec.utf8String.toBits(input))
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
