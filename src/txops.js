/**
 * Stellar transaction-related operations (library).
 *
 * @module @stellar-fox/shambhala
 * @license Apache-2.0
 */




import StellarSDK from "stellar-sdk"
import {
    bytesToString,
    choose,
    handleException,
    isString,
} from "@xcmats/js-toolbox"




/**
 * Decode relevant information from a given `TransactionSignatureBase` XDR.
 *
 * @function inspectTSB
 * @param {Uint8Array} tsbXDR XDR-encoded Transaction Signature Base
 * @returns {Object}
 */
export const inspectTSB = (tsbXDR) => {
    let tx =
        StellarSDK.xdr
            .TransactionSignaturePayload
            .fromXDR(tsbXDR)
            .taggedTransaction()
            .tx()

    return {
        sourceAccount:
            StellarSDK.StrKey
                .encodeEd25519PublicKey(
                    tx.sourceAccount().ed25519()
                ),
        fee: tx.fee(),
        seqNum: tx.seqNum().toString(),
        timeBounds: tx.timeBounds(),
        memo:
            handleException(
                () =>
                    ((memo) => choose(
                        memo.arm(), {
                            "id": (val) =>
                                StellarSDK.Memo.id(val.toString()),
                            "text": (val) =>
                                isString(val) ?
                                    StellarSDK.Memo.text(val) :
                                    StellarSDK.Memo.text(bytesToString(val)),
                            "hash": (val) =>
                                StellarSDK.Memo.hash(val),
                            "retHash": (val) =>
                                StellarSDK.Memo.return(val),
                        },
                        (_) => StellarSDK.Memo.none(),
                        [memo.value(),]
                    ))(tx.memo()),
                () => StellarSDK.Memo.none()
            ),
        operations:
            tx.operations().map(
                StellarSDK.Operation
                    .fromXDRObject
                    .bind(StellarSDK.Operation)
            ),
    }
}
