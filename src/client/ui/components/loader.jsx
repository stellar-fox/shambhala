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
import Fade from "@material-ui/core/Fade"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/styles"

import Layout from "./layout"




// ...
const useStyles = makeStyles((t) => ({

    layout: {
        position: "absolute",
        width: t.spacing.unit * 32,
        height: t.spacing.unit * 16,
        left: "50%",
        top: "50%",
        marginLeft: -1 * t.spacing.unit * 16,
        marginTop: -1 * t.spacing.unit * 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
    },

    rect: { padding: 2 * t.spacing.unit },

    infoMessage: {
        textAlign: "center",
        color: "rgba(115, 125, 112, 0.75)",
    },

}))




/**
 * `<Loader>` component.
 *
 * @function Loader
 * @param {Object} props
 * @returns {React.ReactElement}
 */
const Loader = ({
    infoMessage,
    ready,
    showLoader,
    showUi,
}) => ((css) =>

    ready ?

        <Fade in={showUi}><Layout /></Fade> :

        <Fade in={showLoader}>
            <main className={css.layout}>
                <div className={css.rect}>
                    <CircularProgress color="secondary" />
                </div>
                <div className={css.rect}>
                    <Typography
                        component="p"
                        className={css.infoMessage}
                    >
                        { infoMessage }
                    </Typography>
                </div>
            </main>
        </Fade>

)(useStyles())




// ...
Loader.propTypes = {
    infoMessage: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    showLoader: PropTypes.bool.isRequired,
    showUi: PropTypes.bool.isRequired,
}




// ...
export default connect(
    (s) => ({
        infoMessage: s.App.infoMessage,
        ready: s.App.ready,
        showLoader: s.App.showLoader,
        showUi: s.App.showUi,
    })
)(React.memo(Loader))
