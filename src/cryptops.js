/**
 * Crypto-related operations (library).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import { emptyString } from "@xcmats/js-toolbox"
import crypto from "crypto-browserify"
import sjcl from "sjcl"




/**
 * SHA256 hex-encoded string computed from a CSPRNG-generated output.
 *
 * @function genRandomSHA256
 * @returns {String}
 */
export const genRandomSHA256 = () =>
    sjcl.codec.hex.fromBits(
        sjcl.hash.sha256.hash(sjcl.random.randomWords(32, 8))
    )




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
