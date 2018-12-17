/**
 * Shambhala.
 *
 * Application layout.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React, {
    createRef,
    memo,
    useLayoutEffect,
    useState,
} from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { func } from "@xcmats/js-toolbox"

import { makeStyles } from "@material-ui/styles"
import AppBar from "@material-ui/core/AppBar"
import Grid from "@material-ui/core/Grid"
import SwipeableViews from "react-swipeable-views"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"

import { theme } from "../theme"
import {
    filterMessage,
    humanizeMessage,
    iconizeMessage,
} from "../helpers"
import GenericChoice from "./generic"
import Idle from "./idle"
import Info from "./info"

import * as message from "../../../lib/messages"




// ...
const
    noHeader = 345,
    noFooter = 380,
    maxMainHeight = 480,

    useStyles = makeStyles((t) => ({

        layout: {
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "hidden",

            "& $header": {
                [`@media (max-height: ${noHeader}px)`]: { display: "none" },
                "& $appBarCenterPane": {
                    flexGrow: 1,
                    paddingLeft: t.spacing.unit * 2,
                    paddingRight: t.spacing.unit * 2,
                },
            },

            "& $main": {
                maxHeight: maxMainHeight,
                display: "flex",
                justifyContent: "center",
                "& $slide": {
                    [`@media (max-height: ${noFooter}px)`]: {
                        marginTop: t.spacing.unit,
                        marginBotom: t.spacing.unit,
                    },
                    marginTop: 2 * t.spacing.unit,
                    marginBotom: 2 * t.spacing.unit,
                    marginLeft: "auto",
                    marginRight: "auto",
                    minWidth: 240,
                    maxWidth: 500,
                    padding: t.spacing.unit,
                },
            },

            "& $footer": {
                [`@media (max-height: ${noFooter}px)`]: { display: "none" },
                padding: t.spacing.unit,
                "& $text": {
                    color: "rgba(255, 255, 255, 0.25)",
                    textAlign: "center",
                },
                "& $heart": { color: "rgba(219, 51, 39, 0.75)" },
                "& $emoji": { color: "rgba(255, 255, 255, 0.75)" },
            },
        },

        header: {},
        appBarCenterPane: {},
        main: {},
        slide: {},
        footer: {},
        text: {},
        heart: {},
        emoji: {},

    }))




/**
 * `<Layout>` component.
 *
 * @function Layout
 * @returns {React.ReactElement}
 */
const Layout = ({
    currentMessage,
    humanMessage,
    icon,
    screenHeight,
    screenWidth,
    style = {},
}) => {
    const css = useStyles()

    // imperative ugliness just to obtain header height
    // and properly compute heights of `<main>` and its descendants
    let
        refToHeader = createRef(),
        customHeader = (props) => <header {...props} ref={refToHeader} />,
        [headerHeight, setHeaderHeight] = useState(0),
        mainHeight = () => Math.min(
            screenHeight - headerHeight - (
                screenHeight > noFooter ? 6 : 0
            ) * theme.spacing.unit,
            maxMainHeight
        ),
        slideHeight = () => mainHeight() - 2 * theme.spacing.unit,
        slideContentHeight = () => slideHeight() - 2 * theme.spacing.unit,
        slide = (Content) =>
            <Typography
                component="div"
                className={css.slide}
                style={{ height: slideHeight() }}
            >
                <Content style={{ height: slideContentHeight() }} />
            </Typography>

    // measure header height only if screen dimensions change;
    // if the height is changed then change `headerHeight` state and re-render
    useLayoutEffect(() => {
        let newHeight = refToHeader.current.getBoundingClientRect().height
        if (newHeight !== headerHeight) setHeaderHeight(newHeight)
    }, [screenHeight, screenWidth])


    return (
        <Grid
            container
            direction="column"
            justify="space-between"
            alignItems="stretch"
            className={css.layout}
            style={style}
        >

            <Grid item className={css.header}>
                <AppBar position="static" component={customHeader}>
                    <Toolbar>
                        <Typography variant="h6" color="inherit">
                            shambhala
                        </Typography>
                        <div className={css.appBarCenterPane}>{ icon() }</div>
                        <Typography
                            variant="subtitle2"
                            color="textSecondary"
                            align="right"
                        >
                            { humanMessage }
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Grid>

            <Grid item component="main" className={css.main}>
                <SwipeableViews
                    containerStyle={{
                        width: screenWidth - 2 * theme.spacing.unit,
                        height: mainHeight(),
                    }}
                    index={ func.choose(currentMessage, {
                        [message.ASSOCIATE_ADDRESS]: () => 2,
                        [message.BACKUP]: () => 0,
                        [message.GENERATE_ADDRESS]: () => 2,
                        [message.GENERATE_SIGNING_KEYS]: () => 2,
                        [message.RESTORE]: () => 0,
                        [message.SIGN_TRANSACTION]: () => 2,
                    }, () => 1) }
                >
                    { /* 0 */ slide(Info) }
                    { /* 1 */ slide(Idle) }
                    { /* 2 */ slide(GenericChoice) }
                </SwipeableViews>
            </Grid>

            <Grid item className={css.footer}>
                <Typography component="footer" className={css.text}>
                    Made with
                    &nbsp;<span
                        className={css.heart}
                        role="img" aria-label="love"
                    >❤</span>&nbsp;
                    on
                    &nbsp;<span
                        className={css.emoji}
                        role="img" aria-label="earth"
                    >🌍</span>&nbsp;
                    .
                </Typography>
            </Grid>

        </Grid>
    )
}




// ...
Layout.propTypes = {
    currentMessage: PropTypes.string.isRequired,
    humanMessage: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
    screenHeight: PropTypes.number.isRequired,
    screenWidth: PropTypes.number.isRequired,
    style: PropTypes.object,
}




// ...
export default func.compose(
    connect(
        (s) => ({
            currentMessage: filterMessage(s.App.throttledMessage),
            humanMessage: humanizeMessage(s.App.message),
            icon: func.partial(iconizeMessage)(s.App.message),
            screenHeight: s.App.dim.height,
            screenWidth: s.App.dim.width,
        })
    ),
    memo
)(Layout)
