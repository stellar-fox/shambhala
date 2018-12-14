/**
 * Shambhala.
 *
 * Idle screen.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import { func } from "@xcmats/js-toolbox"

import { connect } from "react-redux"
import {
    humanizeMessage,
    iconizeMessage,
} from "../helpers"

import { makeStyles } from "@material-ui/styles"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"




// ...
const useStyles = makeStyles((t) => ({

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
                margin: "0 auto",
                display: "block",
                textShadow: "0px 0px 7px rgba(0, 0, 0, 0.5)",
            },

        },

    },

    icon: {},
    headingStrecher: {},
    heading: {},

}))




/**
 * `<Idle>` component.
 *
 * @function Idle
 * @returns {React.ReactElement}
 */
const Idle = ({
    humanMessage,
    icon,
    outerStyleClassName,
    style = {},
}) => ((css) =>

    <Paper
        className={classNames(outerStyleClassName, css.content)}
        style={style}
    >
        { icon([{ className: css.icon }]) }
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
        <Typography component="p" variant="body1" align="center">
            Oh hai! You look beautiful today.
        </Typography>
    </Paper>

)(useStyles())




// ...
Idle.propTypes = {
    humanMessage: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
    outerStyleClassName: PropTypes.string.isRequired,
}




// ...
export default connect(
    (s) => ({
        humanMessage: humanizeMessage(s.App.message),
        icon: func.partial(iconizeMessage)(s.App.message),
    })
)(Idle)
