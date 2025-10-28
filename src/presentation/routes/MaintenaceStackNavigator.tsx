/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MaintenanceScreen } from '../screens/Debug/Maintenance/MaintenaceScreen';
import { StateViewScreen } from '../screens/Debug/stateView/stateViewScreen';
import { AWRStartScanningScreen } from './AWRStartScanningScreen';
import { AWRScanResultsScreen } from './AWRScanResultsScreen';
import { AWRReadScreen } from './AWRReadScreen';

// IMPORTA SIEMPRE DESDE screens/awr

const MaintenanceStack = createStackNavigator();

export const MaintenaceStackNavigator = () => (
   <MaintenanceStack.Navigator screenOptions={{ headerShown: false }}>
      <MaintenanceStack.Screen name="Maintenace" component={MaintenanceScreen} />
      <MaintenanceStack.Screen name="View State" component={StateViewScreen} />
      {/* <MaintenanceStack.Screen name="AWR-STARTSCAN" component={AWRStartScanningScreen} /> */}
      {/* <MaintenanceStack.Screen name="AWR-SCANRESULTS" component={AWRScanResultsScreen} /> */}
      <MaintenanceStack.Screen name="AWR-READ" component={AWRReadScreen} />
   </MaintenanceStack.Navigator>
);
