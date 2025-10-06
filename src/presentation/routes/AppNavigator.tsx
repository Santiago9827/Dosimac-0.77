import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import TareasProgramadasScreen from './TareasProgramadasScreen';

export type RootStackParamList = {
    Home: undefined;
    TareasProgramadas: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Stack.Screen name="TareasProgramadas" component={TareasProgramadasScreen} options={{ title: 'Tareas Programadas' }} />
        </Stack.Navigator>
    );
}
