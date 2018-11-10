/**
 * Crypto-related operations (library).
 *
 * @module cryptops-lib
 * @license Apache-2.0
 */




import {
    codec,
    func,
    handleException,
    isBrowser,
    string,
    type,
} from "@xcmats/js-toolbox"
import {
    createCipheriv,
    createDecipheriv,
} from "crypto-browserify"
import scrypt from "scrypt-js"
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
 * Retrieve 'n' random bytes from CSPRNG pool.
 * Alias for `tweetnacl.randomBytes()`.
 *
 * @function random
 * @see {@link https://bit.ly/tweetnaclrandom}
 * @param {Number} n
 * @returns {Uint8Array}
 */
export const random = naclRandomBytes




/**
 * Compute a `sha256` hash from a given input.
 * Uses `bitwiseshiftleft/sjcl`'s `sha256` implementation.
 *
 * @function sha256
 * @see {@link https://bit.ly/sjclsha256}
 * @see {@link https://bit.ly/toolboxcodec}
 * @see {@link https://bit.ly/toolboxfunc}
 * @param {Uint8Array} input
 * @returns {Uint8Array}
 */
export const sha256 = func.flow(
    codec.bytesToHex,
    sjclCodec.hex.toBits,
    sjclHash.sha256.hash,
    sjclCodec.hex.fromBits,
    codec.hexToBytes,
)




/**
 * Generate 32-byte value. Can be used as salt.
 *
 * @function salt32
 * @returns {Uint8Array}
 */
export const salt32 = () => sha256(random(128))




/**
 * Password-based key-derivation.
 * Uses `pbkdf2` implemented in `bitwiseshiftleft/sjcl`.
 *
 * @function genKey
 * @see {@link https://bit.ly/sjclpbkdf2}
 * @see {@link https://bit.ly/toolboxcodec}
 * @see {@link https://bit.ly/toolboxfunc}
 * @param {Uint8Array} [pass=Uint8Array.from([])] A password to derive key.
 * @param {Uint8Array} [salt=(new Uint8Array(32)).fill(0)]
 * @param {Number} [count=2**12] Difficulty.
 * @returns {Uint8Array}
 */
export const genKey = (
    pass = Uint8Array.from([]),
    salt = (new Uint8Array(32)).fill(0),
    count = 2**12
) => func.flow(
    sjclCodec.hex.fromBits,
    codec.hexToBytes
)(
    sjclMisc.pbkdf2(
        func.compose(sjclCodec.hex.toBits, codec.bytesToHex)(pass),
        func.compose(sjclCodec.hex.toBits, codec.bytesToHex)(salt),
        count
    )
)




/**
 * Compute a `sha512` hash from a given input.
 * Uses `dchest/tweetnacl-js`'s `sha512` implementation.
 *
 * @function sha512
 * @see {@link https://bit.ly/tweetnaclhash}
 * @param {Uint8Array} input
 * @returns {Uint8Array}
 */
export const sha512 = naclHash




/**
 * Generate 64-byte value. Can be used as salt.
 *
 * @function salt64
 * @returns {Uint8Array}
 */
export const salt64 = () => sha512(random(256))




/**
 * @typedef {Object} KeyDerivationOptions
 * @property {Number} [count=2**12] Difficulty.
 * @property {Number} [blockSize=8]
 * @property {Number} [parallelization=1]
 * @property {Number} [derivedKeySize=64]
 * @property {Function} [progressCallback=()=>false]
 */




/**
 * Password-based key-derivation.
 * Uses `scrypt` implemented in `ricmoo/scrypt-js`.
 *
 * @async
 * @function deriveKey
 * @see {@link https://bit.ly/scryptjs}
 * @param {Uint8Array} [pass=Uint8Array.from([])] A password to derive key.
 * @param {Uint8Array} [salt=(new Uint8Array(32)).fill(0)]
 * @param {KeyDerivationOptions} [opts={}] @see KeyDerivationOptions
 * @returns {Promise.<Uint8Array>}
 */
export const deriveKey = (
    pass = Uint8Array.from([]),
    salt = (new Uint8Array(64)).fill(0),
    {
        count = 2**16,
        blockSize = 8,
        parallelization = 1,
        derivedKeySize = 64,
        progressCallback = (_p) => false,
    } = {}
) =>
    new Promise(
        (resolve, reject) =>
            scrypt(
                pass, salt,
                count, blockSize, parallelization, derivedKeySize,
                (error, progress, key) => {
                    if (error) return reject(error)
                    if (key) return resolve(Uint8Array.from(key))
                    if (progress) return progressCallback(progress)
                    return false
                }
            )
    )




/**
 * Generate 48 bits (6 bytes) timestamp - miliseconds since epoch
 *
 * @function timestamp
 * @returns {Uint8Array}
 */
export const timestamp = () => func.compose(
    codec.hexToBytes,
    string.padLeft
)(Date.now().toString(16), 6*2, "0")




/**
 * Generate 128 bits UUID. Comprised of:
 * - 48 bits of miliseconds since epoch
 * - 32 bits of truncated `sha256` sum of userAgent string
 * - 48 random bits
 *
 * @function genUUID
 * @returns {Uint8Array}
 */
export const genUUID = () => codec.concatBytes(

    // 48 bits (6 bytes): timestamp - miliseconds since epoch
    timestamp(),

    // 32 bits (4 bytes): truncated `sha256` sum of userAgent string
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
 * Extract `timestamp`, `user agent id` and `random` component
 * from given `uuid`, which was generated using `genUUID()`.
 *
 * @function decodeUUID
 * @param {Uint8Array} uuid
 * @returns {Object}
 */
export const decodeUUID = (uuid) => ({
    timestamp: new Date(parseInt(codec.bytesToHex(uuid.slice(0, 6)), 16)),
    uaId: codec.bytesToHex(uuid.slice(6, 6 + 4)),
    rnd: codec.bytesToHex(uuid.slice(10, 10 + 6)),
})




/**
 * Generate nonce suitable to use with salsaEncrypt/salsaDecrypt functions.
 *
 * @function salsaNonce
 * @returns {Uint8Array}
 */
export const salsaNonce = () => codec.concatBytes(
    timestamp(),
    random(naclSecretbox.nonceLength - 6)
)




/**
 * Symmetric `xsalsa20-poly1305` encryption.
 * Uses `dchest/tweetnacl-js` implementation.
 *
 * @function salsaEncrypt
 * @see {@link https://bit.ly/tweetnaclsalsa}
 * @param {Uint8Array} key Encryption key.
 * @param {Uint8Array} message A content to encrypt.
 * @returns {Uint8Array} Initialization Vector concatenated with Ciphertext.
 */
export const salsaEncrypt = (key, message) => {
    let iv = salsaNonce()
    return codec.concatBytes(iv, naclSecretbox(message, iv, key))
}




/**
 * Symmetric `xsalsa20-poly1305` decryption.
 * Uses `dchest/tweetnacl-js` implementation.
 *
 * @function salsaDecrypt
 * @see {@link https://bit.ly/tweetnaclsalsa}
 * @param {Uint8Array} key Decryption key.
 * @param {Uint8Array} ciphertext A content to decrypt.
 * @returns {(Uint8Array|null)} Decrypted message or null.
 */
export const salsaDecrypt = (key, ciphertext) => {
    let iv = ciphertext.slice(0, naclSecretbox.nonceLength)
    return naclSecretbox.open(
        ciphertext.slice(naclSecretbox.nonceLength), iv, key
    )
}




/**
 * Generate nonce suitable to use with aesEncrypt/aesDecrypt functions.
 *
 * @function aesNonce
 * @returns {Uint8Array}
 */
export const aesNonce = () => random(16)




/**
 * Symmetric `aes256` encryption in counter mode (CTR).
 * Uses `crypto-browserify` implementation.
 *
 * @function aesEncrypt
 * @see {@link https://bit.ly/npmcryptobrowserify}
 * @see {@link https://bit.ly/createcipheriv}
 * @param {Uint8Array} key Encryption key.
 * @param {Uint8Array} message A content to encrypt.
 * @returns {Uint8Array} Initialization Vector concatenated with Ciphertext.
 */
export const aesEncrypt = (key, message) => {
    let iv = aesNonce(),
        cipher = createCipheriv("aes-256-ctr", key, iv)
    return codec.concatBytes(iv, cipher.update(message), cipher.final())
}




/**
 * Symmetric `aes256` decryption in counter mode (CTR).
 * Uses `crypto-browserify` implementation.
 *
 * @function aesDecrypt
 * @see {@link https://bit.ly/npmcryptobrowserify}
 * @see {@link https://bit.ly/createdecipheriv}
 * @param {Uint8Array} key Decryption key.
 * @param {Uint8Array} ciphertext A content to decrypt.
 * @returns {Uint8Array} Decrypted message.
 */
export const aesDecrypt = (key, ciphertext) => {
    let iv = ciphertext.slice(0, 16),
        decipher = createDecipheriv("aes-256-ctr", key, iv)
    return codec.concatBytes(
        decipher.update(ciphertext.slice(16)),
        decipher.final()
    )
}




/**
 * Needed constants for encrypt/decrypt functions.
 *
 * @private
 * @constant encdec
 */
const encdec = Object.freeze({
    MAGIC: "0xDAB0",
    VERSION: "0x0001",
})




/**
 * Double-cipher (`salsa`/`aes`) encryption with `poly1305` MAC.
 * Uses `dchest/tweetnacl-js` "secretbox" for `xsalsa20-poly1305`
 * and `crypto-browserify` for `aes-256-ctr` encryption.
 * Inspired by `keybase.io/triplesec`.
 *
 * Algorithm:
 *
 * 1. `salsaNonce` is created
 * 2. `message` is being encrypted with `xsalsa20`
 *     using first 32 bytes of `key` and `salsaNonce`
 *     producing `[salsaNonce + salsaCiphertext]`
 * 3. `aesNonce` is created
 * 4. `[salsaNonce + salsaCiphertext]` is being encrypted with `aes-256-ctr`
 *     using last 32 bytes of `key` and `aesNonce`
 *     producing `[aesNonce + aesCiphertext]`
 * 5. [`encdec.MAGIC` + `encdec.VERSION` + `aesNonce` + `aesCiphertext`]
 *    is returned as an `Uint8Array` result
 *
 * @function encrypt
 * @see {@link https://bit.ly/toolboxcodec}
 * @see {@link https://bit.ly/toolboxfunc}
 * @param {Uint8Array} key 512 bits (64 bytes) encryption key.
 * @param {Uint8Array} message A content to encrypt.
 * @returns {Uint8Array} [MAGIC] + [VERSION] + [AES IV] + [Ciphertext].
 */
export const encrypt = (key, message) => {
    if (
        !type.isNumber(key.BYTES_PER_ELEMENT)  ||
        !type.isNumber(message.BYTES_PER_ELEMENT)  ||
        key.BYTES_PER_ELEMENT !== 1  ||
        message.BYTES_PER_ELEMENT !== 1
    ) throw new TypeError("encrypt: Arguments must be of Uint8Array type.")

    if (key.length !== 64) throw new RangeError(
        "encrypt: Key must be 512 bits long."
    )

    return codec.concatBytes(
        codec.hexToBytes(encdec.MAGIC),
        codec.hexToBytes(encdec.VERSION),
        func.compose(
            func.partial(aesEncrypt)(key.slice(32)),
            func.partial(salsaEncrypt)(key.slice(0, 32))
        )(message)
    )
}
Object.freeze(Object.assign(encrypt, encdec))




/**
 * Double-cipher (`aes`/`salsa`) decryption with `poly1305` MAC.
 * Uses `dchest/tweetnacl-js` "secretbox" for `xsalsa20-poly1305`
 * and `crypto-browserify` for `aes-256-ctr` decryption.
 * Inspired by `keybase.io/triplesec`.
 *
 * Algorithm:
 *
 * 1. [`encdec.MAGIC` + `encdec.VERSION`] part of `ciphertext` is checked
 * 2. `[salsaNonce + salsaCiphertext]` is being decrypted with `aes-256-ctr`
 *     using last 32 bytes of `key` and `aesNonce`
 *     from `[aesNonce + aesCiphertext]` part of `ciphertext`
 * 3. `message` is being decrypted with `xsalsa20`
 *     using first 32 bytes of `key` and `salsaNonce`
 *     from `[salsaNonce + salsaCiphertext]`
 * 4. If salsa-decryption succeeded then `message` is returned,
 *     otherwise `null`.
 *
 * @function decrypt
 * @see {@link https://bit.ly/toolboxcodec}
 * @see {@link https://bit.ly/toolboxfunc}
 * @param {Uint8Array} key 512 bits (64 bytes) decryption key.
 * @param {Uint8Array} message A content to encrypt.
 * @returns {Uint8Array|Null} byte representation
 *      of a decrypted content or `null` if decryption is not possible.
 */
export const decrypt = (key, ciphertext) => {
    if (
        !type.isNumber(key.BYTES_PER_ELEMENT)  ||
        !type.isNumber(ciphertext.BYTES_PER_ELEMENT)  ||
        key.BYTES_PER_ELEMENT !== 1  ||
        ciphertext.BYTES_PER_ELEMENT !== 1
    ) throw new TypeError("decrypt: Arguments must be of Uint8Array type.")

    if (key.length !== 64) throw new RangeError(
        "decrypt: Key must be 512 bits long."
    )

    if (!codec.compareBytes(
        codec.concatBytes(
            codec.hexToBytes(encdec.MAGIC),
            codec.hexToBytes(encdec.VERSION)
        ),
        ciphertext.slice(0, 4)
    )) throw new Error("decrypt: Magic byte or version mismatch.")

    return func.compose(
        func.partial(salsaDecrypt)(key.slice(0, 32)),
        func.partial(aesDecrypt)(key.slice(32))
    )(ciphertext.slice(4))
}
Object.freeze(Object.assign(decrypt, encdec))




/**
 * Double-cipher scrypt-based key-from-passphrase-deriving encrypter.
 * A `passphrase` is normalized to Normalization Form Canonical Composition.
 * @see {@link http://bit.ly/wikiuniequ}
 *
 * @async
 * @function passphraseEncrypt
 * @param {String} passphrase A password to derive key from.
 * @param {Uint8Array} message A content to encrypt.
 * @param {Object} [opts={}] @see KeyDerivationOptions.
 *      `salt` can be passed here as an additional parameter.
 * @returns {Promise.<String>} base64-encoded ciphertext
 */
export const passphraseEncrypt = async (
    passphrase = string.empty(),
    message = Uint8Array.from([]),
    {
        salt = salt64(),
        count = 2**16,
        blockSize = 8,
        parallelization = 1,
        derivedKeySize = 64,
        progressCallback = (_p) => false,
    } = {}
) =>
    func.compose(
        codec.b64enc,
        codec.concatBytes
    )(
        salt,
        encrypt(
            await deriveKey(
                func.compose(
                    codec.stringToBytes,
                    (p) => p.normalize("NFC")
                )(passphrase),
                salt,
                {
                    count, blockSize, parallelization,
                    derivedKeySize, progressCallback,
                }
            ),
            message
        )
    )




/**
 * Double-cipher scrypt-based key-from-passphrase-deriving decrypter.
 * A `passphrase` is normalized to Normalization Form Canonical Composition.
 * @see {@link http://bit.ly/wikiuniequ}
 *
 * @async
 * @function passphraseDecrypt
 * @param {String} passphrase A password to derive key from.
 * @param {String} message A base64-encoded content to decrypt.
 * @param {KeyDerivationOptions} [opts={}] @see KeyDerivationOptions.
 * @returns {Promise.<Uint8Array>|Promise.<Null>} byte representation
 *      of a decrypted content or `null` if decryption is not possible.
 */
export const passphraseDecrypt = async (
    passphrase = string.empty(),
    ciphertext = string.empty(),
    {
        count = 2**16,
        blockSize = 8,
        parallelization = 1,
        derivedKeySize = 64,
        progressCallback = (_p) => false,
    } = {}
) => {
    let cipherBytes = codec.b64dec(ciphertext)

    return decrypt(
        await deriveKey(
            func.compose(
                codec.stringToBytes,
                (p) => p.normalize("NFC")
            )(passphrase),
            cipherBytes.slice(0, 64),
            {
                count, blockSize, parallelization,
                derivedKeySize, progressCallback,
            }
        ),
        cipherBytes.slice(64)
    )
}
