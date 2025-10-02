// screens/awr/AWRScanResultsScreen.tsx
import React from 'react';
import { View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export const AWRScanResultsScreen = ({ navigation }) => {
    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={navigation.goBack} />
                <Appbar.Content title="AWR300 – Resultados de escaneo" />
            </Appbar.Header>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>TODO: aquí irá el escaneo de AWR300</Text>
            </View>
        </View>
    );
};
