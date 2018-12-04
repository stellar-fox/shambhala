/**
 * Shambhala.
 *
 * Application layout.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React from "react"

import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import { withStyles } from "@material-ui/core/styles"

import Https from "@material-ui/icons/Https"




// ...
const styles = (theme) => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    icon: {
        marginBottom: theme.spacing.unit,
        fontSize: 64,
    },
})




/**
 * <Layout> component.
 *
 * @function Layout
 * @returns {React.ReactElement}
 */
const Layout = ({ classes }) =>
    <Paper className={classes.root} elevation={2}>
        <Https className={classes.icon} />
        <Typography variant="h5">shambhala</Typography>
        <br />
        <Typography component="p">
            With
            &nbsp;<span role="img" aria-label="rocket">🚀</span>&nbsp;
            to the
            &nbsp;<span role="img" aria-label="stars">🌟</span>&nbsp;
            !
        </Typography>
    </Paper>




// ...
export default withStyles(styles)(Layout)
