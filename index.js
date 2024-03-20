// Trying to see if using index ass m entrypint will solve my probmems
// am having with my app 


import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App'; // Import App.js
import {name as appName} from './app.json';


const Main = () => (
  <App />
);


AppRegistry.registerComponent(appName, () => Main);


export default Main;
