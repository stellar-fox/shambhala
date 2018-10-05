/**
 * Stellar transaction-related operations (library).
 *
 * @module txops
 * @license Apache-2.0
 */




import {
    codec,
    choose,
    handleException,
    isString,
} from "@xcmats/js-toolbox"
import {
    hash as stellarHash,
    Memo,
    Operation,
    StrKey,
    xdr,
} from "stellar-sdk"




/**
 * Decode relevant information from a given `TransactionSignatureBase` XDR.
 *
 * @function inspectTSB
 * @param {Uint8Array} tsbXDR XDR-encoded `TransactionSignatureBase`
 * @returns {Object}
 */
export const inspectTSB = (tsbXDR) => {
    let tx = (
        xdr.TransactionSignaturePayload
            .fromXDR(tsbXDR)
            .taggedTransaction()
            .tx()
    )

    return {

        sourceAccount: StrKey.encodeEd25519PublicKey(
            tx.sourceAccount().ed25519()
        ),

        fee: tx.fee(),

        seqNum: tx.seqNum().toString(),

        timeBounds: tx.timeBounds(),

        memo: handleException(
            () => ((memo) => choose(
                memo.arm(), {
                    id: (val) => Memo.id(val.toString()),
                    text: (val) => isString(val) ?
                        Memo.text(val) :
                        Memo.text(codec.bytesToString(val)),
                    hash: (val) => Memo.hash(val),
                    retHash: (val) => Memo.return(val),
                },
                (_) => Memo.none(),
                [memo.value(),]
            ))(tx.memo()),
            () => Memo.none()
        ),

        operations: tx.operations().map(
            Operation.fromXDRObject.bind(Operation)
        ),

    }
}




/**
 * Sign `TransactionSignatureBase` using given Stellar `Keypair` object.
 * Return `DecoratedSignature` (XDR).
 *
 * @function signTSB
 * @param {Object} kp StellarSDK.Keypair object
 * @param {Uint8Array} tsbXDR XDR-encoded `TransactionSignatureBase`
 * @returns {Uint8Array} XDR-encoded `DecoratedSignature`
 */
export const signTSB = (kp, tsbXDR) =>
    kp.signDecorated(stellarHash(tsbXDR)).toXDR()
