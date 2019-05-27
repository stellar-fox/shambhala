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
    Fragment,
    memo,
    useLayoutEffect,
    useState,
} from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import {
    array,
    func,
    rgba,
    string,
} from "@xcmats/js-toolbox"
import classNames from "classnames"
import { makeStyles } from "@material-ui/styles"
import { theme } from "../theme"
import {
    filterMessage,
    humanizeMessage,
    iconizeMessage,
    messageToView,
} from "../helpers"
import { snackPersistenceDuration } from "../../../config/frontend"

import AppBar from "@material-ui/core/AppBar"
import Grid from "@material-ui/core/Grid"
import IconError from "@material-ui/icons/Error"
import IconSuccess from "@material-ui/icons/CheckCircle"
import Snackbar from "@material-ui/core/Snackbar"
import SnackbarContent from "@material-ui/core/SnackbarContent"
import SwipeableViews from "react-swipeable-views"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"




// ...
const
    noHeader = 345,
    noFooter = 380,
    maxMainHeight = 638,

    footerHeight = theme.typography.fontSize + theme.spacing(3),

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
                    paddingLeft: t.spacing(2),
                    paddingRight: t.spacing(2),
                },
            },

            "& $main": {
                maxHeight: maxMainHeight,
                display: "flex",
                justifyContent: "center",
                "& $slide": {
                    marginTop: t.spacing(1),
                    marginBotom: t.spacing(1),
                    marginLeft: "auto",
                    marginRight: "auto",
                    minWidth: 240,
                    maxWidth: 500,
                    padding: t.spacing(1),
                },
            },

            "& $footer": {
                [`@media (max-height: ${noFooter}px)`]: { display: "none" },
                background: rgba(0, 0, 0, 0.2),
                boxShadow: [
                    `0px 0px 4px 0px ${rgba(0, 0, 0, 0.5)}`,
                    `0px 0px 12px 0px ${rgba(0, 0, 0, 0.4)}`,
                ].join(", "),
                padding: t.spacing(0.5),
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

        statusSnack: {
            left: "50%",
            right: "auto",
            transform: "translateX(-50%)",
        },
        statusSnackContent: {
            marginBottom: t.spacing(2),
            minWidth: 288,
            borderRadius: t.shape.borderRadius,
        },
        statusError: {
            backgroundColor: t.palette.error.dark,
            color: t.palette.error.contrastText,
        },
        statusSuccess: {
            backgroundColor: t.palette.primary.main,
            color: t.palette.primary.contrastText,
        },
        statusSnackMessage: {
            display: "flex",
            alignItems: "center",
        },
        statusSnackIcon: {
            fontSize: 20,
            opacity: 0.9,
            marginRight: t.spacing(1),
        },

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
    showStatusMessage,
    statusMessage,
    statusType,
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
        slideHeight = () => mainHeight() - theme.spacing(2),
        slideContentHeight = () => slideHeight() - theme.spacing(2),
        slide = (Content, key) =>
            <Typography
                key={key}
                component="div"
                className={css.slide}
                style={{ height: slideHeight() }}
            >
                <div style={{ height: slideContentHeight() }}>
                    <Content style={{ minHeight: slideContentHeight() }} />
                </div>
            </Typography>

    // measure header height only if screen dimensions change;
    // if the height is changed then change `headerHeight` state and re-render
    useLayoutEffect(() => {
        let newHeight = refToHeader.current.getBoundingClientRect().height
        if (newHeight !== headerHeight) setHeaderHeight(newHeight)
    }, [screenHeight, screenWidth])


    // some stateful logic for swipes
    let [displayed, setDisplayed] = useState([currentMessage])

    // if there is a change in the message then we should animate
    if (currentMessage !== array.head(displayed)) {
        setDisplayed([currentMessage, array.head(displayed)])
    }


    return (
        <Fragment>

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
                            <div className={css.appBarCenterPane}>
                                { icon() }
                            </div>
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
                            width: screenWidth - theme.spacing(2),
                            height: mainHeight(),
                        }}
                        disabled={true}
                        index={displayed.length - 1}
                        onTransitionEnd={() => setDisplayed([currentMessage])}
                    >
                        { displayed
                            .map((d) => slide(messageToView(d), d))
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

            <Snackbar
                className={css.statusSnack}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                open={showStatusMessage}
                autoHideDuration={snackPersistenceDuration}
            >
                <SnackbarContent
                    className={classNames(
                        statusType === "success" ?
                            css.statusSuccess : css.statusError,
                        css.statusSnackContent
                    )}
                    message={
                        <span className={css.statusSnackMessage}>
                            { statusType === "success" ?
                                <IconSuccess
                                    className={css.statusSnackIcon}
                                /> :
                                <IconError
                                    className={css.statusSnackIcon}
                                /> }
                            { statusMessage }
                        </span>
                    }
                />
            </Snackbar>

        </Fragment>
    )
}




// ...
Layout.propTypes = {
    currentMessage: PropTypes.string.isRequired,
    humanMessage: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
    screenHeight: PropTypes.number.isRequired,
    screenWidth: PropTypes.number.isRequired,
    showStatusMessage: PropTypes.bool.isRequired,
    statusMessage: PropTypes.string.isRequired,
    statusType: PropTypes.string.isRequired,
    style: PropTypes.object,
}




// ...
export default func.compose(
    connect(
        (s) => ({
            // `currentMessage` is a `throttledMessage` + `viewNumber`;
            // it's a basis for all view changes (layout "swipes")
            currentMessage: [
                filterMessage(array.head(s.App.throttledMessage)),
                ".", string.padLeft(String(s.App.viewNumber), 2, "0"),
            ].join(string.empty()),

            // just a text for user saying what's going on
            humanMessage: humanizeMessage(array.head(s.App.message)),

            // icon representing current task
            icon: func.partial(iconizeMessage)(array.head(s.App.message)),

            // screen dimensions
            screenHeight: s.App.dim.height,
            screenWidth: s.App.dim.width,

            // last status message (error/success)
            statusMessage: s.App.status.message,
            statusType: s.App.status.type,
            showStatusMessage: s.App.status.show,
        })
    ),
    memo
)(Layout)
