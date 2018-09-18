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
* `G-MNEMONIC` - _genesis_ 24 word mnemonic + optional `PASSPHRASE`,
    stored by user (in a form of e.g. _paper wallet_) and known only to him
* `G-PUBLIC` - user account number, Stellar public key (G...),
    derived from `G-MNEMONIC`
* `GKP` - _genesis_ `KEYPAIR`, derived from `G-MNEMONIC`,
    **created maximum once** during onboarding process to sign appropriate
    _setOptions_ transaction
* `C-SECRET` - _client_ secret, Stellar private key (S...)
* `C-PUBLIC` - _client_ public key (G...)
* `CKP` - _client_ `KEYPAIR`, derived from `C-SECRET`
* `S-SECRET` - _server_ secret, Stellar private key (S...)
* `S-PUBLIC` - _server_ public key (G...)
* `SKP` - _server_ `KEYPAIR`
* `C-SALT`, `SALT-FOR-S` - random, hex-encoded sha256 strings,
    generated using [CSPRNG], stored using [Web Storage]
* `PIN` - minimum 5-digits secret (alphanumeric as option),
* `S-KEY` - [key][crypto-key] derived from `PIN` and `SALT-FOR-S`,
    used to encrypt/decrypt `EncSKP`,
* `SALT-FOR-C` - random, hex-encoded SHA256 string, generated using [CSPRNG],
    not stored anywhere in plain form,
* `C-PASSPHRASE` - [passphrase][crypto-passphrase] derived from `S-KEY` and `SALT-FOR-C`
* `C-KEY` - [key][crypto-key] derived from `C-PASSPHRASE` and `C-SALT`,
    used to encrypt/decrypt `EncCKP`
* `EncCKP` - `C-SECRET` encrypted using `C-KEY`, stored using [Web Storage]
* `EncSKP` - (`S-SECRET` + `SALT-FOR-C`) encrypted with `S-KEY`,
        stored on _server_,
* `TX-PAYLOAD` - _TransactionSignaturePayload_ [XDR] (as defined in _StelarSDK_)
* `C-SIGNATURE` - `TX-PAYLOAD` signed with `CKP`
* `S-SIGNATURE` - `TX-PAYLOAD` signed with `SKP`

<br />




IV. Shambhala onboarding process (draft)
------------------------------------------

### 1. Initial state

* _user_:

    - no assumptions

* _client_:

    - no stored `G-PUBLIC`
    - no stored `EncCKP`
    - no stored `C-SALT`
    - no stored `SALT-FOR-S`

* _server_:

    - no stored `G-PUBLIC`
    - no stored `EncSKP`
    - no stored `account-funded-by-sfox` flag




### 2. **[Variant A]** Account creation

_User_ doesn't have an account on _[stellar] network_.

* _client_:

    - generate `G-MNEMONIC` and present it to the _user_:

        > `G-MNEMONIC` = redshift.genMnemonic()

    - ask _user_ to create `PASSPHRASE` (can be empty)

    - **[!!]** create `GKP` (_path 0_):

        > `GKP` = redshift.hexSeed(`G-MNEMONIC`)...keypair()

    - destroy `G-MNEMONIC`

    - extract `G-PUBLIC`, store it, and send it to the _server_:

        > `G-PUBLIC` = `GKP`.publicKey()

    - request funding from the _server_


* _server_:

    - receive `G-PUBLIC` from _client_

    - store `G-PUBLIC`

    - fund `G-PUBLIC` with minimal needed amount
        (_friendbot_ on _test-net_, _sfox service_ on _public-net_)

    - store information that `G-PUBLIC` was funded by sfox:

        > `account-funded-by-sfox` = `true`




### 3. **[Variant B]** Account association

_User_ already has a _[stellar] network_ account with funds.

* _client_:

    - ask _user_ to provide `G-PUBLIC`

    - send `G-PUBLIC` to the _server_

* _server_:

    - receive `G-PUBLIC` from _client_

    - store `G-PUBLIC`

    - store information that`G-PUBLIC` wasn't funded by sfox:

        > `account-funded-by-sfox` = `false`




### 4. Keys generation and storage

* _client_:

    - generate and store `SALT-FOR-S`:

        > `SALT-FOR-S` = genRandomSHA256()

    -  ask _user_ to provide `PIN`
        (should be double-checked by two input fields)

    - compute `S-KEY`:

        > `S-KEY` = genKey(`PIN`, `SALT-FOR-S`)

    - send `S-KEY` to the _server_

    - destroy `PIN` and `S-KEY`


* _server_:

    - receive `S-KEY` from _client_

    - generate `S-SECRET`:

        > `S-SECRET` = StellarSDK.Keypair.random().secret()

    - generate `SALT-FOR-C`:

        > `SALT-FOR-C` = genRandomSHA256()

    - compute and store `EncSKP`:

        > `EncSKP` = encrypt(`S-SECRET` + `SALT-FOR-C`, `S-KEY`)

    - compute `C-PASSPHRASE`:

        > `C-PASSPHRASE` = genKey(`S-KEY`, `SALT-FOR-C`)

    - extract `S-PUBLIC` from `S-SECRET`:

        > `S-PUBLIC` = StellarSDK.Keypair.fromSecret(`S-SECRET`).publicKey()

    - send `C-PASSPHRASE` and `S-PUBLIC` to _client_

    - destroy `S-KEY`, `S-SECRET`, `SALT-FOR-C` and `C-PASSPHRASE`


* _client_:

    - receive `C-PASSPHRASE` and `S-PUBLIC` from the _server_

    - generate and store `C-SALT`:

        > `C-SALT` = genRandomSHA256(),

    - compute `C-KEY`:

        > `C-KEY` = genKey(`C-PASSPHRASE`, `C-SALT`)

    - generate `C-SECRET`:

        > `C-SECRET` = StellarSDK.Keypair.random().secret()

    - compute and store `EncCKP`:

        > `EncCKP` = encrypt(`C-SECRET`, `C-KEY`)

    - extract `C-PUBLIC` from `C-SECRET`:

        > `C-PUBLIC` = StellarSDK.Keypair.fromSecret(`C-SECRET`).publicKey()

    - destroy `C-PASSPHRASE`, `C-KEY`, `C-SECRET`

    - present `C-PUBLIC` and `S-PUBLIC` to the _user_




### 5. Actual state

* _user_:

    - know his/her `G-MNEMONIC` and optional `PASSPHRASE`
    - know his/her `PIN`
    - is aware of `C-PUBLIC` and `S-PUBLIC`

* _client_:

    - `G-PUBLIC` is present in storage
    - `EncCKP` is present in storage
    - `C-SALT` is present in storage
    - `SALT-FOR-S` is present in storage

* _server_:

    - `G-PUBLIC` is present in storage
    - `EncSKP` is present in storage
    - `account-funded-by-sfox` flag is present in storage




### 6. **[Variant A]** Keys association

* _client_:

    - **[!!]** `GKP` is present in memory (_NOT_ in the persistent storage),
        as it was created in step two of Account creation.

    - `G-PUBLIC`, `C-PUBLIC` and `S-PUBLIC` are present in memory

    - construct `StellarSDK.Transaction` with an appropriate
        _setOptions_ operation:

        - `G-PUBLIC`, `C-PUBLIC`, `S-PUBLIC` _weights_
        - appropriate tresholds
        - `C-PUBLIC` and `S-PUBLIC` allowed for _multi-sig_

    - sign the transaction with `GKP`

    - destroy `GKP`


* _server_:

    - idle




### 7. **[Variant B]** Keys association

* _client_:

    - `GKP` is not present in memory

    - `G-PUBLIC`, `C-PUBLIC` and `S-PUBLIC` are present in memory

    - construct `StellarSDK.Transaction` with an appropriate
        `setOptions` operation:

        - `G-PUBLIC`, `C-PUBLIC`, `S-PUBLIC` _weights_
        - appropriate tresholds
        - `C-PUBLIC` and `S-PUBLIC` allowed for _multi-sig_

    - present `TX-PAYLOAD` to the _user_

    - if _user_ has [LedgerHQ], let him sign the transaction with it
        and send the signed transaction to the network

    - (alternatively): redirect to appropriate place in [Stellar Laboratory]


* _user_:

    - use computed `TX-PAYLOAD`, verify it, sign and send
        to network (with the usage of [LedgerHQ] and/or [Stellar Laboratory])

<br />




V. Shambhala transaction signing process (draft)
--------------------------------------------------

1. Initial state

* _user_:

    - know his/her `PIN`
    - has already associated `C-PUBLIC` and `S-PUBLIC`
        to his/her account in the process of onboarding

* _client_:

    - `G-PUBLIC` present in storage
    - `EncCKP` present in storage
    - `C-SALT` present in storage
    - `SALT-FOR-S` present in storage

* _server_:

    - `G-PUBLIC` present in storage
    - `EncSKP` present in storage
    - `account-funded-by-sfox` flag present in storage




2. Transaction verification

* _client_:

    - decode `TX-PAYLOAD` and present to the _user_:

        - source account identifier
        - transaction fee
        - sequence number
        - time bounds
        - memo
        - operations




3. Transaction signing

* _client_:

    - ask _user_ to provide `PIN`

    - compute `S-KEY`:

        > `S-KEY` = genKey(`PIN`, `SALT-FOR-S`)

    - send `S-KEY` and `TX-PAYLOAD` to the _server_

    - destroy `PIN` and `S-KEY`


* _server_:

    - receive `S-KEY` and `TX-PAYLOAD` from _client_

    - extract `S-SECRET` and `SALT-FOR-C` by decrypting `EncSKP`:

        > `S-SECRET` + `SALT-FOR-C` = decrypt(`EncSKP`, `S-KEY`)

    - if extraction has failed it means that received `S-KEY` is invalid,
        so potential data breach occured on _client_ side or simply
        _user_ made a typo in `KEY`. In such scenario next steps
        are impossible, so the procedure has to be interrupted, _failure
        counter_ has to be increased and _client_ has to be notified. Security
        precautions can be implemented in this step, for example after
        3 failed attempts communication with this _client_ can be suspended
        for a longer period of time, etc.

    - generate `SKP`:

        > `SKP` = StellarSDK.Keypair.fromSecret(`S-SECRET`)

    - compute `S-SIGNATURE` by singing `TX-PAYLOAD` with `SKP`:

        > `S-SIGNATURE` = signTSB(`TX-PAYLOAD`, `SKP`)

    - destroy `SKP` and `S-SECRET`

    - compute `C-PASSPHRASE`:

        > `C-PASSPHRASE` = genKey(`S-KEY`, `SALT-FOR-C`)

    - send `C-PASSPHRASE` and `S-SIGNATURE` to _client_

    - destroy `S-KEY`, `SALT-FOR-C`, `C-PASSPHRASE`


* _client_:

    - receive `C-PASSPHRASE` and `S-SIGNATURE` from the _server_

    - compute `C-KEY`:

        > `C-KEY` = genKey(`C-PASSPHRASE`, `C-SALT`)

    - extract `C-SECRET` by decrypting `EncCKP`:

        > `C-SECRET` = decrypt(`EncCKP`, `C-KEY`)

    - generate `CKP`:

        `CKP` = StellarSDK.Keypair.fromSecret(`C-SECRET`)

    - compute `C-SIGNATURE` by singing `TX-PAYLOAD` with `CKP`:

         > `C-SIGNATURE` = signTSB(`TX-PAYLOAD`, `CKP`)

    - destroy `CKP`, `C-SECRET`, `C-PASSPHRASE` and `C-KEY`

    - send `S-SIGNATURE` and `C-SIGNATURE` to the host application

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
    - _user_ **knows** `PIN` and **has** `SALT-FOR-S`, which are the two
        neccessary ingredients to derive `S-KEY` needed to decrypt `SKP`,
        so in case of server-side database breach `SKP` is safe,
    - decryption of `CKP` depends on _user_ **knowledge** (`PIN`) and,
        amongs other things, on element stored in **encrypted form** on server
        (`SALT-FOR-C`), so in case of client-side storage breach `CKP` is safe
    - if _user_ will loose a device with stored `CKP` or forget a `PIN` or
        simply want to cancel using _shambhala transaction-signing scheme_,
        his/her funds on _[stellar] network_ are safe, because he/she
        **knows** `G-MNEMONIC` with `PASSPHRASE` from which the **master key**
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
