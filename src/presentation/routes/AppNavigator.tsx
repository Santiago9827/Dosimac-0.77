import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import TareasProgramadasScreen from './TareasProgramadasScreen';
import NoAlimentadosScreenMaternidad from './NoAlimentadosScreenMaternidad';

export type RootStackParamList = {
    Home: undefined;
    TareasProgramadas: undefined;
    NoAlimentadosMaternidad: undefined;
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

        </Stack.Navigator>
    );
}
