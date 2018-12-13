/**
 * Shambhala.
 *
 * UI helper functions.
 *
 * @module client-ui-helpers
 * @license Apache-2.0
 */




import { createElement as rce } from "react"
import {
    func,
    string,
} from "@xcmats/js-toolbox"
import * as message from "../../lib/messages"

import IconAutorenew from "@material-ui/icons/Autorenew"
import IconBackup from "@material-ui/icons/Backup"
import IconFingerprint from "@material-ui/icons/Fingerprint"
import IconLock from "@material-ui/icons/Lock"
import IconPlaylistAdd from "@material-ui/icons/PlaylistAdd"
import IconRestore from "@material-ui/icons/Restore"
import IconVpnKey from "@material-ui/icons/VpnKey"




/**
 * Return only the "interesting" messages.
 * Used to prevent unnecessary re-renders.
 *
 * @function filterMessage
 * @param {String} message
 * @returns {String}
 */
export const filterMessage = func.partial(
    func.rearg(func.choose)(1, 2, 0, 3)
)({
    [message.ASSOCIATE_ADDRESS]: () => message.ASSOCIATE_ADDRESS,
    [message.BACKUP]: () => message.BACKUP,
    [message.GENERATE_ADDRESS]: () => message.GENERATE_ADDRESS,
    [message.GENERATE_SIGNING_KEYS]: () => message.GENERATE_SIGNING_KEYS,
    [message.RESTORE]: () => message.RESTORE,
    [message.SIGN_TRANSACTION]: () => message.SIGN_TRANSACTION,
}, () => string.empty())




/**
 * Convert a message to a "human readable" one.
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




/**
 * Convert a message to an icon.
 *
 * @param {String} message
 * @param {Array} iconProps
 * @returns {React.ReactElement}
 */
export const iconizeMessage = func.partial(
    func.rearg(func.choose)(1, 2, 0, 3)
)({
    [message.ASSOCIATE_ADDRESS]: func.partial(rce)(IconAutorenew),
    [message.BACKUP]: func.partial(rce)(IconBackup),
    [message.GENERATE_ADDRESS]: func.partial(rce)(IconPlaylistAdd),
    [message.GENERATE_SIGNING_KEYS]: func.partial(rce)(IconVpnKey),
    [message.RESTORE]: func.partial(rce)(IconRestore),
    [message.SIGN_TRANSACTION]: func.partial(rce)(IconFingerprint),
}, func.partial(rce)(IconLock))
