/**
 * Shambhala.
 *
 * Full-screen loader.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React, { memo } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { func } from "@xcmats/js-toolbox"
import { makeStyles } from "@material-ui/styles"

import CircularProgress from "@material-ui/core/CircularProgress"
import Fade from "@material-ui/core/Fade"
import Layout from "./layout"
import Typography from "@material-ui/core/Typography"




// ...
const useStyles = makeStyles((t) => ({

    layout: {
        position: "absolute",
        width: t.spacing(32),
        height: t.spacing(16),
        left: "50%",
        top: "50%",
        marginLeft: -1 * t.spacing(16),
        marginTop: -1 * t.spacing(8),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
    },

    rect: { padding: t.spacing(2) },

    infoMessage: {
        textAlign: "center",
        color: t.palette.custom.dirty,
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

        <Fade in={showUi} style={{ willChange: "unset" }}>
            <Layout />
        </Fade> :

        <Fade in={showLoader} style={{ willChange: "unset" }}>
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
export default func.compose(
    connect(
        (s) => ({
            infoMessage: s.App.infoMessage,
            ready: s.App.ready,
            showLoader: s.App.showLoader,
            showUi: s.App.showUi,
        })
    ),
    memo
)(Loader)
