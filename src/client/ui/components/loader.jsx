/**
 * Shambhala.
 *
 * Application layout.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React from "react"

import CircularProgress from "@material-ui/core/CircularProgress"
import { makeStyles } from "@material-ui/styles"




// ...
const useStyles = makeStyles((t) => ({

    layout: {
        position: "absolute",
        width: t.spacing.unit * 8,
        height: t.spacing.unit * 8,
        left: "50%",
        top: "50%",
        marginLeft: -1 * t.spacing.unit * 4,
        marginTop: -1 * t.spacing.unit * 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

}))




/**
 * <Loader> component.
 *
 * @function Loader
 * @returns {React.ReactElement}
 */
const Loader = () => ((classes) =>
    <main className={classes.layout}>
        <CircularProgress color="secondary" />
    </main>
)(useStyles())




// ...
export default Loader
