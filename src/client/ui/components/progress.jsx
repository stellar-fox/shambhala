/**
 * Shambhala.
 *
 * Info view with linear progress indicator.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React, {
    memo,
} from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import {
    func,
    rgba,
    string,
} from "@xcmats/js-toolbox"
import { connect } from "react-redux"
import { makeStyles } from "@material-ui/styles"

import IconSettings from "@material-ui/icons/Settings"
import LinearProgress from "@material-ui/core/LinearProgress"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"




// ...
const useStyles = makeStyles((t) => ({

    "@global": {
        "@keyframes right-spin": {
            from: { transform: "rotate(0deg)" },
            to: { transform: "rotate(360deg)" },
        },
    },

    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-evenly",
        ...t.mixins.gutters(),
        paddingTop: t.spacing.unit * 3,
        paddingBottom: t.spacing.unit * 3,

        "& $icon": {
            display: "block",
            margin: "0 auto",
            fontSize: 64,
            color: t.palette.custom.rallyBrightGreen,
            filter: `drop-shadow(0px 0px 5px ${rgba(0, 0, 0, 0.5)})`,
            marginBottom: t.spacing.unit,
            animation: "right-spin infinite 2s linear",
        },

        "& $headingStrecher": {
            marginBottom: t.spacing.unit,
        },

        "& $progressPane": {
            fontFamily: "Roboto Condensed",
            textAlign: "center",
            color: t.palette.custom.rallyBrightGreen,
            textShadow: `0px 0px 7px ${rgba(0, 0, 0, 0.5)}`,
        },

        "& $bottomBar": {
            marginTop: t.spacing.unit,
            color: t.palette.custom.dirty,
        },
    },

    icon: {},
    headingStrecher: {},
    progressPane: {},
    bottomBar: {},

}))




/**
 * `<Progress>` component.
 *
 * @function Progress
 * @returns {React.ReactElement}
 */
const Progress = ({
    className = string.empty(),
    progress,
    style = {},
}) => {
    const css = useStyles()

    return (
        <Paper
            className={classNames(className, css.content)}
            style={style}
        >

            <IconSettings className={css.icon} />
            <div className={css.headingStrecher}>
                <Typography component="p" variant="h5" align="center">
                    Please wait...
                </Typography>
            </div>

            <div className={css.progressPane}>
                <LinearProgress
                    variant="determinate"
                    color="primary"
                    value={Math.floor(100 * progress)}
                />
            </div>

            <Typography
                component="div"
                variant="body2"
                align="center"
                className={css.bottomBar}
            >
                crunching data: <b>{Math.floor(100 * progress)}%</b>
            </Typography>

        </Paper>
    )
}




// ...
Progress.propTypes = {
    progress: PropTypes.number.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}




// ...
export default func.compose(
    connect((s) => ({ progress: s.App.progress })),
    memo
)(Progress)
