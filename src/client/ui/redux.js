/**
 * Shambhala.
 *
 * Reducers.
 *
 * @module client-ui-reducers
 * @license Apache-2.0
 */




import {
    createReducer,
    string,
} from "@xcmats/js-toolbox"




/**
 * Application initial state.
 *
 * @private
 * @constant {Object} initState
 */
const initState = {

    // is whole application ready ?
    ready: false,

    // should the application loader be shown ?
    showLoader: true,

    // can the application UI be shown ?
    showUi: false,

    // last info message coming from logger/uiLogger
    infoMessage: string.empty(),

    // a message that is currently being processed (src/lib/messages.js)
    message: null,

    // throttled version of message that is currently being processed
    throttledMessage: null,

    // window dimensions
    dim: {
        width: window.innerWidth,
        height: window.innerHeight,
    },

    // how to resolve mutex if user provided no value? (DEV. PROTO.)
    promptMutexResolveValue: null,

}




// action types
const
    SET_STATE = "Shambhala/SET_STATE",
    SET_DIMENSIONS = "Shambhala/SET_DIMENSIONS",
    RESET_STATE = "Shambhala/RESET_STATE"




/**
 * Actions.
 *
 * @constant {Object} action
 */
export const action = {

    // ...
    setState: (state) => ({
        type: SET_STATE,
        state,
    }),


    // ...
    setDimensions: () => ({
        type: SET_DIMENSIONS,
        dim: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
    }),


    // ...
    resetState: () => ({ type: RESET_STATE }),

}




/**
 * Main application reducer.
 *
 * @function App
 */
export const App = createReducer(initState)({

    // ...
    [SET_STATE]: (state, action) => ({
        ...state,
        ...action.state,
    }),


    // ...
    [SET_DIMENSIONS]: (state, action) => ({
        ...state,
        dim: { ...action.dim },
    }),


    // ...
    [RESET_STATE]: () => initState,

})




// shape of the children at level 1 of redux tree
export default { App }
