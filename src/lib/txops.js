/**
 * Stellar transaction-related operations (library).
 *
 * @module txops-lib
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
 * Decode relevant information from a given `TransactionSignaturePayload` XDR.
 *
 * @function inspectTSP
 * @param {Uint8Array} tspXDR XDR-encoded `TransactionSignaturePayload`
 * @returns {Object}
 */
export const inspectTSP = (tspXDR) => {
    let tx = (
        xdr.TransactionSignaturePayload
            .fromXDR(tspXDR)
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
                [memo.value()]
            ))(tx.memo()),
            () => Memo.none()
        ),

        operations: tx.operations().map(
            Operation.fromXDRObject.bind(Operation)
        ),

    }
}




/**
 * Sign `TransactionSignaturePayload` using given Stellar `Keypair` object.
 * Return `DecoratedSignature` (XDR).
 *
 * @function signTSP
 * @param {Object} kp StellarSDK.Keypair object
 * @param {Uint8Array} tspXDR XDR-encoded `TransactionSignaturePayload`
 * @returns {Uint8Array} XDR-encoded `DecoratedSignature`
 */
export const signTSP = (kp, tspXDR) =>
    kp.signDecorated(stellarHash(tspXDR)).toXDR()
