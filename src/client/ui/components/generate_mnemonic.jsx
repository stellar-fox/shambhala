/**
 * Shambhala.
 *
 * Mnemonic generation view.
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
import { action } from "../redux"
import { genMnemonic } from "@stellar-fox/redshift"
import { makeStyles } from "@material-ui/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import { rgba } from "../../../lib/utils"

import Avatar from "@material-ui/core/Avatar"
import Button from "@material-ui/core/Button"
import Chip from "@material-ui/core/Chip"
import IconReplay from "@material-ui/icons/Replay"
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
            "& $heading": {
                margin: "0 auto",
                marginBottom: t.spacing.unit,
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

        "& $fabBar": {
            marginBottom: t.spacing.unit,
            textAlign: "center",
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
    fabBar: {},
    buttonIcon: { marginRight: t.spacing.unit },
    buttonBar: {},
    button: {},
    disabled: {},
    yes: {},
    no: {},

}))




/**
 * `<GenerateMnemonic>` component.
 *
 * @function GenerateMnemonic
 * @returns {React.ReactElement}
 */
const GenerateMnemonic = ({
    basicReject,
    basicResolve,
    className = string.empty(),
    disabled,
    nextView,
    style = {},
}) => {
    const css = useStyles()

    // memonic (re-)generation logic
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
                    Mnemonic Generation
                </Typography>
                <Typography component="p" variant="body1" align="center">
                    Store the following words in a secure place.
                    Don't show them to anyone. Don't loose them.
                </Typography>
            </div>

            <div className={css.chips}>
                { mnemonic.map((m, i) =>
                    <div key={String(i) + m} className={css.chipFrame}>
                        <Chip
                            avatar={<Avatar>{math.inc(i)}</Avatar>}
                            label={m.toUpperCase()} color="primary"
                            classes={{ root: css.chip }}
                        />
                    </div>
                ) }
            </div>

            <div className={css.fabBar}>
                <Button
                    size="medium" variant="outlined"
                    onClick={() => setMnemonic(
                        genMnemonic().split(string.space())
                    )}
                >
                    <IconReplay className={css.buttonIcon} />
                    Draw new words
                </Button>
            </div>

            <div className={css.buttonBar}>
                <Button
                    className={classNames(css.button, css.no)}
                    classes={{ disabled: css.disabled }}
                    variant="outlined"
                    disabled={disabled}
                    onClick={() => basicReject("ui")}
                >Abort</Button>
                <Button
                    className={classNames(css.button, css.yes)}
                    classes={{ disabled: css.disabled }}
                    variant="outlined"
                    disabled={disabled}
                    onClick={() => {
                        basicResolve(mnemonic.join(string.space()))
                        nextView()
                    }}
                >Next</Button>
            </div>

        </Paper>
    )
}




// ...
GenerateMnemonic.propTypes = {
    basicReject: PropTypes.func.isRequired,
    basicResolve: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    nextView: PropTypes.func.isRequired,
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
            nextView: action.nextView,
        }, dispatch)
    ),
    memo
)(GenerateMnemonic)