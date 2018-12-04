/**
 * Shambhala.
 *
 * Main frontend application component.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




import React from "react"
import PropTypes from "prop-types"
import { Provider } from "react-redux"

import { MuiThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"
import "typeface-roboto"

import Layout from "./layout"




/**
 * <ShambhalaUi> - 'root' component.
 *
 * @function ShambhalaUi
 * @param {Object} props (redux store, mui theme)
 * @returns {React.ReactElement}
 */
const ShambhalaUi = ({ store, theme }) =>
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Layout />
        </MuiThemeProvider>
    </Provider>




// ...
ShambhalaUi.propTypes = {
    store: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
}




// ...
export default ShambhalaUi
