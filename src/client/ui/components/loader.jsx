/**
 * Shambhala.
 *
 * Full-screen loader.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import CircularProgress from "@material-ui/core/CircularProgress"
import { makeStyles } from "@material-ui/styles"

import Layout from "./layout"




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
const Loader = ({ ready }) => ((classes) =>
    ready ?
        <Layout /> :
        <main className={classes.layout}>
            <CircularProgress color="secondary" />
        </main>
)(useStyles())




// ...
Loader.propTypes = {
    ready: PropTypes.bool.isRequired,
}




// ...
export default connect(
    (s) => ({ ready: s.App.ready })
)(Loader)
