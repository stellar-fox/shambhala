/**
 * Shambhala.
 *
 * Passphrase generation view.
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
import { makeStyles } from "@material-ui/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import { GENERATE_ADDRESS } from "../../../lib/messages"

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
            "& $textField": {
                margin: t.spacing(1),
                width: "100%",
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
    textField: {},
    inputLabel: { color: fade(t.palette.text.primary, 0.4) },
    buttonBar: {},
    button: {},
    disabled: {},
    yes: {},
    no: {},

}))




/**
 * `<GeneratePassphrase>` component.
 *
 * @function GeneratePassphrase
 * @returns {React.ReactElement}
 */
const GeneratePassphrase = ({
    basicReject,
    basicResolve,
    className = string.empty(),
    enabled,
    style = {},
}) => {
    const css = useStyles()

    // text field states and logic
    let
        [t1, setT1] = useState(string.empty()),
        [t2, setT2] = useState(string.empty()),
        [visible, setVisible] = useState(false),
        resolve = (e) => {
            e.preventDefault()
            if (enabled && t1 === t2) {
                basicResolve(t1)
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
                    Passphrase Generation
                </Typography>
                <Typography component="p" variant="body1" align="center">
                    Please invent some passphrase known only to you.
                    Don't store it anywhere. Don't tell anyone about it.
                    Just learn it by heart.
                </Typography>
            </div>

            <form
                className={css.inputs}
                noValidate
                autoComplete="off"
                onSubmit={resolve}
            >
                <TextField
                    id="passphrase-base"
                    label="Passphrase"
                    type={visible ? "text" : "password"}
                    variant="filled"
                    className={css.textField}
                    value={t1}
                    onChange={(e) => setT1(e.target.value)}
                    helperText={string.space()}
                    InputLabelProps={{ classes: { root: css.inputLabel }}}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="Toggle passphrase visibility"
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
                    id="passphrase-repeat"
                    label="Passphrase (repeat)"
                    type={visible ? "text" : "password"}
                    variant="filled"
                    className={css.textField}
                    error={t1 !== t2}
                    value={t2}
                    onChange={(e) => setT2(e.target.value)}
                    helperText={
                        t1 !== t2 ?
                            "passphrases doesn't match" :
                            string.space()
                    }
                    InputLabelProps={{ classes: { root: css.inputLabel }}}
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
                    disabled={!enabled || t1 !== t2}
                    onClick={resolve}
                >{ t1 === string.empty() ? "Skip" : "Next" }</Button>
            </div>

        </Paper>
    )
}




// ...
GeneratePassphrase.propTypes = {
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
                array.head(s.App.message) === GENERATE_ADDRESS  &&
                s.App.viewNumber === 2,
        }),
        (dispatch) => bindActionCreators({
            basicReject,
            basicResolve,
        }, dispatch)
    ),
    memo
)(GeneratePassphrase)
