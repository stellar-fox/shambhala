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
import Grid from "@material-ui/core/Grid"
import Toolbar from "@material-ui/core/Toolbar"
import Paper from "@material-ui/core/Paper"
import red from "@material-ui/core/colors/red"
import Typography from "@material-ui/core/Typography"




// ...
const useStyles = makeStyles((t) => ({

    layout: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },

    appBarCenterPane: {
        flexGrow: 1,
        paddingLeft: t.spacing.unit * 2,
        paddingRight: t.spacing.unit * 2,

    },

    main: {
        maxHeight: 400,
        flexGrow: 1,
        display: "flex",
        "justifyContent": "center",
    },

    content: {
        maxWidth: 500,
        flexGrow: 1,
        marginTop: t.spacing.unit * 4,
        marginRight: t.spacing.unit * 4,
        marginLeft: t.spacing.unit * 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
        ...t.mixins.gutters(),
        paddingTop: t.spacing.unit * 3,
        paddingBottom: t.spacing.unit * 3,

        "& $icon": {
            fontSize: 64,
            color: "rgb(114, 222, 255)",
            filter: "drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.5))",
            marginBottom: t.spacing.unit,
        },

        "& $headingStrecher": {
            marginBottom: t.spacing.unit,
            minHeight: 80,
            display: "flex",
            direction: "column",
            alignItems: "center",

            "& $heading": {
                display: "block",
                textShadow: "0px 0px 7px rgba(0, 0, 0, 0.5)",
            },

        },

        "& $button": {
            marginLeft: 2 * t.spacing.unit,
            marginRight: 2 * t.spacing.unit,

            "&$disabled": { backgroundColor: "transparent !important" },

            "&$yes": {
                backgroundColor: fade(
                    green[500], t.palette.action.hoverOpacity
                ),
                "&:hover": {
                    backgroundColor: fade(
                        green[500], 3 * t.palette.action.hoverOpacity
                    ),
                },
            },

            "&$no": {
                backgroundColor: fade(
                    red[500], t.palette.action.hoverOpacity
                ),
                "&:hover": {
                    backgroundColor: fade(
                        red[500], 3 * t.palette.action.hoverOpacity
                    ),
                },
            },
        },
    },

    icon: {},

    headingStrecher: {},

    heading: {},

    button: {},

    disabled: {},

    yes: {},

    no: {},

    footer: {
        padding: t.spacing.unit,

        "& $text": {
            color: "rgba(255, 255, 255, 0.25)",
            textAlign: "center",
        },

        "& $heart": { color: "rgba(219, 51, 39, 0.75)" },

        "& $emoji": { color: "rgba(255, 255, 255, 0.75)" },
    },

    text: {},

    heart: {},

    emoji: {},

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
    style,
}) => ((css) =>

    <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="stretch"
        className={css.layout}
        style={style}
    >

        <Grid item>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" color="inherit">
                        shambhala
                    </Typography>
                    <div className={css.appBarCenterPane}>
                        { iconizeMessage(currentMessage) }
                    </div>
                    <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        align="right"
                    >
                        { humanMessage }
                    </Typography>
                </Toolbar>
            </AppBar>
        </Grid>

        <Grid item component="main" className={css.main}>
            <Paper className={css.content}>
                { iconizeMessage(currentMessage, [{ className: css.icon }]) }
                <div className={css.headingStrecher}>
                    <Typography
                        component="h1"
                        variant="h5"
                        align="center"
                        className={css.heading}
                    >
                        { humanMessage }
                    </Typography>
                </div>
                <div>
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
        </Grid>

        <Grid item className={css.footer}>
            <Typography component="p" className={css.text}>
                Made with
                &nbsp;<span
                    className={css.heart}
                    role="img" aria-label="love"
                >❤</span>&nbsp;
                on
                &nbsp;<span
                    className={css.emoji}
                    role="img" aria-label="earth"
                >🌍</span>&nbsp;
                .
            </Typography>
        </Grid>

    </Grid>

)(useStyles())




// ...
Layout.propTypes = {
    basicReject: PropTypes.func.isRequired,
    basicResolve: PropTypes.func.isRequired,
    currentMessage: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    humanMessage: PropTypes.string.isRequired,
    style: PropTypes.object.isRequired,
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
