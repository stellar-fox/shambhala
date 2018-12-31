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
    func,
    string,
} from "@xcmats/js-toolbox"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import {
    basicReject,
    basicResolve,
} from "../thunks"
import { makeStyles } from "@material-ui/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import { rgba } from "../../../lib/utils"
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
        overflow: "hidden",
        overflowY: "auto",
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
            marginBottom: t.spacing.unit,
            minHeight: 80,
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
            marginTop: t.spacing.unit,
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
    style = {},
}) => {
    const css = useStyles()

    // pin states and logic
    let
        [pin1, setPin1] = useState(string.empty()),
        pinValid = (pin) => String(pin).length >= 5,
        [visible, setVisible] = useState(false)


    return (
        <Paper
            className={classNames(className, css.content)}
            style={style}
        >

            <IconFingerprint className={css.icon} />
            <div className={css.headingStrecher}>
                <Typography component="p" variant="body1" align="center">
                    Enter your PIN if you wish to sign a transaction.
                </Typography>
            </div>

            <form className={css.inputs} noValidate autoComplete="off">
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
                    onClick={() => basicReject("ui")}
                >Abort</Button>
                <Button
                    className={classNames(css.button, css.yes)}
                    classes={{ disabled: css.disabled }}
                    variant="outlined"
                    disabled={!enabled || !pinValid(pin1)}
                    onClick={() => basicResolve(pin1)}
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
        }),
        (dispatch) => bindActionCreators({
            basicReject,
            basicResolve,
        }, dispatch)
    ),
    memo
)(SignTransaction)
