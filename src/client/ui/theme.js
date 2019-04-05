/**
 * Shambhala.
 *
 * Material UI theme.
 *
 * @module client-ui-theme
 * @license Apache-2.0
 */




import { createMuiTheme } from "@material-ui/core/styles"
import {
    rgb,
    rgba,
    string
} from "@xcmats/js-toolbox"




// color definitions
const
    darkGunmetal = rgb(29, 36, 46),
    onyx = rgb(44, 50, 60),
    dirty = rgba(115, 125, 112, 0.75),
    rallyGreen = rgb(30, 185, 128),
    rallyDarkGreen = rgb(4, 93, 86),
    rallyBrightGreen = rgb(0, 255, 185),
    rallyRed = rgb(199, 31, 19),
    rallyWhite = rgba(237, 242, 244, 0.85)




/**
 * Shambhala Material UI theme.
 *
 * @constant {Object} theme
 */
export const theme = createMuiTheme({

    palette: {

        custom: {
            darkGunmetal,
            onyx,
            dirty,
            rallyGreen,
            rallyDarkGreen,
            rallyBrightGreen,
            rallyRed,
            rallyWhite,
        },

        type: "dark",

        background: {
            default: darkGunmetal,
            paper: onyx,
        },

        primary: { main: rallyDarkGreen },

        secondary: { main: rallyRed },

        text: { primary: rallyWhite },

    },

    typography: {

        fontFamily: [
            "Roboto",
            "sans-serif",
        ].map((f) => string.quote(f)).join(", "),

        fontSize: 14,

        useNextVariants: true,

    },

})
