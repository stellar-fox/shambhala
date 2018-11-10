/**
 * Stellar transaction-related operations (library).
 *
 * @module txops-lib
 * @license Apache-2.0
 */




import {
    codec,
    func,
} from "@xcmats/js-toolbox"
import {
    hash,
    Keypair,
    Transaction,
    xdr,
} from "stellar-sdk"




/**
 * Decode relevant information from a given `TransactionSignaturePayload` XDR.
 *
 * @function inspectTSP
 * @param {Uint8Array} tspXDR XDR-encoded `TransactionSignaturePayload`
 * @returns {Object} Two keys: `transaction` and `networkId`
 */
export const inspectTSP = (tspXDR) => {
    let
        txTSP = xdr.TransactionSignaturePayload.fromXDR(tspXDR),
        networkId = codec.bytesToHex(txTSP.networkId())

    return func.flow(
        (txTSP) => txTSP.taggedTransaction().tx(),
        (tx) => new xdr.TransactionEnvelope({tx}),
        (envelope) => new Transaction(envelope),
        (transaction) => ({ networkId, transaction }),
    )(txTSP)
}




/**
 * Sign `TransactionSignaturePayload` using given _stellar_ secret key.
 * Return `DecoratedSignature` (XDR).
 *
 * @function signTSP
 * @param {String} secret _stellar_ secret key
 * @param {Uint8Array} tspXDR XDR-encoded `TransactionSignaturePayload`
 * @returns {Uint8Array} XDR-encoded `DecoratedSignature`
 */
export const signTSP = (secret, tspXDR) =>
    Keypair
        .fromSecret(secret)
        .signDecorated(hash(tspXDR))
        .toXDR()
