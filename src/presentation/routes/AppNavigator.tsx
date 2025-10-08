import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import TareasProgramadasScreen from './TareasProgramadasScreen';
import NoAlimentadosScreenMaternidad from './NoAlimentadosScreenMaternidad';
import CorralScreen from './CorralScreen';
import NoAlimentadosGestacion from '../screens/Gestation/NoAlimentadosGestacion';

export type RootStackParamList = {
    Home: undefined;
    TareasProgramadas: undefined;
    NoAlimentadosMaternidad: undefined;
    Corral: undefined;
    NoAlimentadosGestacion: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Stack.Screen name="TareasProgramadas" component={TareasProgramadasScreen} options={{ title: 'Tareas Programadas' }} />
            <Stack.Screen
                name="NoAlimentadosMaternidad"
                component={NoAlimentadosScreenMaternidad}
                options={{ headerShown: false }}
            />
            {/* <Stack.Screen name="Corral" component={CorralScreen} /> */}

            <Stack.Screen
                name="NoAlimentadosGestacion"
                component={NoAlimentadosGestacion}
                options={{ headerShown: false }}
            />

        </Stack.Navigator>
    );
}
