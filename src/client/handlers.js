/**
 * Shambhala.
 *
 * Handlers attachment logic.
 *
 * @module client-app
 * @license Apache-2.0
 */




import heartbeat from "./actions/heartbeat"
import pingPong from "./actions/ping_pong"
import generateAddress from "./actions/generate_address"
import associateAddress from "./actions/associate_address"
import generateSigningKeys from "./actions/generate_signing_keys"
import generateSignedKeyAssocTx from "./actions/generate_signed_key_assoc_tx"
import generateKeyAssocTx from "./actions/generate_key_assoc_tx"
import getPublicKeys from "./actions/get_public_keys"
import backup from "./actions/backup"
import restore from "./actions/restore"
import canSignFor from "./actions/can_sign_for"
import signTransaction from "./actions/sign_transaction"
import cancel from "./actions/cancel"
import close from "./actions/close"




/**
 * Message handlers - load and attach.
 *
 * @function attach
 * @param {Function} logger
 * @param {Object} context
 * @param {Object} messageHandler
 * @param {Object} thunkActions
 * @param {Object} cryptops "@stellar-fox/cryptops" module
 * @param {Object} forage "localforage" module
 * @param {Object} message
 * @param {Object} toolbox
 */
export default function attach (
    logger, context, messageHandler, thunkActions,
    cryptops, forage, message,
    { cancellable, curryThunk, identity, isString, partial, quote }
) {

    [

        // heartbeat action
        {
            m: message.HEARTBEAT,
            a: heartbeat,
            args: [logger],
        },

        // ping-pong action
        {
            m: message.PING_PONG,
            a: pingPong,
            args: [logger],
        },

        // account generation action
        {
            m: message.GENERATE_ADDRESS,
            a: generateAddress,
            args: [cryptops, forage, logger, context],
        },

        // account association action
        {
            m: message.ASSOCIATE_ADDRESS,
            a: associateAddress,
            args: [cryptops, forage, logger],
        },

        // signing keys generation action
        {
            m: message.GENERATE_SIGNING_KEYS,
            a: generateSigningKeys,
            args: [cryptops, forage, logger],
        },

        // automatic keys association action
        {
            m: message.GENERATE_SIGNED_KEY_ASSOC_TX,
            a: generateSignedKeyAssocTx,
            args: [cryptops, forage, logger, context],
        },

        // manual keys association action
        {
            m: message.GENERATE_KEY_ASSOC_TX,
            a: generateKeyAssocTx,
            args: [cryptops, forage, logger],
        },

        // public keys retrieval action
        {
            m: message.GET_PUBLIC_KEYS,
            a: getPublicKeys,
            args: [forage, logger],
        },

        // backup action
        {
            m: message.BACKUP,
            a: backup,
            args: [cryptops, forage, logger],
        },

        // restore action
        {
            m: message.RESTORE,
            a: restore,
            args: [cryptops, forage, logger],
        },

        // transaction signing check
        {
            m: message.CAN_SIGN_FOR,
            a: canSignFor,
            args: [forage, logger],
        },

        // sign transaction action
        {
            m: message.SIGN_TRANSACTION,
            a: signTransaction,
            args: [cryptops, forage, logger],
        },

        // cancel ongoing operation action
        {
            m: message.CANCEL,
            a: cancel,
            args: [logger, context],
        },

        // close client
        {
            m: message.CLOSE,
            a: close,
            args: [logger],
        },

    // for each "action definition" (ad) ...
    ].forEach((ad) => {
        let
            // ... prepare message responder ...
            respond = partial(messageHandler.postMessage)(ad.m),

            // ... and create action with appropriate parameters bound
            act = curryThunk(ad.a)(
                // responding to host should only be possible
                // when some operation is "ongoing"
                (msg) =>
                    context.message ?
                        respond(msg) :
                        identity(msg)
            )(...ad.args)()

        // attach augmented action (act) to a message (ad.m):
        // before an action is invoked a check is performed
        // if another action is in progress - in such case a response
        // is formed ({ error: "busy" })
        messageHandler.handle(
            ad.m,
            async (...args) => {
                if (
                    ad.m !== message.HEARTBEAT  &&
                    ad.m !== message.CANCEL
                ) {
                    if (isString(context.message)) {
                        logger.warn(
                            quote(ad.m),
                            "requested while processing",
                            quote(context.message)
                        )
                        return respond({
                            error: `busy with ${quote(context.message)}`,
                        })
                    }
                    thunkActions.setMessage(ad.m)
                    context.message = ad.m
                    try {
                        let { promise, cancel } = cancellable(
                            act(...args)
                        )
                        context.cancelCurrentOperation = cancel
                        await promise
                    } catch (ex) {
                        logger.error(ex)
                    } finally {
                        delete context.cancelCurrentOperation
                        delete context.message
                        thunkActions.setMessage(null)
                    }
                } else {
                    await act(...args)
                }
            }
        )
    })

}
