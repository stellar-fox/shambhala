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




// ...
const styles = (theme) => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
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
        <Typography variant="h5">shambhala</Typography>
        <br />
        <Typography variant="body1">
            With
            &nbsp;<span role="img" aria-label="rocket">🚀</span>&nbsp;
            to the
            &nbsp;<span role="img" aria-label="stars">🌟</span>&nbsp;
            !
        </Typography>
    </Paper>




// ...
export default withStyles(styles)(Layout)
