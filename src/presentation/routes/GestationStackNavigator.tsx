/* eslint-disable prettier/prettier */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { GestationScreen } from '../screens/Gestation/Gestation';
import NoAlimentadosGestacion from '../screens/Gestation/NoAlimentadosGestacion';
import CorralTablaScreen from './CorralTablaScreen';
import CorralGridScreen from './CorralGridScreen';
import CorralDetalleScreen from './corralDetalleScreen';

export type GestationStackParamList = {
    'GES-HOME': undefined;
    'GES-NOFEED': undefined;
    'GES-CORRAL': undefined;
    'GES-CORRALPC': undefined;
    'GES-CORRAL-DETALLE': { corralId: string };
};

const Stack = createStackNavigator<GestationStackParamList>();

export const GestationStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: true, headerStyle: { elevation: 5 } }}>
            <Stack.Screen
                name="GES-HOME"
                component={GestationScreen}
                options={{ title: 'Gestación', headerShown: false }}
            />
            <Stack.Screen
                name="GES-NOFEED"
                component={NoAlimentadosGestacion}
                options={{ title: 'No alimentados · Gestación', headerShown: true }}
            />
            {/* <Stack.Screen
                name="GES-CORRAL"
                component={CorralTablaScreen}
                options={{ title: 'Corrales' }}
            /> */}
            <Stack.Screen
                name="GES-CORRALPC"
                component={CorralGridScreen}
                options={{ title: 'Corrales' }}
            />

            <Stack.Screen
                name="GES-CORRAL-DETALLE"
                component={CorralDetalleScreen}
                options={{ headerShown: false }} // usamos el header custom del detalle
            />

        </Stack.Navigator>
    );
};
