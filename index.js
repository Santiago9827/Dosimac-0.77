// /**
//  * @format
//  */

// import 'react-native-gesture-handler';
// import { AppRegistry } from 'react-native';
// import { App3 } from './src/App3';
// import { name as appName } from './app.json';
// import './src/localization/i18n';

// AppRegistry.registerComponent(appName, () => App3);
// registerRootComponent(App3);

import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';           // 👈 importa esto
import './src/localization/i18n';

// Si quieres, renombra App3 a App y haz export default.
// Aquí uso named import tal como lo tienes:
import { App3 } from './src/App3';

registerRootComponent(App3);                            // 👈 usa SOLO esto en web y nativo
