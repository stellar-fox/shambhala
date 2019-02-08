/**
 * Shambhala.
 *
 * Transaction signing view.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React, {
    memo,
    useState,
} from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import {
    array,
    async,
    codec,
    func,
    string,
    type,
    utils,
} from "@xcmats/js-toolbox"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import {
    basicReject,
    basicResolve,
    setTxPayload,
} from "../thunks"
import { action } from "../redux"
import { pinValid } from "../helpers"
import { makeStyles } from "@material-ui/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import { rgba } from "../../../lib/utils"
import { inspectTSP } from "../../../lib/txops"
import { SIGN_TRANSACTION } from "../../../lib/messages"

import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import IconFingerprint from "@material-ui/icons/Fingerprint"
import IconVisibility from "@material-ui/icons/Visibility"
import IconVisibilityOff from "@material-ui/icons/VisibilityOff"
import InputAdornment from "@material-ui/core/InputAdornment"
import Paper from "@material-ui/core/Paper"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"




// ...
const useStyles = makeStyles((t) => ({

    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-evenly",
        ...t.mixins.gutters(),
        paddingTop: t.spacing.unit * 3,
        paddingBottom: t.spacing.unit * 3,

        "& $icon": {
            display: "block",
            margin: "0 auto",
            fontSize: 64,
            color: t.palette.custom.rallyBrightGreen,
            filter: `drop-shadow(0px 0px 5px ${rgba(0, 0, 0, 0.5)})`,
            marginBottom: t.spacing.unit,
        },

        "& $headingStrecher": {
            marginBottom: 2 * t.spacing.unit,
        },

        "& $txInspector": {
            display: "flex",
            overflowX: "hidden",
            overflowY: "auto",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: t.spacing.unit,
            fontFamily: "Roboto Condensed",
            textAlign: "center",
            wordBreak: "break-all",
            color: t.palette.custom.rallyBrightGreen,
            textShadow: `0px 0px 7px ${
                fade(t.palette.custom.rallyBrightGreen, 0.5)
            }`,
            boxShadow: [
                `inset 0px 1px 5px 0px ${rgba(0, 0, 0, 0.2)}`,
                `inset 0px 2px 2px 0px ${rgba(0, 0, 0, 0.14)}`,
                `inset 0px 3px 1px -2px ${rgba(0, 0, 0, 0.12)}`,
            ].join(", "),
            backgroundColor: t.palette.custom.darkGunmetal,
            borderRadius: t.shape.borderRadius,
            padding: t.spacing.unit,
        },

        "& $inputs": {
            display: "flex",
            flexWrap: "wrap",
            "& $pinField": {
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: t.spacing.unit,
                marginBottom: t.spacing.unit,
                width: 30 * t.spacing.unit,
            },
        },

        "& $buttonBar": {
            display: "flex",
            "& $button": {
                flexGrow: 1,
                marginLeft: 2 * t.spacing.unit,
                marginRight: 2 * t.spacing.unit,
                "&$disabled": { backgroundColor: "transparent !important" },
                "&$yes": {
                    backgroundColor: fade(
                        t.palette.custom.rallyGreen,
                        t.palette.action.hoverOpacity
                    ),
                    "&:hover": {
                        backgroundColor: fade(
                            t.palette.custom.rallyGreen,
                            3 * t.palette.action.hoverOpacity
                        ),
                    },
                },
                "&$no": {
                    backgroundColor: fade(
                        t.palette.custom.rallyRed,
                        t.palette.action.hoverOpacity
                    ),
                    "&:hover": {
                        backgroundColor: fade(
                            t.palette.custom.rallyRed,
                            3 * t.palette.action.hoverOpacity
                        ),
                    },
                },
            },
        },
    },

    icon: {},
    headingStrecher: {},
    txInspector: {},
    inputs: {},
    pinField: {},
    pinLabel: { color: fade(t.palette.text.primary, 0.4) },
    buttonBar: {},
    button: {},
    disabled: {},
    yes: {},
    no: {},

}))




/**
 * `<SignTransaction>` component.
 *
 * @function SignTransaction
 * @returns {React.ReactElement}
 */
const SignTransaction = ({
    basicReject,
    basicResolve,
    className = string.empty(),
    enabled,
    nextView,
    setTxPayload,
    style = {},
    txPayload,
}) => {
    const css = useStyles()

    // pin states and logic
    let
        [pin1, setPin1] = useState(string.empty()),
        [visible, setVisible] = useState(false),
        sign = (e) => {
            e.preventDefault()
            if (enabled && pinValid(pin1)) {
                async.timeout(() => setTxPayload(string.empty()))
                basicResolve(pin1)
                nextView()
            }
            return false
        }

    return (
        <Paper
            className={classNames(className, css.content)}
            style={style}
        >

            <IconFingerprint className={css.icon} />
            <div className={css.headingStrecher}>
                <Typography component="p" variant="body1" align="center">
                    Please enter your PIN.
                </Typography>
            </div>

            <div
                className={css.txInspector}
                style={{ height: style.minHeight - 300 }}
            >
                { utils.handleException(() => {
                    let {
                        transaction: tx,
                        networkId: net,
                    } = inspectTSP(codec.b64dec(txPayload))
                    return (
                        <React.Fragment>
                            <div>
                                <b>net:</b> {string.shorten(net, 25)}
                            </div>
                            <div>
                                <b>src:</b> {string.shorten(tx.source, 27)}
                            </div>
                            <div>
                                <b>fee:</b> {tx.fee} &nbsp;
                                <b>seq:</b> {tx.sequence}
                            </div>
                            { tx.operations
                                .map((op) => func.choose(op.type, {
                                    "accountMerge": () => <div key={op}>
                                        <b>{op.type}:</b>&nbsp;
                                        {string.shorten(op.destination, 21)}
                                    </div>,
                                    "allowTrust": () => <div key={op}>
                                        <b>{op.type}:</b>&nbsp;
                                        {op.authorize ? "auth" : "deauth"}&nbsp;
                                        {string.shorten(op.trustor, 21)}&nbsp;
                                        {String(op.assetCode)}
                                    </div>,
                                    "bumpSequence": () => <div key={op}>
                                        <b>{op.type}:</b>&nbsp;
                                        {String(op.bumpTo)}
                                    </div>,
                                    "changeTrust": () => <div key={op}>
                                        <b>{op.type}:</b>&nbsp;
                                        {string.shorten(
                                            op.asset.getIssuer(), 21
                                        )}&nbsp;->&nbsp;
                                        {op.asset.getCode()}&nbsp;
                                        {op.limit || "0" }
                                    </div>,
                                    "createAccount": () => <div key={op}>
                                        <b>{op.type}:</b>&nbsp;
                                        {String(op.startingBalance)}&nbsp;
                                        XLM&nbsp;->&nbsp;
                                        {string.shorten(op.destination, 21)}
                                    </div>,
                                    "manageData": () => <div key={op}>
                                        <b>{op.type}:</b>&nbsp;
                                        {op.name}&nbsp;-&nbsp;
                                        {type.isString(op.value) ?
                                            string.shorten(op.value, 41) :
                                            string.shorten(
                                                codec.bytesToHex(op.value),
                                                41
                                            )}
                                    </div>,
                                    "payment": () => <div key={op}>
                                        <b>{op.type}:</b>&nbsp;
                                        {String(op.amount)}&nbsp;
                                        {op.asset.getCode()}&nbsp;->&nbsp;
                                        {string.shorten(op.destination, 21)}
                                    </div>,
                                }, () =>
                                    <div key={op}><b>{op.type}</b></div>
                                )) }
                            <div>
                                <b>memo:</b> { tx.memo.type === "text" ?
                                    codec.bytesToString(tx.memo.value) :
                                    codec.bytesToHex(tx.memo.value) }
                            </div>
                        </React.Fragment>
                    )
                }, () => "...") }
            </div>

            <form
                className={css.inputs}
                noValidate
                autoComplete="off"
                onSubmit={sign}
            >
                <TextField
                    id="pin-base"
                    label="PIN"
                    type={visible ? "text" : "password"}
                    variant="filled"
                    className={css.pinField}
                    value={pin1}
                    onChange={(e) => setPin1(e.target.value)}
                    helperText={
                        !pinValid(pin1) && pin1 !== string.empty() ?
                            "PIN is too short" : string.space()
                    }
                    InputLabelProps={{ classes: { root: css.pinLabel }}}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="Toggle PIN visibility"
                                    tabIndex="-1"
                                    onClick={() => setVisible(!visible)}
                                >
                                    { visible ?
                                        <IconVisibility /> :
                                        <IconVisibilityOff /> }
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </form>

            <div className={css.buttonBar}>
                <Button
                    className={classNames(css.button, css.no)}
                    classes={{ disabled: css.disabled }}
                    variant="outlined"
                    disabled={!enabled}
                    onClick={() => {
                        async.timeout(() => setTxPayload(string.empty()))
                        basicReject("ui")
                    }}
                >Abort</Button>
                <Button
                    className={classNames(css.button, css.yes)}
                    classes={{ disabled: css.disabled }}
                    variant="outlined"
                    disabled={!enabled || !pinValid(pin1)}
                    onClick={sign}
                >Sign</Button>
            </div>

        </Paper>
    )
}




// ...
SignTransaction.propTypes = {
    basicReject: PropTypes.func.isRequired,
    basicResolve: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    nextView: PropTypes.func.isRequired,
    setTxPayload: PropTypes.func.isRequired,
    txPayload: PropTypes.string.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}




// ...
export default func.compose(
    connect(
        (s) => ({
            enabled:
                s.App.promptMutexLocked  &&
                array.head(s.App.message) === SIGN_TRANSACTION  &&
                s.App.viewNumber === 1,
            txPayload: s.App.txPayload,
        }),
        (dispatch) => bindActionCreators({
            basicReject,
            basicResolve,
            nextView: action.nextView,
            setTxPayload,
        }, dispatch)
    ),
    memo
)(SignTransaction)
