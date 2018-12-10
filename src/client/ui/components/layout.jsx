/**
 * Shambhala.
 *
 * Application layout.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import { string } from "@xcmats/js-toolbox"

import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import {
    basicReject,
    basicResolve,
} from "../thunks"
import {
    humanizeMessage,
    iconizeMessage,
} from "../helpers"

import { makeStyles } from "@material-ui/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import AppBar from "@material-ui/core/AppBar"
import Button from "@material-ui/core/Button"
import green from "@material-ui/core/colors/green"
import Toolbar from "@material-ui/core/Toolbar"
import Paper from "@material-ui/core/Paper"
import red from "@material-ui/core/colors/red"
import Typography from "@material-ui/core/Typography"




// ...
const useStyles = makeStyles((t) => ({

    appBar: { position: "relative" },

    grow: { flexGrow: 1 },

    layout: {
        width: "auto",
        display: "block",
        marginLeft: t.spacing.unit * 3,
        marginRight: t.spacing.unit * 3,
        [t.breakpoints.up(400 + t.spacing.unit * 3 * 2)]: {
            width: 400,
            marginLeft: "auto",
            marginRight: "auto",
        },
    },

    paper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: t.spacing.unit * 8,
        marginBottom: t.spacing.unit * 4,
        ...t.mixins.gutters(),
        paddingTop: t.spacing.unit * 2,
        paddingBottom: t.spacing.unit * 2,
    },

    icon: {
        fontSize: 64,
        color: "rgb(114, 222, 255)",
        filter: "drop-shadow(0px 0px 7px rgb(29, 36, 46))",
        margin: t.spacing.unit,
    },

    head: { textShadow: "0px 0px 7px rgb(29, 36, 46)" },

    button: {
        marginLeft: 2 * t.spacing.unit,
        marginRight: 2 * t.spacing.unit,
    },

    buttonDisabled: { backgroundColor: "transparent !important" },

    yes: {
        backgroundColor: fade(green[500], t.palette.action.hoverOpacity),
        "&:hover": {
            backgroundColor: fade(green[500], 3 * t.palette.action.hoverOpacity),
        },
    },

    no: {
        backgroundColor: fade(red[500], t.palette.action.hoverOpacity),
        "&:hover": {
            backgroundColor: fade(red[500], 3 * t.palette.action.hoverOpacity),
        },
    },

    buttons: {
        marginTop: 4 * t.spacing.unit,
        marginBottom: t.spacing.unit,
    },

    footerText: {
        color: "rgba(255, 255, 255, 0.25)",
        textAlign: "center",
    },

    footerHeart: { color: "rgba(219, 51, 39, 0.75)" },

    footerEmoji: { color: "rgba(255, 255, 255, 0.75)" },

}))




/**
 * <Layout> component.
 *
 * @function Layout
 * @returns {React.ReactElement}
 */
const Layout = ({
    basicReject,
    basicResolve,
    currentMessage,
    disabled,
    humanMessage,
}) => ((css) =>

    /* <> */  // jsdoc doesn't support this notation now
    <React.Fragment>

        <AppBar className={css.appBar}>
            <Toolbar>
                <Typography variant="h6" color="inherit" noWrap>
                    Stellar Fox
                </Typography>
                <div className={css.grow} />
                <Typography variant="subtitle2" color="textSecondary" noWrap>
                    { humanMessage }
                </Typography>
            </Toolbar>
        </AppBar>

        <main className={css.layout}>

            <Paper className={css.paper} elevation={4}>
                { iconizeMessage(currentMessage, [{ className: css.icon }]) }
                <Typography
                    component="h1"
                    className={css.head}
                    variant="h5"
                >
                    shambhala
                </Typography>
                <div className={css.buttons}>
                    <Button
                        className={classNames(css.button, css.yes)}
                        classes={{ disabled: css.buttonDisabled }}
                        variant="outlined"
                        disabled={disabled}
                        onClick={() => basicResolve()}
                    >Yes</Button>
                    <Button
                        className={classNames(css.button, css.no)}
                        classes={{ disabled: css.buttonDisabled }}
                        variant="outlined"
                        disabled={disabled}
                        onClick={() => basicReject("ui")}
                    >No</Button>
                </div>
            </Paper>

            <Typography component="p" className={css.footerText}>
                Made with
                &nbsp;<span
                    className={css.footerHeart}
                    role="img" aria-label="love"
                >❤</span>&nbsp;
                on
                &nbsp;<span
                    className={css.footerEmoji}
                    role="img" aria-label="earth"
                >🌍</span>&nbsp;
                .
            </Typography>

        </main>

    </React.Fragment>
    /* </> */  // jsdoc doesn't support this notation now

)(useStyles())




// ...
Layout.propTypes = {
    basicReject: PropTypes.func.isRequired,
    basicResolve: PropTypes.func.isRequired,
    currentMessage: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    humanMessage: PropTypes.string.isRequired,
}




// ...
export default connect(
    (s) => ({
        disabled: s.App.promptMutexResolveValue === null,
        currentMessage: s.App.message || string.empty(),
        humanMessage: humanizeMessage(s.App.message),
    }),
    (dispatch) => bindActionCreators({
        basicReject,
        basicResolve,
    }, dispatch)
)(Layout)
