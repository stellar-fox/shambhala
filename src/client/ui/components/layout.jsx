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

import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import { withStyles } from "@material-ui/core/styles"

import LockIcon from "@material-ui/icons/Lock"




// ...
const styles = (t) => ({

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

    head: {
        textShadow: "0px 0px 7px rgb(29, 36, 46)",
    },

    text: {
        marginTop: 4 * t.spacing.unit,
        marginBottom: t.spacing.unit,
    },

})




/**
 * <Layout> component.
 *
 * @function Layout
 * @returns {React.ReactElement}
 */
const Layout = ({ classes }) =>
    <main className={classes.layout}>
        <Paper className={classes.paper} elevation={4}>
            <LockIcon className={classes.icon} />
            <Typography component="h1" className={classes.head} variant="h5">
                shambhala
            </Typography>
            <Typography component="p" className={classes.text}>
                With
                &nbsp;<span role="img" aria-label="rocket">🚀</span>&nbsp;
                to the
                &nbsp;<span role="img" aria-label="stars">🌟🌟🌟</span>&nbsp;
                !
            </Typography>
        </Paper>
    </main>




// ...
Layout.propTypes = {
    classes: PropTypes.object.isRequired,
}




// ...
export default withStyles(styles)(Layout)