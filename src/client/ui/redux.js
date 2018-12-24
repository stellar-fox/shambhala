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
    math,
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
    // `head(message)` is the current message,
    // while `last(mesage)` is the previous message,
    message: [null, null],

    // throttled version of message that is currently being processed
    throttledMessage: [null, null],

    // some messages has multiple corresponding ui views needed
    // for an user interaction - this variable holds a current view number
    //
    // current view number has to be "in sync" with `throttledMessage`,
    // as on its basis layout is changing views, so `viewNumber` is being
    // reset to `1` inside `setMessage` thunk when `throttledMessage` is
    // being changed
    viewNumber: 1,

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
    SET_VIEW = "Shambhala/SET_VIEW",
    NEXT_VIEW = "Shambhala/NEXT_VIEW",
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
    setView: (viewNumber) => ({
        type: SET_VIEW,
        viewNumber,
    }),


    // ...
    nextView: () => ({ type: NEXT_VIEW }),


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
    [SET_VIEW]: (state, action) => ({
        ...state,
        viewNumber: action.viewNumber,
    }),


    // ...
    [NEXT_VIEW]: (state) => ({
        ...state,
        viewNumber: math.inc(state.viewNumber),
    }),


    // ...
    [RESET_STATE]: () => initState,

})




// shape of the children at level 1 of redux tree
export default { App }
