/* eslint-disable prettier/prettier */
import React from 'react';
import { View, FlatList } from 'react-native';
import { Appbar, List, Text } from 'react-native-paper';
import { awrStore } from '../../stores/awrStore'; // ajusta ruta
import * as ble from '../../device/ble/bleLibrary';

export const AWRSavedListScreen = ({ navigation }: any) => {
    const devices = awrStore(s => s.devices);

    const connectAndOpen = async (id: string, title: string) => {
        try { await ble.bleConnection(id); } catch { }
        navigation.navigate('AWR-READ' as never, { id, label: title } as never);
    };

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={navigation.goBack} />
                <Appbar.Content title="AWR escaneados" />
            </Appbar.Header>

            {devices.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <Text style={{ textAlign: 'center' }}>
                        No hay AWR guardados. Escanea uno desde “Prueba AWR300”.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={devices}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const title = item.name || item.label || item.id;
                        const desc = item.id;
                        return (
                            <List.Item
                                title={title}
                                description={desc}
                                left={props => <List.Icon {...props} icon="bluetooth" />}
                                onPress={() => connectAndOpen(item.id, title)}
                            />
                        );
                    }}
                />
            )}
        </View>
    );
};
