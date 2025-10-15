// navigation/AnimalSearchNavigator.tsx (archivo aparte)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BuscarAnimalScreen from './BuscarAnimalScreen';
import AnimalDetalleScreen from './AnimalDetalleScreen';

// AnimalSearchNavigator.tsx
const Stack = createStackNavigator();
export function AnimalSearchNavigator() {
    return (
        <Stack.Navigator id="AnimalSearchRoot" initialRouteName="BuscarAnimal">
            <Stack.Screen name="BuscarAnimal" component={BuscarAnimalScreen} options={{ title: 'Buscar animal' }} />
            <Stack.Screen name="AnimalDetalle" component={AnimalDetalleScreen} options={{ title: 'Detalle del animal' }} />
        </Stack.Navigator>
    );
}
