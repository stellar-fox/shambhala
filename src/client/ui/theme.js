/**
 * Shambhala.
 *
 * Material UI theme.
 *
 * @module client-ui-theme
 * @license Apache-2.0
 */




import { createMuiTheme } from "@material-ui/core/styles"
import { rgb, rgba } from "../../lib/utils"




// color definitions
const
    darkGunmetal = rgb(29, 36, 46),
    onyx = rgb(44, 50, 60),
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

    typography: { useNextVariants: true },

})
