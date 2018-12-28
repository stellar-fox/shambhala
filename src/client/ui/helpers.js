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
import GenerateMnemonic from "./components/generate_mnemonic"
import GeneratePassphrase from "./components/generate_passphrase"
import GeneratePin from "./components/generate_pin"
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
export const filterMessage = func.rearg(func.choose)(1, 2, 0)({
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
export const humanizeMessage = func.rearg(func.choose)(1, 2, 0)({
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
 * @param {String} msg
 * @param {Array} iconProps
 * @returns {React.ReactElement}
 */
export const iconizeMessage = func.rearg(func.choose)(1, 2, 0)({
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
        GenericChoice2 = GenericChoice()
    return func.rearg(func.choose)(1, 2, 0)({
        [message.ASSOCIATE_ADDRESS + ".01"]: () => GenericChoice1,
        [message.BACKUP + ".01"]: () => Info1,
        [message.GENERATE_ADDRESS + ".01"]: () => GenerateMnemonic,
        [message.GENERATE_ADDRESS + ".02"]: () => GeneratePassphrase,
        [message.GENERATE_SIGNING_KEYS + ".01"]: () => GeneratePin,
        [message.RESTORE + ".01"]: () => Info2,
        [message.SIGN_TRANSACTION + ".01"]: () => GenericChoice2,
    }, () => Idle)
})()
