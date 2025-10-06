import React from 'react';
import { View, Text, ScrollView } from 'react-native';

type Tarea = {
    id: string | number;
    corral: string | number;
    asignadoA: string;
    descripcion: string;
};

export default function TareasProgramadasScreen() {
    // Ejemplo de datos
    const tareas: Tarea[] = [
        { id: 1, corral: 'C-12', asignadoA: 'Juan Pérez', descripcion: 'Revisar bebederos y limpiar filtro.' },
        { id: 2, corral: 'G-03', asignadoA: 'Ana Gómez', descripcion: 'Desbloquear compuerta de comedero.' },
        { id: 3, corral: 'C-05', asignadoA: 'Luis Mateo', descripcion: 'Comprobar cierres y engrase de bisagras.' },
    ];

    const Row = ({ label, value }: { label: string; value: string | number }) => (
        <View className="flex-row justify-between mt-1">
            <Text className="text-slate-600">{label}</Text>
            <Text className="text-slate-900 font-medium">{value}</Text>
        </View>
    );

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20 }}>
            <Text className="text-slate-900 text-xl font-semibold mb-3">Tareas Programadas</Text>

            {tareas.map(t => (
                <View key={t.id} className="bg-white rounded-2xl border border-slate-200 p-4 mb-3 shadow-sm">
                    <Row label="Corral" value={t.corral} />
                    <Row label="Asignado a" value={t.asignadoA} />
                    <View className="h-px bg-slate-200 my-2" />
                    <Text className="text-slate-800">{t.descripcion}</Text>
                </View>
            ))}
        </ScrollView>
    );
}
