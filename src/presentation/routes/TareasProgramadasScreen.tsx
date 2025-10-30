// TareasProgramadasScreen.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    LayoutAnimation,
    Platform,
    UIManager,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Alert,
    Dimensions,
    findNodeHandle,
    FlatList,
    useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Tarea = {
    id: string | number;
    corral: string;
    asignadoA: string;
    descripcion: string;
    done?: boolean;
};

type AnchorRect = { x: number; y: number; width: number; height: number };

const DoneCircle = ({ done, onPress }: { done?: boolean; onPress: () => void }) => (
    <Pressable
        onPress={onPress}
        className="w-7 h-7 rounded-full items-center justify-center"
        style={{
            borderWidth: 2,
            borderColor: done ? '#22c55e' : '#cbd5e1',
            backgroundColor: done ? '#22c55e' : 'transparent',
        }}
        android_ripple={{ color: '#e5e7eb' }}
    >
        {done ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
    </Pressable>
);

const TaskCard = ({
    tarea,
    onToggleDone,
    onMore,
}: {
    tarea: Tarea;
    onToggleDone: (id: Tarea['id']) => void;
    onMore: (tarea: Tarea, anchor: AnchorRect) => void;
}) => {
    const kebabRef = useRef<View>(null);

    const openAnchoredMenu = () => {
        kebabRef.current?.measureInWindow((x, y, width, height) => {
            onMore(tarea, { x, y, width, height });
        });
    };

    return (
        <Pressable
            onLongPress={openAnchoredMenu}
            className="bg-white rounded-2xl border border-slate-200 mb-4 shadow-sm overflow-hidden"
            android_ripple={{ color: '#f1f5f9' }}
        >
            <View className="p-4">
                {/* Fila superior */}
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

                        {/* ⋮ ancla del menú */}
                        <Pressable
                            onLongPress={openAnchoredMenu}
                            android_ripple={{ color: '#f1f5f9' }}
                            style={{
                                flex: 1,                        // 👈 llena el ancho de su columna
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: '#E2E8F0',
                                marginBottom: 16,
                                shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
                                shadowOffset: { width: 0, height: 3 }, elevation: 1,
                            }}
                        >
                            <View style={{ padding: 16 }}>
                                <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 }} />
                            </View>
                        </Pressable>

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
                    <Text className="ml-2 text-slate-800 leading-5" style={tarea.done ? { opacity: 0.7 } : undefined}>
                        {tarea.descripcion}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

export default function TareasProgramadasScreen() {
    // LayoutAnimation en Android
    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const [tareas, setTareas] = useState<Tarea[]>([
        { id: 1, corral: '12', asignadoA: 'Juan Pérez', descripcion: 'Revisar bebederos y limpiar filtro.', done: false },
        { id: 2, corral: '03', asignadoA: 'Ana Gómez', descripcion: 'Desbloquear compuerta de comedero.', done: false },
        { id: 3, corral: '05', asignadoA: 'Luis Mateo', descripcion: 'Comprobar cierres y engrase de bisagras.', done: true },
    ]);

    const sortedTareas = useMemo(() => {
        const pendientes = tareas.filter(t => !t.done);
        const hechas = tareas.filter(t => t.done);
        return [...pendientes, ...hechas];
    }, [tareas]);

    // --- Crear / editar ---
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<Tarea['id'] | null>(null);
    const [form, setForm] = useState<{ corral: string; asignadoA: string; descripcion: string }>({
        corral: '',
        asignadoA: '',
        descripcion: '',
    });
    const [errors, setErrors] = useState<{ corral?: string; descripcion?: string }>({});

    // --- Menú anclado ---
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuTask, setMenuTask] = useState<Tarea | null>(null);
    const [anchor, setAnchor] = useState<AnchorRect | null>(null);

    const openAnchoredMenu = (t: Tarea, a: AnchorRect) => {
        setMenuTask(t);
        setAnchor(a);
        setMenuVisible(true);
    };
    const closeAnchoredMenu = () => setMenuVisible(false);

    const openCreate = () => {
        setEditingId(null);
        setForm({ corral: '', asignadoA: '', descripcion: '' });
        setErrors({});
        setShowForm(true);
    };

    const openEdit = (t: Tarea) => {
        setEditingId(t.id);
        setForm({ corral: t.corral, asignadoA: t.asignadoA, descripcion: t.descripcion });
        setErrors({});
        setShowForm(true);
    };

    const confirmDelete = (id: Tarea['id']) => {
        Alert.alert('Eliminar tarea', '¿Seguro que quieres eliminar esta tarea?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setTareas(prev => prev.filter(t => t.id !== id));
                },
            },
        ]);
    };

    const validate = () => {
        const e: typeof errors = {};
        if (!form.corral.trim()) e.corral = 'Indica el corral (ej. C-12)';
        if (!form.descripcion.trim()) e.descripcion = 'Añade una descripción';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        if (editingId != null) {
            setTareas(prev =>
                prev.map(t =>
                    t.id === editingId
                        ? {
                            ...t,
                            corral: form.corral.trim(),
                            asignadoA: form.asignadoA.trim() || 'Sin asignar',
                            descripcion: form.descripcion.trim(),
                        }
                        : t
                )
            );
        } else {
            const nueva: Tarea = {
                id: Date.now(),
                corral: form.corral.trim(),
                asignadoA: form.asignadoA.trim() || 'Sin asignar',
                descripcion: form.descripcion.trim(),
                done: false,
            };
            setTareas(prev => [nueva, ...prev]);
        }

        setShowForm(false);
        setEditingId(null);
    };

    const saveDisabled = !form.corral.trim() || !form.descripcion.trim();

    const { width, height } = useWindowDimensions();
    const isMd = width >= 768;
    const isLg = width >= 1024;
    const listMaxHeight = !isMd ? Math.round(Math.max(320, Math.min(560, height * 0.55))) : undefined;
    const numCols = isLg ? 2 : 1;

    const MENU_W = 200;
    const SCREEN_W = Dimensions.get('window').width;
    const PADDING = 8;

    const menuLeft = anchor
        ? Math.max(PADDING, Math.min(anchor.x + anchor.width - MENU_W, SCREEN_W - MENU_W - PADDING))
        : 0;
    const menuTop = anchor ? anchor.y + anchor.height + 6 : 0;
    const renderItem = ({ item }: { item: Tarea }) => (
        <View style={{ flex: 1, minWidth: 0, padding: 8 }}>
            <TaskCard
                tarea={item}
                onToggleDone={(id) => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setTareas(prev => prev.map(tt => (tt.id === id ? { ...tt, done: !tt.done } : tt)));
                }}
                onMore={openAnchoredMenu}
            />
        </View>
    );


    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={20} color="#0f172a" />
                    <Text className="ml-2 text-xl font-bold text-slate-900">Tareas Programadas</Text>
                    <View className="ml-2 px-2 py-0.5 rounded-full bg-slate-200/70">
                        <Text className="text-xs text-slate-700">{tareas.length}</Text>
                    </View>
                </View>

                {/* Crear */}
                <Pressable
                    onPress={openCreate}
                    accessibilityLabel="Crear nueva tarea"
                    android_ripple={{ color: '#c7d2fe' }}
                    style={{
                        width: 36, height: 36, borderRadius: 18,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#4F46E5',
                        shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6,
                        shadowOffset: { width: 0, height: 3 }, elevation: 3,
                    }}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                </Pressable>

            </View>

            {/* ===== Lista ===== */}
            {/** MÓVIL: tarjeta con scroll propio para no alargar la pantalla */}
            {!isMd ? (
                <View
                    style={{
                        borderWidth: 1,
                        borderRadius: 16,
                        borderColor: '#E2E8F0',
                        backgroundColor: '#fff',
                        marginHorizontal: 20,
                        marginTop: 8,
                        marginBottom: 16,
                        shadowColor: '#000',
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: 1,
                        maxHeight: listMaxHeight, // 👈 activa scroll interno
                    }}
                >
                    <FlatList
                        data={sortedTareas}
                        renderItem={renderItem}
                        keyExtractor={(i) => String(i.id)}
                        numColumns={isLg ? 2 : 1}
                        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 96 }}
                        showsVerticalScrollIndicator
                    />
                </View>
            ) : (
                /** TABLET/ESCRITORIO: scroll normal; opcionalmente 2 columnas */
                <FlatList
                    data={sortedTareas}
                    keyExtractor={(i) => String(i.id)}
                    renderItem={({ item }) => (
                        <TaskCard
                            tarea={item}
                            onToggleDone={(id) => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setTareas(prev => prev.map(tt => (tt.id === id ? { ...tt, done: !tt.done } : tt)));
                            }}
                            onMore={openAnchoredMenu}
                        />
                    )}
                    numColumns={numCols}
                    columnWrapperStyle={numCols > 1 ? { gap: 16 } : undefined}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 12,
                        paddingBottom: 96,
                        gap: 16,
                    }}
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                />
            )}

            {/* --------- Popover anclado a ⋮ --------- */}
            <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeAnchoredMenu}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} onPress={closeAnchoredMenu}>
                    <View style={{ position: 'absolute', top: menuTop, left: menuLeft, width: MENU_W }}>
                        <View
                            className="rounded-xl overflow-hidden"
                            style={{
                                backgroundColor: '#fff',
                                borderColor: '#e2e8f0',
                                borderWidth: 1,
                                shadowColor: '#000',
                                shadowOpacity: 0.15,
                                shadowRadius: 10,
                                shadowOffset: { width: 0, height: 6 },
                                elevation: 6,
                            }}
                        >
                            <Pressable
                                onPress={() => {
                                    closeAnchoredMenu();
                                    if (menuTask) openEdit(menuTask);
                                }}
                                android_ripple={{ color: '#f1f5f9' }}
                                className="px-4 py-3"
                            >
                                <Text className="text-slate-800">Editar</Text>
                            </Pressable>

                            <View className="h-px bg-slate-100" />

                            <Pressable
                                onPress={() => {
                                    closeAnchoredMenu();
                                    if (menuTask) confirmDelete(menuTask.id);
                                }}
                                android_ripple={{ color: '#fee2e2' }}
                                className="px-4 py-3"
                            >
                                <Text className="text-red-600">Eliminar</Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* --------- Modal Crear/Editar --------- */}
            <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
                <Pressable className="flex-1 bg-black/40" onPress={() => setShowForm(false)}>
                    <KeyboardAvoidingView
                        behavior={Platform.select({ ios: 'padding', android: undefined })}
                        className="flex-1 justify-end"
                    >
                        <Pressable className="bg-white rounded-t-3xl p-5" onPress={(e) => e.stopPropagation()}>
                            <View className="items-center mb-3">
                                <View className="w-10 h-1.5 bg-slate-200 rounded-full" />
                            </View>
                            <Text className="text-xl font-bold text-slate-900 mb-4">
                                {editingId != null ? 'Editar tarea' : 'Nueva tarea'}
                            </Text>

                            {/* Corral */}
                            <View className="mb-3">
                                <Text className="text-slate-700 mb-1">Corral</Text>
                                <TextInput
                                    placeholder="C-12"
                                    value={form.corral}
                                    onChangeText={(v) => setForm(f => ({ ...f, corral: v }))}
                                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                                    autoCapitalize="characters"
                                    returnKeyType="next"
                                />
                                {errors.corral ? <Text className="text-red-600 text-xs mt-1">{errors.corral}</Text> : null}
                            </View>

                            {/* Asignado a */}
                            <View className="mb-3">
                                <Text className="text-slate-700 mb-1">Asignado a</Text>
                                <TextInput
                                    placeholder="Juan Pérez"
                                    value={form.asignadoA}
                                    onChangeText={(v) => setForm(f => ({ ...f, asignadoA: v }))}
                                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Descripción */}
                            <View className="mb-2">
                                <Text className="text-slate-700 mb-1">Descripción</Text>
                                <TextInput
                                    placeholder="Describe la tarea…"
                                    value={form.descripcion}
                                    onChangeText={(v) => setForm(f => ({ ...f, descripcion: v }))}
                                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    returnKeyType="done"
                                />
                                {errors.descripcion ? <Text className="text-red-600 text-xs mt-1">{errors.descripcion}</Text> : null}
                            </View>

                            {/* Acciones */}
                            <View className="flex-row mt-4">
                                <Pressable
                                    onPress={() => setShowForm(false)}
                                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 mr-2 items-center"
                                    android_ripple={{ color: '#e5e7eb' }}
                                >
                                    <Text className="text-slate-700 font-semibold">Cancelar</Text>
                                </Pressable>

                                <Pressable
                                    disabled={saveDisabled}
                                    onPress={handleSave}
                                    className="flex-1 rounded-xl px-4 py-3 items-center"
                                    android_ripple={{ color: '#4338ca' }}
                                    style={{
                                        backgroundColor: saveDisabled ? '#c7d2fe' : '#4F46E5',
                                        opacity: saveDisabled ? 0.9 : 1,
                                    }}
                                >
                                    <Text className="text-white font-semibold">
                                        {editingId != null ? 'Guardar cambios' : 'Guardar'}
                                    </Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </View>
    );
}
