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
export default createMuiTheme({

    palette: {

        background: {
            default: "rgb(29, 36, 46)",
            paper: "rgb(49, 55, 65)",
        },

        text: {
            primary: "rgba(237, 242, 244, 0.87)",
        },

    },

    typography: {
        useNextVariants: true,
    },

})
