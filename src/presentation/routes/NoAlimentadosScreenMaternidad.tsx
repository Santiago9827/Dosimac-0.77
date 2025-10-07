import React from 'react';
import { View, Text, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Animal = { id: string; corral: string; nota?: string };

export default function NoAlimentadosScreenMaternidad() {
    // Demo: sustituye por tus datos reales
    const data: Animal[] = [
        { id: 'A-1023', corral: 'C-12', nota: '8h sin registro' },
        { id: 'A-1048', corral: 'C-12' },
        { id: 'A-2011', corral: 'C-05' },
        { id: 'A-2110', corral: 'C-05', nota: 'pendiente revisión' },
    ];

    const Item = ({ item }: { item: Animal }) => (
        <View className="rounded-2xl p-4 bg-white border border-slate-200 mb-3">
            <View className="flex-row items-center justify-between">
                <Text className="text-slate-900 font-semibold">{item.id}</Text>
                <Text className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                    Corral {item.corral}
                </Text>
            </View>
            {item.nota ? <Text className="mt-1 text-slate-600">{item.nota}</Text> : null}
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <View className="px-5 pt-4 pb-2 flex-row items-center">
                <Ionicons name="alert-circle-outline" size={20} color="#0f172a" />
                <Text className="ml-2 text-slate-900 text-[18px] font-extrabold">
                    No alimentados · Maternidad
                </Text>
            </View>

            <FlatList
                className="px-5 pt-2"
                data={data}
                keyExtractor={(it) => it.id}
                renderItem={Item}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
