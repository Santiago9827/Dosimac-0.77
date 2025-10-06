// TareasProgramadasScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Tarea = {
    id: string | number;
    corral: string;
    asignadoA: string;
    descripcion: string;
    done?: boolean;
};

useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}, []);

const DoneCircle = ({ done, onPress }: { done?: boolean; onPress: () => void }) => (
    <Pressable
        onPress={onPress}
        className="w-7 h-7 rounded-full items-center justify-center"
        style={{
            borderWidth: 2,
            borderColor: done ? '#22c55e' : '#cbd5e1', // slate-300
            backgroundColor: done ? '#22c55e' : 'transparent',
        }}
    >
        {done ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
    </Pressable>
);

const TaskCard = ({
    tarea,
    onToggleDone,
}: {
    tarea: Tarea;
    onToggleDone: (id: Tarea['id']) => void;
}) => {
    return (
        <View className="bg-white rounded-2xl border border-slate-200 mb-4 shadow-sm overflow-hidden">
            <View className="p-4">
                {/* Fila superior: Corral + chip + círculo estado */}
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <Ionicons name="home-outline" size={18} color="#0f172a" />
                        <Text className="ml-2 text-slate-700">Corral</Text>
                    </View>

                    <View className="flex-row items-center">
                        <View className="px-3 py-1 rounded-full bg-slate-100 mr-3">
                            <Text className="text-slate-700 font-semibold">{tarea.corral}</Text>
                        </View>
                        <DoneCircle done={tarea.done} onPress={() => onToggleDone(tarea.id)} />
                    </View>
                </View>

                {/* Asignado a */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="person-circle-outline" size={18} color="#475569" />
                        <Text className="ml-2 text-slate-700">Asignado a</Text>
                    </View>
                    <Text className="text-slate-900 font-medium">{tarea.asignadoA}</Text>
                </View>

                <View className="h-px bg-slate-200 my-3" />

                {/* Descripción */}
                <View className="flex-row items-start">
                    <Ionicons name="clipboard-outline" size={18} color="#475569" style={{ marginTop: 2 }} />
                    <Text
                        className="ml-2 text-slate-800 leading-5"
                        style={tarea.done ? { opacity: 0.7 } : undefined} // si quieres, añade line-through
                    >
                        {tarea.descripcion}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default function TareasProgramadasScreen() {
    const [tareas, setTareas] = useState<Tarea[]>([
        { id: 1, corral: 'C-12', asignadoA: 'Juan Pérez', descripcion: 'Revisar bebederos y limpiar filtro.', done: false },
        { id: 2, corral: 'G-03', asignadoA: 'Ana Gómez', descripcion: 'Desbloquear compuerta de comedero.', done: false },
        { id: 3, corral: 'C-05', asignadoA: 'Luis Mateo', descripcion: 'Comprobar cierres y engrase de bisagras.', done: true },
    ]);
    const sortedTareas = useMemo(() => {
        const pendientes = tareas.filter(t => !t.done);
        const hechas = tareas.filter(t => t.done);
        return [...pendientes, ...hechas];
    }, [tareas]);

    const toggleDone = (id: Tarea['id']) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // animación de reorden
        setTareas(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
    };


    return (
        <View className="flex-1 bg-slate-50">
            <View className="px-5 pt-4 pb-2 flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#0f172a" />
                <Text className="ml-2 text-xl font-bold text-slate-900">Tareas Programadas</Text>
                <View className="ml-2 px-2 py-0.5 rounded-full bg-slate-200/70">
                    <Text className="text-xs text-slate-700">{tareas.length}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
                {sortedTareas.map(t => (
                    <TaskCard key={t.id} tarea={t} onToggleDone={toggleDone} />
                ))}
            </ScrollView>
        </View>
    );
}
