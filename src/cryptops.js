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
 * @param {String} ciphertext A content to decrypt.
 * @param {String} key
 * @returns {String}
 */
export const decrypt = (ciphertext, key) => {
    let decipher = crypto.createDecipher("aes256", key)
    return decipher.update(ciphertext, "hex", "utf8") + decipher.final("utf8")
}




/**
 * Symmetric AES-256 encryption.
 *
 * @function encrypt
 * @param {String} secret A content to encrypt.
 * @param {String} key
 * @returns {String}
 */
export const encrypt = (secret, key) => {
    let cipher = crypto.createCipher("aes256", key)
    return cipher.update(secret, "utf8", "hex") + cipher.final("hex")
}




/**
 * Password-based key-derivation.
 *
 * @function genKey
 * @param {String} pass A password to derive key from.
 * @param {String} [salt=""]
 * @param {Number} [count=2**16] Difficulty.
 * @returns {String}
 */
export const genKey = (pass, salt = emptyString(), count = 2**16) =>
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
    let rd = Date.now().toString(16).split("").reverse()
    return (
        // 48 bits (6 bytes): timestamp - miliseconds since epoch
        range(6*2)
            .reduce(
                (acc, _el, i) =>
                    i < rd.length ?
                        [rd[i],].concat(acc) :
                        [0,].concat(acc),
                []
            ).join("")
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
