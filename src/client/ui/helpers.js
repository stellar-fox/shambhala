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

import GenericChoice from "./components/generic"
import GenerateAddress from "./components/generate_address"
import IconAutorenew from "@material-ui/icons/Autorenew"
import IconBackup from "@material-ui/icons/Backup"
import IconFingerprint from "@material-ui/icons/Fingerprint"
import IconLock from "@material-ui/icons/Lock"
import IconPlaylistAdd from "@material-ui/icons/PlaylistAdd"
import IconRestore from "@material-ui/icons/Restore"
import IconVpnKey from "@material-ui/icons/VpnKey"
import Idle from "./components/idle"
import Info from "./components/info"




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
 * @function iconizeMessage
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




/**
 * Convert a message to a view.
 *
 * @function messageToView
 * @param {String} message
 * @param {Array} iconProps
 * @returns {Function}
 */
export const messageToView = (() => {
    const
        Info1 = Info(),
        Info2 = Info(),
        GenericChoice1 = GenericChoice(),
        GenericChoice2 = GenericChoice(),
        GenericChoice3 = GenericChoice()
    return func.partial(
        func.rearg(func.choose)(1, 2, 0, 3)
    )({
        [message.ASSOCIATE_ADDRESS]: () => GenericChoice1,
        [message.BACKUP]: () => Info1,
        [message.GENERATE_ADDRESS]: () => GenerateAddress,
        [message.GENERATE_SIGNING_KEYS]: () => GenericChoice2,
        [message.RESTORE]: () => Info2,
        [message.SIGN_TRANSACTION]: () => GenericChoice3,
    }, () => Idle)
})()
