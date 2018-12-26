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
} from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import {
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

import Button from "@material-ui/core/Button"
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

        "& $headingStrecher": {
            marginBottom: t.spacing.unit,
            minHeight: 80,
            "& $heading": {
                margin: "0 auto",
                marginBottom: t.spacing.unit,
                display: "block",
                textShadow: `0px 0px 7px ${rgba(0, 0, 0, 0.5)}`,
            },
        },

        "& $inputs": {
            display: "flex",
            flexWrap: "wrap",
            "& $textField": {
                marginLeft: t.spacing.unit,
                marginRight: t.spacing.unit,
                width: "100%",
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

    headingStrecher: {},
    heading: {},
    inputs: {},
    textField: {},
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
    disabled,
    style = {},
}) => {
    const css = useStyles()

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
                    In addition to the previously generated 24 words,
                    please invent some passphrase known only to you.
                    Don't store it anywhere. Don't tell anyone about it.
                    Just learn it by heart.
                </Typography>
            </div>

            <form className={css.inputs} noValidate autoComplete="off">
                <TextField
                    id="passphrase-base"
                    label="Passphrase"
                    type="password"
                    className={css.textField}
                    margin="normal"
                />
                <TextField
                    id="passphrase-repeat"
                    label="Passphrase (repeat)"
                    type="password"
                    className={css.textField}
                    margin="normal"
                />
            </form>

            <div className={css.buttonBar}>
                <Button
                    className={classNames(css.button, css.yes)}
                    classes={{ disabled: css.disabled }}
                    variant="outlined"
                    disabled={disabled}
                    onClick={() => basicResolve()}
                >Yes</Button>
                <Button
                    className={classNames(css.button, css.no)}
                    classes={{ disabled: css.disabled }}
                    variant="outlined"
                    disabled={disabled}
                    onClick={() => basicReject("ui")}
                >No</Button>
            </div>

        </Paper>
    )
}




// ...
GeneratePassphrase.propTypes = {
    basicReject: PropTypes.func.isRequired,
    basicResolve: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}




// ...
export default func.compose(
    connect(
        (s) => ({
            disabled: s.App.promptMutexResolveValue === null,
        }),
        (dispatch) => bindActionCreators({
            basicReject,
            basicResolve,
        }, dispatch)
    ),
    memo
)(GeneratePassphrase)
