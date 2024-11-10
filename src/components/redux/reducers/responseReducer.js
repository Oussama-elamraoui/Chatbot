// reducers/responseReducer.js

import { SET_RESPONSE } from '../action/vid.js';

const initialState = {
  responseData: null
};

const responseReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_RESPONSE:
      return {
        ...state,
        responseData: action.payload
      };
    default:
      return state;
  }
};

export default responseReducer;