/**
 * Shambhala.
 *
 * Associate address view.
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
    string,
} from "@xcmats/js-toolbox"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import {
    basicReject,
    basicResolve,
} from "../thunks"
import { iconizeMessage } from "../helpers"
import { makeStyles } from "@material-ui/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import { rgba } from "../../../lib/utils"

import Button from "@material-ui/core/Button"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"




// ...
const useStyles = makeStyles((t) => ({

    content: {
        overflow: "hidden",
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
                textShadow: `0px 0px 7px ${rgba(0, 0, 0, 0.5)}`,
            },
        },

        "& $buttonBar": {
            display: "flex",
            "& $button": {
                flexGrow: 1,
                marginLeft: 2 * t.spacing.unit,
                marginRight: 2 * t.spacing.unit,
                "&$disabled": { backgroundColor: "transparent !important" },
                "&$yes": {
                    backgroundColor: fade(
                        t.palette.custom.rallyGreen,
                        t.palette.action.hoverOpacity
                    ),
                    "&:hover": {
                        backgroundColor: fade(
                            t.palette.custom.rallyGreen,
                            3 * t.palette.action.hoverOpacity
                        ),
                    },
                },
                "&$no": {
                    backgroundColor: fade(
                        t.palette.custom.rallyRed,
                        t.palette.action.hoverOpacity
                    ),
                    "&:hover": {
                        backgroundColor: fade(
                            t.palette.custom.rallyRed,
                            3 * t.palette.action.hoverOpacity
                        ),
                    },
                },
            },
        },
    },

    icon: {},
    headingStrecher: {},
    heading: {},
    buttonBar: {},
    button: {},
    disabled: {},
    yes: {},
    no: {},

}))




/**
 * `<AssociateAddress>` component.
 *
 * @function AssociateAddress
 * @returns {React.ReactElement}
 */
const AssociateAddress = ({
    basicReject,
    basicResolve,
    className = string.empty(),
    enabled,
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
                component="h5"
                variant="h5"
                align="center"
                className={css.heading}
            >
                Do you wish to associate a new address?
            </Typography>
        </div>
        <div className={css.buttonBar}>
            <Button
                className={classNames(css.button, css.no)}
                classes={{ disabled: css.disabled }}
                variant="outlined"
                disabled={!enabled}
                onClick={() => basicReject("ui")}
            >No</Button>
            <Button
                className={classNames(css.button, css.yes)}
                classes={{ disabled: css.disabled }}
                variant="outlined"
                disabled={!enabled}
                onClick={() => basicResolve()}
            >Yes</Button>
        </div>
    </Paper>

)(useStyles())




// ...
AssociateAddress.propTypes = {
    basicReject: PropTypes.func.isRequired,
    basicResolve: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    icon: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}




// ...
export default func.compose(
    connect(
        (s) => ({
            enabled: s.App.promptMutexLocked,
            icon: func.partial(iconizeMessage)(
                array.head(s.App.throttledMessage)
            ),
        }),
        (dispatch) => bindActionCreators({
            basicReject,
            basicResolve,
        }, dispatch)
    ),
    memo
)(AssociateAddress)
