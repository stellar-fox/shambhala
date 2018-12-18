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
import {
    array,
    func,
} from "@xcmats/js-toolbox"
import { makeStyles } from "@material-ui/styles"
import { theme } from "../theme"
import { rgba } from "../../../lib/utils"
import {
    filterMessage,
    humanizeMessage,
    iconizeMessage,
} from "../helpers"
import * as message from "../../../lib/messages"

import AppBar from "@material-ui/core/AppBar"
import GenerateAddress from "./generate_address"
import GenericChoice from "./generic"
import Grid from "@material-ui/core/Grid"
import Idle from "./idle"
import Info from "./info"
import SwipeableViews from "react-swipeable-views"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"




// ...
const
    noHeader = 345,
    noFooter = 380,
    maxMainHeight = 638,

    footerHeight = theme.typography.fontSize + 3 * theme.spacing.unit,

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
                    marginTop: t.spacing.unit,
                    marginBotom: t.spacing.unit,
                    marginLeft: "auto",
                    marginRight: "auto",
                    minWidth: 240,
                    maxWidth: 500,
                    padding: t.spacing.unit,
                },
            },

            "& $footer": {
                [`@media (max-height: ${noFooter}px)`]: { display: "none" },
                background: rgba(0, 0, 0, 0.2),
                boxShadow: [
                    `0px 0px 4px 0px ${rgba(0, 0, 0, 0.5)}`,
                    `0px 0px 12px 0px ${rgba(0, 0, 0, 0.4)}`,
                ].join(", "),
                padding: 0.5 * t.spacing.unit,
                "& $text": {
                    color: rgba(255, 255, 255, 0.25),
                    textAlign: "center",
                },
                "& $heart": { color: t.palette.custom.rallyRed },
                "& $emoji": { color: rgba(255, 255, 255, 0.75) },
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
                screenHeight > noFooter  ?  footerHeight  :  0
            ),
            maxMainHeight
        ),
        slideHeight = () => mainHeight() - 2 * theme.spacing.unit,
        slideContentHeight = () => slideHeight() - 2 * theme.spacing.unit,
        slide = (Content, key) =>
            <Typography
                key={key}
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


    // some stateful logic for swipes
    let
        [displayed, setDisplayed] = useState([currentMessage]),
        messageToComponent = func.partial(
            func.rearg(func.choose)(1, 2, 0, 3)
        )({
            [message.ASSOCIATE_ADDRESS]: () => GenericChoice,
            [message.BACKUP]: () => Info,
            [message.GENERATE_ADDRESS]: () => GenerateAddress,
            [message.GENERATE_SIGNING_KEYS]: () => GenericChoice,
            [message.RESTORE]: () => Info,
            [message.SIGN_TRANSACTION]: () => GenericChoice,
        }, () => Idle)

    // if there is a change in the message then we should animate
    if (currentMessage !== array.head(displayed)) {
        setDisplayed([currentMessage, array.head(displayed)])
    }


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
                    disabled={true}
                    index={displayed.length - 1}
                    onTransitionEnd={() => setDisplayed([currentMessage])}
                >
                    { displayed
                        .map((d) => slide(messageToComponent(d), d))
                        .reverse() }
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
            currentMessage: filterMessage(array.head(s.App.throttledMessage)),
            humanMessage: humanizeMessage(array.head(s.App.message)),
            icon: func.partial(iconizeMessage)(array.head(s.App.message)),
            screenHeight: s.App.dim.height,
            screenWidth: s.App.dim.width,
        })
    ),
    memo
)(Layout)
