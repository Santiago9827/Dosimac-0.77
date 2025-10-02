/* eslint-disable prettier/prettier */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AWRSavedListScreen } from './AWRSavedListScreen';
import { AWRReadScreen } from './AWRReadScreen';


const Stack = createStackNavigator();

export const AWRStackNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AWR-SAVED-LIST" component={AWRSavedListScreen} />
        <Stack.Screen name="AWR-READ" component={AWRReadScreen} />
    </Stack.Navigator>
);
