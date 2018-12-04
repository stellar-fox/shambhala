/**
 * Shambhala.
 *
 * Main frontend application component.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React from "react"
import { Provider } from "react-redux"
import { MuiThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"

import "typeface-roboto"
import "../../index.css"

import Layout from "./layout"




/**
 * <ShambhalaUi> - 'root' component.
 *
 * @function ShambhalaUi
 * @param {Object} store redux store
 * @param {Object} theme mui theme
 * @returns {Function} (store, theme) => {React.ReactElement}
 */
export const ShambhalaUi = (store, theme) => () =>
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Layout />
        </MuiThemeProvider>
    </Provider>
