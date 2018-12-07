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

    // last info message coming from logger/uiLogger
    infoMessage: string.empty(),

    // a message that is currently being processed (src/lib/messages.js)
    message: null,

    // how to resolve mutex if user provided no value? (DEV. PROTO.)
    promptMutexResolveValue: null,

}




// action types
const
    SET_STATE = "Shambhala/SET_STATE",
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
    [RESET_STATE]: () => initState,

})




// shape of the children at level 1 of redux tree
export default { App }
