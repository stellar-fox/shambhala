/**
 * Shambhala.
 *
 * UI helper functions.
 *
 * @module client-ui-helpers
 * @license Apache-2.0
 */




import { func } from "@xcmats/js-toolbox"
import * as message from "../../lib/messages"




/**
 * Convert message to a "human readable" one.
 *
 * @function humanizeMessage
 * @param {String} message
 * @returns {String}
 */
export const humanizeMessage = func.partial(
    func.rearg(func.choose)(1, 2, 0, 3)
)({
    [message.ASSOCIATE_ADDRESS]: () => "Existing Address Association",
    [message.BACKUP]: () => "Client Key Information Backup",
    [message.GENERATE_ADDRESS]: () => "New Address Generation",
    [message.GENERATE_SIGNING_KEYS]: () => "Signing Keys Generation",
    [message.RESTORE]: () => "Client Key Information Restore",
    [message.SIGN_TRANSACTION]: () => "Transaction Signing",
}, () => "Idle")
