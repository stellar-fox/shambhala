# shambhala intro

<br />




I. Preface
------------

* convenient transaction-signing scheme based on [multisignature][multisig]

* two variants of onboarding:

    - **[Variant A]**:

        - for the "first-time" users
        - and/or without the prior experience with _[stellar] network_
        - and/or without knowledge about [crypto][cryptography] in general,

    - **[Variant B]**:

        - for experienced users with _[stellar] network_ knowledge
        - and/or possesing _[LedgerHQ] device_,
        - and/or possesing account with funds on the _[stellar] network_

<br />




II. Basic operations
----------------------

Current set of basic operations is build on top of:

* [Stanford Javascript Crypto Library][sjcl]
* _node.js_ [crypto][node-crypto] module and [crypto-browserify] implementation
* [stellar JavaScript SDK][js-stellar-sdk]
* [redshift] library

For current implementation refer to [cryptops.js] and [txops.js] files.


### Crypto-related operations

* generation of random value which can be used as [salt]:

    ```javascript
    const genRandomSHA256 = () =>
        sjcl.codec.hex.fromBits(
            sjcl.hash.sha256.hash(sjcl.random.randomWords(32, 8))
        )
    ```


* [password-based key-derivation][key-derivation]:

    ```javascript
    const genKey = (pass, salt, count=2**16) =>
        sjcl.codec.hex.fromBits(
            sjcl.misc.pbkdf2(pass, salt, count)
        )
    ```


* [symmetric][sym-key] [encryption]:

    ```javascript
    const encrypt = (secret, key) => {
        let cipher = crypto.createCipher("aes256", key)
        return cipher.update(secret, "utf8", "hex") + cipher.final("hex")
    }
    ```


* [symmetric][sym-key] decryption:

    ```javascript
    const decrypt = (ciphertext, key) => {
        let decipher = crypto.createDecipher("aes256", key)
        return decipher.update(ciphertext, "hex", "utf8") + decipher.final("utf8")
    }
    ```


### Transaction-related operations

* [transaction] inspection:

    ```javascript
    const inspectTSB = (tsbXDR) => ...
    ```

* [transaction] signing:

    ```javascript
    const signTSB = (tsbXDR, kp) => ...
    ```

<br />




III. Units
------------

* `KEYPAIR` - _StellarSDK.Keypair_ object
* `PASSPHRASE` - up to 100 characters long, alphanumeric word
* `G_MNEMONIC` - _genesis_ 24 word mnemonic + optional `PASSPHRASE`,
    stored by _user_ (in a form of e.g. _paper wallet_)
    and known only to him/her
* `G_PUBLIC` - user account number, stellar public key (G...),
    derived from `G_MNEMONIC`
* `GKP` - _genesis_ `KEYPAIR`, derived from `G_MNEMONIC`,
    **created maximum once** during onboarding process to sign appropriate
    _setOptions_ transaction
* `C_SECRET` - _client_ secret, stellar private key (S...)
* `C_PUBLIC` - _client_ public key (G...)
* `CKP` - _client_ `KEYPAIR`, derived from `C_SECRET`
* `S_SECRET` - _server_ secret, stellar private key (S...)
* `S_PUBLIC` - _server_ public key (G...)
* `SKP` - _server_ `KEYPAIR`
* `C_SALT`, `SALT_FOR_S` - random, hex-encoded SHA256 strings,
    generated using [CSPRNG], stored using [Web Storage]
* `PIN` - minimum 5-digits secret (alphanumeric as option)
* `S_KEY` - [key][crypto-key] derived from `PIN` and `SALT_FOR_S`,
    used to encrypt/decrypt `ENC_SKP`
* `SALT_FOR_C` - random, hex-encoded SHA256 string, generated using [CSPRNG],
    not stored anywhere in plain form
* `C_PASSPHRASE` - [passphrase][crypto-passphrase] derived
    from `S_KEY` and `SALT_FOR_C`
* `C_KEY` - [key][crypto-key] derived from `C_PASSPHRASE` and `C_SALT`,
    used to encrypt/decrypt `ENC_CKP`
* `ENC_CKP` - `C_SECRET` encrypted using `C_KEY`, stored using [Web Storage]
* `ENC_SKP` - (`S_SECRET` + `SALT_FOR_C`) encrypted with `S_KEY`,
        stored on _server_
* `TX_PAYLOAD` - _TransactionSignaturePayload_ [XDR] (as defined in _StelarSDK_)
* `C_SIGNATURE` - `TX_PAYLOAD` signed with `CKP`
* `S_SIGNATURE` - `TX_PAYLOAD` signed with `SKP`

<br />




IV. Shambhala onboarding process _(draft)_
--------------------------------------------

### 1. Initial state

* _user_:

    - no assumptions

* _client_:

    - no stored `G_PUBLIC`
    - no stored `ENC_CKP`
    - no stored `C_SALT`
    - no stored `SALT_FOR_S`

* _server_:

    - no stored `G_PUBLIC`
    - no stored `ENC_SKP`
    - no stored `account_funded_by_sfox` flag




### 2. **[Variant A]** - Account creation

_User_ doesn't have an account on _[stellar] network_.

* _client_:

    - generate `G_MNEMONIC` and present it to the _user_:

        ```javascript
        G_MNEMONIC = redshift.genMnemonic()
        ```

    - ask _user_ to create `PASSPHRASE` (can be empty)

    - **[!!]** create `GKP` (_path 0_):

        ```javascript
        GKP = redshift.hexSeed(G_MNEMONIC)...keypair()
        ```

    - destroy `G_MNEMONIC`

    - extract `G_PUBLIC`, store it, and send it to the _server_:

        ```javascript
        G_PUBLIC = GKP.publicKey()
        ```

    - request funding from the _server_


* _server_:

    - receive `G_PUBLIC` from _client_

    - store `G_PUBLIC`

    - fund `G_PUBLIC` with minimal needed amount
        (_friendbot_ on _test-net_, _sfox service_ on _public-net_)

    - store information that `G_PUBLIC` was funded by sfox:

        ```javascript
        account_funded_by_sfox = true
        ```




### 3. **[Variant B]** - Account association

_User_ already has a _[stellar] network_ account with funds.

* _client_:

    - ask _user_ to provide `G_PUBLIC`

    - send `G_PUBLIC` to the _server_

* _server_:

    - receive `G_PUBLIC` from _client_

    - store `G_PUBLIC`

    - store information that`G_PUBLIC` wasn't funded by sfox:

        ```javascript
        account_funded_by_sfox = false
        ```




### 4. Keys generation and storage

* _client_:

    - generate and store `SALT_FOR_S`:

        ```javascript
        SALT_FOR_S = genRandomSHA256()
        ```

    -  ask _user_ to provide `PIN`
        (should be double-checked by two input fields)

    - compute `S_KEY`:

        ```javascript
        S_KEY = genKey(PIN, SALT_FOR_S)
        ```

    - send `S_KEY` to the _server_

    - destroy `PIN` and `S_KEY`


* _server_:

    - receive `S_KEY` from _client_

    - generate `S_SECRET`:

        ```javascript
        S_SECRET = StellarSDK.Keypair.random().secret()
        ```

    - generate `SALT_FOR_C`:

        ```javascript
        SALT_FOR_C = genRandomSHA256()
        ```

    - compute and store `ENC_SKP`:

        ```javascript
        ENC_SKP = encrypt(S_SECRET + SALT_FOR_C, S_KEY)
        ```

    - compute `C_PASSPHRASE`:

        ```javascript
        C_PASSPHRASE = genKey(S_KEY, SALT_FOR_C)
        ```

    - extract `S_PUBLIC` from `S_SECRET`:

        ```javascript
        S_PUBLIC = StellarSDK.Keypair.fromSecret(S_SECRET).publicKey()
        ```

    - send `C_PASSPHRASE` and `S_PUBLIC` to _client_

    - destroy `S_KEY`, `S_SECRET`, `SALT_FOR_C` and `C_PASSPHRASE`


* _client_:

    - receive `C_PASSPHRASE` and `S_PUBLIC` from the _server_

    - generate and store `C_SALT`:

        ```javascript
        C_SALT = genRandomSHA256()
        ```

    - compute `C_KEY`:

        ```javascript
        C_KEY = genKey(C_PASSPHRASE, C_SALT)
        ```

    - generate `C_SECRET`:

        ```javascript
        C_SECRET = StellarSDK.Keypair.random().secret()
        ```

    - compute and store `ENC_CKP`:

        ```javascript
        ENC_CKP = encrypt(C_SECRET, C_KEY)
        ```

    - extract `C_PUBLIC` from `C_SECRET`:

        ```javascript
        C_PUBLIC = StellarSDK.Keypair.fromSecret(C_SECRET).publicKey()
        ```

    - destroy `C_PASSPHRASE`, `C_KEY`, `C_SECRET`

    - present `C_PUBLIC` and `S_PUBLIC` to the _user_




### 5. Actual state

* _user_:

    - know his/her `G_MNEMONIC` and optional `PASSPHRASE`
    - know his/her `PIN`
    - is aware of `C_PUBLIC` and `S_PUBLIC`

* _client_:

    - `G_PUBLIC` is present in storage
    - `ENC_CKP` is present in storage
    - `C_SALT` is present in storage
    - `SALT_FOR_S` is present in storage

* _server_:

    - `G_PUBLIC` is present in storage
    - `ENC_SKP` is present in storage
    - `account_funded_by_sfox` flag is present in storage




### 6. **[Variant A]** - Keys association

* _client_:

    - **[!!]** `GKP` is present in memory (_NOT_ in the persistent storage),
        as it was created in step two of **Account creation**.

    - `G_PUBLIC`, `C_PUBLIC` and `S_PUBLIC` are present in memory

    - construct `StellarSDK.Transaction` with an appropriate
        _setOptions_ operation:

        - `G_PUBLIC`, `C_PUBLIC`, `S_PUBLIC` _weights_
        - appropriate tresholds
        - `C_PUBLIC` and `S_PUBLIC` allowed for _multi-sig_

    - sign the transaction with `GKP`

    - destroy `GKP`


* _server_:

    - idle




### 7. **[Variant B]** - Keys association

* _client_:

    - `GKP` is not present in memory

    - `G_PUBLIC`, `C_PUBLIC` and `S_PUBLIC` are present in memory

    - construct `StellarSDK.Transaction` with an appropriate
        _setOptions_ operation:

        - `G_PUBLIC`, `C_PUBLIC`, `S_PUBLIC` _weights_
        - appropriate tresholds
        - `C_PUBLIC` and `S_PUBLIC` allowed for _multi-sig_

    - present `TX_PAYLOAD` to the _user_

    - if _user_ has [LedgerHQ], let him sign the transaction with it
        and send the signed transaction to the network

    - (alternatively): redirect to appropriate place in [Stellar Laboratory]


* _user_:

    - use computed `TX_PAYLOAD`, verify it, sign and send
        to network (with the usage of [LedgerHQ] and/or [Stellar Laboratory])

<br />




V. Shambhala transaction signing process _(draft)_
----------------------------------------------------

1. Initial state

* _user_:

    - know his/her `PIN`
    - has already associated `C_PUBLIC` and `S_PUBLIC`
        to his/her account in the process of onboarding

* _client_:

    - `G_PUBLIC` present in storage
    - `ENC_CKP` present in storage
    - `C_SALT` present in storage
    - `SALT_FOR_S` present in storage

* _server_:

    - `G_PUBLIC` present in storage
    - `ENC_SKP` present in storage
    - `account_funded_by_sfox` flag present in storage




2. Transaction verification

* _client_:

    - decode `TX_PAYLOAD` and present to the _user_:

        - source account identifier
        - transaction fee
        - sequence number
        - time bounds
        - memo
        - operations




3. Transaction signing

* _client_:

    - ask _user_ to provide `PIN`

    - compute `S_KEY`:

        ```javascript
        S_KEY = genKey(PIN, SALT_FOR_S)
        ```

    - send `S_KEY` and `TX_PAYLOAD` to the _server_

    - destroy `PIN` and `S_KEY`


* _server_:

    - receive `S_KEY` and `TX_PAYLOAD` from _client_

    - extract `S_SECRET` and `SALT_FOR_C` by decrypting `ENC_SKP`:

        ```javascript
        S_SECRET + SALT_FOR_C = decrypt(ENC_SKP, S_KEY)
        ```

    - if extraction has failed it means that received `S_KEY` is invalid,
        so potential data breach occured on _client_ side or simply
        _user_ made a typo in `KEY`. In such scenario next steps
        are impossible, so the procedure has to be aborted, _failure
        counter_ has to be increased and _client_ has to be notified. Security
        precautions can be implemented in this step, for example after
        `3` failed attempts communication with this _client_ can be suspended
        for a longer period of time, etc.

    - generate `SKP`:

        ```javascript
        SKP = StellarSDK.Keypair.fromSecret(S_SECRET)
        ```

    - compute `S_SIGNATURE` by singing `TX_PAYLOAD` with `SKP`:

        ```javascript
        S_SIGNATURE = signTSB(TX_PAYLOAD, SKP)
        ```

    - destroy `SKP` and `S_SECRET`

    - compute `C_PASSPHRASE`:

        ```javascript
        C_PASSPHRASE = genKey(S_KEY, SALT_FOR_C)
        ```

    - send `C_PASSPHRASE` and `S_SIGNATURE` to _client_

    - destroy `S_KEY`, `SALT_FOR_C`, `C_PASSPHRASE`


* _client_:

    - receive `C_PASSPHRASE` and `S_SIGNATURE` from the _server_

    - compute `C_KEY`:

        ```javascript
        C_KEY = genKey(C_PASSPHRASE, C_SALT)
        ```

    - extract `C_SECRET` by decrypting `ENC_CKP`:

        ```javascript
        C_SECRET = decrypt(ENC_CKP, C_KEY)
        ```

    - generate `CKP`:

        ```javascript
        CKP = StellarSDK.Keypair.fromSecret(C_SECRET)
        ```

    - compute `C_SIGNATURE` by singing `TX_PAYLOAD` with `CKP`:

        ```javascript
         C_SIGNATURE = signTSB(TX_PAYLOAD, CKP)
         ```

    - destroy `CKP`, `C_SECRET`, `C_PASSPHRASE` and `C_KEY`

    - send `S_SIGNATURE` and `C_SIGNATURE` to the host application

<br />




VI Notes
----------

* There's no way to enforce garbage collect process / shredding of
    memory remains in JavaScript. So - after onboarding without [LedgerHQ]
    it is desirable to turn off phone / computer for at least 30 (??) seconds
    to wipe out DRAM.

* Steps marked with **[!!]** in the onboarding process are fragile from
    the security point of view.

* There is always a tradeoff between security and convenience. Also,
    the more convenient a solution is (in the sense, that an user is not
    neccesarily an expert in a given field), the more chance there is
    that some degree of trust to a third party has to be calculated in.

* Safety of a described scheme is build on a following foundations:

    - there are two equally important keypairs (`CKP` and `SKP`), both
        stored in an encrypted form
    - _secret keys_ of both `CKP` and `SKP` are never leaving their
        environments (that is [Web Storage] in case of `CKP` and server-side
        database in case of `SKP`)
    - _user_ **knows** `PIN` and **has** `SALT_FOR_S`, which are the two
        neccessary ingredients to derive `S_KEY` needed to decrypt `SKP`,
        so in case of server-side database breach `SKP` is safe,
    - decryption of `CKP` depends on _user_ **knowledge** (`PIN`) and,
        amongs other things, on element stored in **encrypted form** on server
        (`SALT_FOR_C`), so in case of client-side storage breach `CKP` is safe
    - if _user_ will loose a device with stored `CKP` or forget a `PIN` or
        simply want to cancel using _shambhala transaction-signing scheme_,
        his/her funds on _[stellar] network_ are safe, because he/she
        **knows** `G_MNEMONIC` with `PASSPHRASE` from which the **master key**
        can be derived

* Strong emphasis has to be put on all security considerations related to
    onboarding process in **[Variant A]**.




[multisig]: https://www.stellar.org/developers/guides/concepts/multi-sig.html
[stellar]: https://www.stellar.org/
[cryptography]: https://en.wikipedia.org/wiki/Cryptography
[LedgerHQ]: https://www.ledger.fr/
[sjcl]: https://bitwiseshiftleft.github.io/sjcl/
[node-crypto]: https://nodejs.org/api/crypto.html
[crypto-browserify]: https://github.com/crypto-browserify/crypto-browserify
[js-stellar-sdk]: https://stellar.github.io/js-stellar-sdk/
[redshift]: https://www.npmjs.com/package/@stellar-fox/redshift
[cryptops.js]: ../src/cryptops.js
[txops.js]: ../src/txops.js
[salt]: https://en.wikipedia.org/wiki/Salt_(cryptography)
[key-derivation]: https://en.wikipedia.org/wiki/Key_derivation_function
[encryption]: https://en.wikipedia.org/wiki/Encryption
[sym-key]: https://en.wikipedia.org/wiki/Symmetric-key_algorithm
[transaction]: https://www.stellar.org/developers/guides/concepts/transactions.html
[CSPRNG]: https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator
[Web Storage]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
[crypto-key]: https://en.wikipedia.org/wiki/Key_(cryptography)
[XDR]: https://www.stellar.org/developers/guides/concepts/xdr.html
[crypto-passphrase]: https://en.wikipedia.org/wiki/Passphrase
[Stellar Laboratory]: https://www.stellar.org/laboratory/