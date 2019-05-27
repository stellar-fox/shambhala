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
    async,
    func,
    rgba,
    string,
} from "@xcmats/js-toolbox"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import {
    basicReject,
    basicResolve,
    setAccountId,
} from "../thunks"
import { makeStyles } from "@material-ui/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import { ASSOCIATE_ADDRESS } from "../../../lib/messages"

import Button from "@material-ui/core/Button"
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

        "& $headingStrecher": {
            marginBottom: t.spacing(1),
            "& $heading": {
                margin: "0 auto",
                marginBottom: t.spacing(2),
                color: t.palette.custom.rallyBrightGreen,
                display: "block",
                textShadow: `0px 0px 7px ${rgba(0, 0, 0, 0.5)}`,
            },
        },

        "& $txInspector": {
            display: "flex",
            overflowX: "hidden",
            overflowY: "auto",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: t.spacing(1),
            fontFamily: "Roboto Condensed",
            textAlign: "center",
            wordBreak: "break-all",
            color: t.palette.custom.rallyBrightGreen,
            textShadow: `0px 0px 7px ${
                fade(t.palette.custom.rallyBrightGreen, 0.5)
            }`,
            boxShadow: [
                `inset 0px 1px 5px 0px ${rgba(0, 0, 0, 0.2)}`,
                `inset 0px 2px 2px 0px ${rgba(0, 0, 0, 0.14)}`,
                `inset 0px 3px 1px -2px ${rgba(0, 0, 0, 0.12)}`,
            ].join(", "),
            backgroundColor: t.palette.custom.darkGunmetal,
            borderRadius: t.shape.borderRadius,
            padding: t.spacing(1),
        },

        "& $buttonBar": {
            display: "flex",
            "& $button": {
                flexGrow: 1,
                marginLeft: t.spacing(2),
                marginRight: t.spacing(2),
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

    headingStrecher: {},
    heading: {},
    txInspector: {},
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
    accountId,
    basicReject,
    basicResolve,
    className = string.empty(),
    enabled,
    setAccountId,
    style = {},
}) => ((css) =>

    <Paper
        className={classNames(className, css.content)}
        style={style}
    >
        <div className={css.headingStrecher}>
            <Typography
                component="h1"
                variant="h5"
                align="center"
                className={css.heading}
            >
                Do you wish to associate this address?
            </Typography>
            <Typography component="p" variant="body1" align="center">
                Address association will allow you to sign transactions
                with your new shambhala keys using this device and your PIN.
            </Typography>
        </div>

        <div className={css.txInspector}>
            <div>{ array.take(14)(accountId) }</div>
            <div>{ array.take(14)(array.drop(14)(accountId)) }</div>
            <div>{ array.take(14)(array.drop(28)(accountId)) }</div>
            <div>{ array.takeLast(14)(accountId) }</div>
        </div>

        <div className={css.buttonBar}>
            <Button
                className={classNames(css.button, css.no)}
                classes={{ disabled: css.disabled }}
                variant="outlined"
                disabled={!enabled}
                onClick={() => {
                    async.timeout(() => setAccountId(string.empty()))
                    basicReject("ui")
                }}
            >No</Button>
            <Button
                className={classNames(css.button, css.yes)}
                classes={{ disabled: css.disabled }}
                variant="outlined"
                disabled={!enabled}
                onClick={() => {
                    async.timeout(() => setAccountId(string.empty()))
                    basicResolve()
                }}
            >Yes</Button>
        </div>
    </Paper>

)(useStyles())




// ...
AssociateAddress.propTypes = {
    accountId: PropTypes.string.isRequired,
    basicReject: PropTypes.func.isRequired,
    basicResolve: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    setAccountId: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}




// ...
export default func.compose(
    connect(
        (s) => ({
            accountId: s.App.accountId,
            enabled:
                s.App.promptMutexLocked  &&
                array.head(s.App.message) === ASSOCIATE_ADDRESS  &&
                s.App.viewNumber === 1,
        }),
        (dispatch) => bindActionCreators({
            setAccountId,
            basicReject,
            basicResolve,
        }, dispatch)
    ),
    memo
)(AssociateAddress)
