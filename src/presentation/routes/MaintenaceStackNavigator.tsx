/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MaintenanceScreen } from '../screens/Debug/Maintenance/MaintenaceScreen';
import { StateViewScreen } from '../screens/Debug/stateView/stateViewScreen';
import { AWRStartScanningScreen } from './AWRStartScanningScreen';
import { AWRScanResultsScreen } from './AWRScanResultsScreen';

// NUEVO: importa las pantallas de AWR

const MaintenanceStack = createStackNavigator();

export const MaintenaceStackNavigator = () => {
   return (
      <MaintenanceStack.Navigator
         screenOptions={{
            headerShown: false,
            headerStyle: { elevation: 5 },
         }}
      >
         {/* Home de mantenimiento */}
         <MaintenanceStack.Screen name="Maintenace" component={MaintenanceScreen} />
         <MaintenanceStack.Screen name="View State" component={StateViewScreen} />

         {/* NUEVO: flujo de pruebas AWR300 */}
         <MaintenanceStack.Screen name="AWR-STARTSCAN" component={AWRStartScanningScreen} />
         <MaintenanceStack.Screen name="AWR-SCANRESULTS" component={AWRScanResultsScreen} />
      </MaintenanceStack.Navigator>
   );
};
