/**
 * Shambhala.
 *
 * Reducers.
 *
 * @module reducers
 * @license Apache-2.0
 */




import { createReducer } from "@xcmats/js-toolbox"




/**
 * Application initial state.
 *
 * @private
 * @constant {Object} initState
 */
const initState = {}




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
