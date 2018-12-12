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
import { string } from "@xcmats/js-toolbox"

import { connect } from "react-redux"
import {
    humanizeMessage,
    iconizeMessage,
} from "../helpers"

import { makeStyles } from "@material-ui/styles"
import AppBar from "@material-ui/core/AppBar"
import Grid from "@material-ui/core/Grid"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"

import GenericChoice from "./generic"




// ...
const useStyles = makeStyles((t) => ({

    layout: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },

    header: {
        "@media (max-height: 345px)": { display: "none" },

        "& $appBarCenterPane": {
            flexGrow: 1,
            paddingLeft: t.spacing.unit * 2,
            paddingRight: t.spacing.unit * 2,

        },
    },

    appBarCenterPane: {},

    main: {
        maxHeight: 400,
        flexGrow: 1,
        display: "flex",
        "justifyContent": "center",
    },

    contentOuterStyle: {
        "@media (max-height: 380px)": {
            marginTop: t.spacing.unit,
            marginBottom: t.spacing.unit,
            marginLeft: t.spacing.unit,
            marginRight: t.spacing.unit,
        },

        "@media (max-width: 412px)": {
            marginLeft: t.spacing.unit,
            marginRight: t.spacing.unit,
        },

        minWidth: 240,
        maxWidth: 500,
        flexGrow: 1,
        marginTop: t.spacing.unit * 4,
        marginRight: t.spacing.unit * 4,
        marginLeft: t.spacing.unit * 4,
    },

    footer: {

        "@media (max-height: 380px)": { display: "none" },

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
    currentMessage,
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

        <Grid item className={css.header}>
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
            <GenericChoice outerStyleClassName={css.contentOuterStyle} />
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
    currentMessage: PropTypes.string.isRequired,
    humanMessage: PropTypes.string.isRequired,
    style: PropTypes.object.isRequired,
}




// ...
export default connect(
    (s) => ({
        currentMessage: s.App.message || string.empty(),
        humanMessage: humanizeMessage(s.App.message),
    })
)(Layout)
