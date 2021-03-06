/**
 * Shambhala.
 *
 * Info screen.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React, { memo } from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import {
    array,
    func,
    rgba,
    string,
} from "@xcmats/js-toolbox"
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
        paddingTop: t.spacing(3),
        paddingBottom: t.spacing(3),

        "& $icon": {
            display: "block",
            margin: "0 auto",
            fontSize: 64,
            color: t.palette.custom.rallyBrightGreen,
            filter: `drop-shadow(0px 0px 5px ${rgba(0, 0, 0, 0.5)})`,
            marginBottom: t.spacing(1),
        },

        "& $headingStrecher": {
            marginBottom: t.spacing(1),
            minHeight: 80,
            display: "flex",
            direction: "column",
            alignItems: "center",
            "& $heading": {
                margin: "0 auto",
                display: "block",
                textShadow: `0px 0px 7px ${rgba(0, 0, 0, 0.5)}`,
            },
        },
    },

    icon: {},
    headingStrecher: {},
    heading: {},

}))




/**
 * `<Info>` component.
 *
 * @function Info
 * @returns {React.ReactElement}
 */
const Info = ({
    className = string.empty(),
    humanMessage,
    icon,
    style = {},
}) => ((css) =>

    <Paper
        className={classNames(className, css.content)}
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
            Sit tight. Some important stuff is happening right now.
        </Typography>
    </Paper>

)(useStyles())




// ...
Info.propTypes = {
    humanMessage: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}




// ...
export default () => {
    const lock = func.locker()
    return func.compose(
        connect(
            (s) => ({
                humanMessage: humanizeMessage(
                    lock(array.head(s.App.throttledMessage))
                ),
                icon: func.partial(iconizeMessage)(
                    lock(array.head(s.App.throttledMessage))
                ),
            })
        ),
        memo
    )(Info)
}
