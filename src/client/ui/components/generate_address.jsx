/**
 * Shambhala.
 *
 * Address generation view.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React, {
    memo,
    useState,
} from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import {
    func,
    math,
    string,
} from "@xcmats/js-toolbox"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import {
    basicReject,
    basicResolve,
} from "../thunks"
import { genMnemonic } from "@stellar-fox/redshift"
import { makeStyles } from "@material-ui/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import { rgba } from "../../../lib/utils"

import Avatar from "@material-ui/core/Avatar"
import Button from "@material-ui/core/Button"
import Chip from "@material-ui/core/Chip"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"




// ...
const useStyles = makeStyles((t) => ({

    content: {
        overflow: "hidden",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-evenly",
        ...t.mixins.gutters(),
        paddingTop: t.spacing.unit * 3,
        paddingBottom: t.spacing.unit * 3,

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

        "& $chips": {
            marginBottom: t.spacing.unit,
            textAlign: "center",
            "& $chipFrame": {
                display: "inline-block",
                padding: 2,
                margin: 0.5 * t.spacing.unit,
                "& $chip": { height: 3 * t.spacing.unit },
            },
        },

        "& $buttonBar": {
            display: "flex",
            marginTop: t.spacing.unit,
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

    headingStrecher: {},
    heading: {},
    chips: {},
    chipFrame: {},
    chip: {},
    buttonBar: {},
    button: {},
    disabled: {},
    yes: {},
    no: {},

}))




/**
 * `<GenerateAddress>` component.
 *
 * @function GenerateAddress
 * @returns {React.ReactElement}
 */
const GenerateAddress = ({
    basicReject,
    basicResolve,
    className = string.empty(),
    disabled,
    style = {},
}) => {
    const css = useStyles()

    // memonic (re-)generation logic

    // eslint-disable-next-line no-unused-vars
    let [mnemonic, setMnemonic] = useState(
        genMnemonic().split(string.space())
    )


    return (
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
                    Do you wish to generate a new address?
                </Typography>
            </div>

            <div className={css.chips}>
                { mnemonic.map((m, i) =>
                    <div key={m} className={css.chipFrame}>
                        <Chip
                            avatar={<Avatar>{math.inc(i)}</Avatar>}
                            label={m.toUpperCase()} color="primary"
                            classes={{ root: css.chip }}
                        />
                    </div>
                ) }
            </div>

            <div className={css.buttonBar}>
                <Button
                    className={classNames(css.button, css.yes)}
                    classes={{ disabled: css.disabled }}
                    variant="outlined"
                    disabled={disabled}
                    onClick={() => basicResolve()}
                >Yes</Button>
                <Button
                    className={classNames(css.button, css.no)}
                    classes={{ disabled: css.disabled }}
                    variant="outlined"
                    disabled={disabled}
                    onClick={() => basicReject("ui")}
                >No</Button>
            </div>

        </Paper>
    )
}




// ...
GenerateAddress.propTypes = {
    basicReject: PropTypes.func.isRequired,
    basicResolve: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}




// ...
export default func.compose(
    connect(
        (s) => ({
            disabled: s.App.promptMutexResolveValue === null,
        }),
        (dispatch) => bindActionCreators({
            basicReject,
            basicResolve,
        }, dispatch)
    ),
    memo
)(GenerateAddress)
