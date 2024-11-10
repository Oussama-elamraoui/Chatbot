import { combineReducers } from 'redux';
import authReducer from './auth';
import responseReducer from './responseReducer'
const rootReducer = combineReducers({
  auth: authReducer,
  dataEmotion:responseReducer
  // add other reducers as needed
});

export default rootReducer;