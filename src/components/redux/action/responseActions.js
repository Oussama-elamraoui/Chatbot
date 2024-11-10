// actions/responseActions.js

import { SET_RESPONSE } from './vid.js';

export const setResponse = (responseData) => ({
  type: SET_RESPONSE,
  payload: responseData
});