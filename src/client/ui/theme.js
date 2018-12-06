/**
 * Shambhala.
 *
 * Material UI theme.
 *
 * @module client-ui-theme
 * @license Apache-2.0
 */




import { createMuiTheme } from "@material-ui/core/styles"




/**
 * Shambhala Material UI theme.
 *
 * @constant {Object} theme
 */
export const theme = createMuiTheme({

    palette: {

        background: {
            default: "rgb(29, 36, 46)",
            paper: "rgb(49, 55, 65)",
        },

        primary: { main: "rgb(39, 51, 119)" },

        secondary: { main: "rgb(219, 51, 39)" },

        text: { primary: "rgba(237, 242, 244, 0.85)" },

    },

    typography: { useNextVariants: true },

})
