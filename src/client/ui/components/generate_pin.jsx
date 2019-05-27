/**
 * Shambhala.
 *
 * PIN generation view.
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
    rgba,
    string,
} from "@xcmats/js-toolbox"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import {
    basicReject,
    basicResolve,
} from "../thunks"
import { action } from "../redux"
import { pinValid } from "../helpers"
import { makeStyles } from "@material-ui/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import { GENERATE_SIGNING_KEYS } from "../../../lib/messages"

import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
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
        paddingTop: t.spacing(3),
        paddingBottom: t.spacing(3),

        "& $headingStrecher": {
            marginBottom: t.spacing(1),
            minHeight: 80,
            "& $heading": {
                margin: "0 auto",
                marginBottom: t.spacing(1),
                color: t.palette.custom.rallyBrightGreen,
                display: "block",
                textShadow: `0px 0px 7px ${rgba(0, 0, 0, 0.5)}`,
            },
        },

        "& $inputs": {
            display: "flex",
            flexWrap: "wrap",
            "& $pinField": {
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: t.spacing(1),
                marginBottom: t.spacing(1),
                width: t.spacing(30),
            },
        },

        "& $buttonBar": {
            display: "flex",
            marginTop: t.spacing(1),
            "& $button": {
                flexGrow: 1,
                marginLeft: t.spacing(2),
                marginRight: t.spacing(2),
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

    headingStrecher: {},
    heading: {},
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
 * `<GeneratePin>` component.
 *
 * @function GeneratePin
 * @returns {React.ReactElement}
 */
const GeneratePin = ({
    basicReject,
    basicResolve,
    className = string.empty(),
    enabled,
    nextView,
    style = {},
}) => {
    const css = useStyles()

    // pin states and logic
    let
        [pin1, setPin1] = useState(string.empty()),
        [pin2, setPin2] = useState(string.empty()),
        [visible, setVisible] = useState(false),
        next = (e) => {
            e.preventDefault()
            if (enabled && pinValid(pin1) && pin1 === pin2) {
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

            <div className={css.headingStrecher}>
                <Typography
                    component="h1"
                    variant="h5"
                    align="center"
                    className={css.heading}
                >
                    PIN Generation
                </Typography>
                <Typography component="p" variant="body1" align="center">
                    Please type a number of minimum 5 digits.
                    This number is always needed to sign a transaction.
                    You can use letters too.
                </Typography>
            </div>

            <form
                className={css.inputs}
                noValidate
                autoComplete="off"
                onSubmit={next}
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
                <TextField
                    id="pin-repeat"
                    label="PIN (repeat)"
                    type={visible ? "text" : "password"}
                    variant="filled"
                    className={css.pinField}
                    error={pin1 !== pin2}
                    value={pin2}
                    onChange={(e) => setPin2(e.target.value)}
                    helperText={
                        pin1 !== pin2 ? "PINs doesn't match" : string.space()
                    }
                    InputLabelProps={{ classes: { root: css.pinLabel }}}
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
                    disabled={!enabled || !pinValid(pin1) || pin1 !== pin2}
                    onClick={next}
                >Next</Button>
            </div>

        </Paper>
    )
}




// ...
GeneratePin.propTypes = {
    basicReject: PropTypes.func.isRequired,
    basicResolve: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    nextView: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}




// ...
export default func.compose(
    connect(
        (s) => ({
            enabled:
                s.App.promptMutexLocked  &&
                array.head(s.App.message) === GENERATE_SIGNING_KEYS  &&
                s.App.viewNumber === 1,
        }),
        (dispatch) => bindActionCreators({
            basicReject,
            basicResolve,
            nextView: action.nextView,
        }, dispatch)
    ),
    memo
)(GeneratePin)
