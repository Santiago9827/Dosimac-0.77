// TareasProgramadasScreen.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    LayoutAnimation,
    Platform,
    UIManager,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Alert,
    Dimensions,
    useWindowDimensions,
    StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type Tarea = {
    id: string | number;
    corral: string;
    asignadoA: string;
    descripcion: string;
    done?: boolean;
};

type AnchorRect = { x: number; y: number; width: number; height: number };

const SURFACE_BG = '#F6F8FC';
const CARD_BORDER = '#E2E8F0';
const BRAND = '#4F46E5';
const TEXT_DARK = '#0f172a';
const TEXT_MID = '#475569';

const shadowSm = Platform.select({
    ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    android: { elevation: 2 },
    default: {},
});

const DoneCircle = ({ done, onPress }: { done?: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} style={[styles.doneBtn, done ? styles.doneBtnOn : styles.doneBtnOff]}>
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
        <Pressable style={[styles.card, shadowSm]} android_ripple={{ color: '#f1f5f9' }}>
            <View style={styles.cardBody}>
                {/* Fila superior */}
                <View style={styles.rowBetween}>
                    <View style={styles.rowCenter}>
                        <Ionicons name="home-outline" size={18} color={TEXT_DARK} />
                        <Text style={[styles.label, { marginLeft: 8 }]}>Corral</Text>
                    </View>

                    <View style={styles.rowCenter}>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>{tarea.corral}</Text>
                        </View>

                        <DoneCircle done={tarea.done} onPress={() => onToggleDone(tarea.id)} />

                        <Pressable
                            ref={kebabRef}
                            onPress={openAnchoredMenu}
                            style={styles.kebabBtn}
                            android_ripple={{ color: '#e5e7eb' }}
                        >
                            <Ionicons name="ellipsis-vertical" size={22} color="#64748b" />
                        </Pressable>
                    </View>
                </View>

                {/* Asignado a */}
                <View style={[styles.rowBetween, { marginTop: 6 }]}>
                    <View style={styles.rowCenter}>
                        <Ionicons name="person-circle-outline" size={18} color={TEXT_MID} />
                        <Text style={[styles.label, { marginLeft: 8 }]}>Asignado a</Text>
                    </View>
                    <Text style={styles.assignee}>{tarea.asignadoA}</Text>
                </View>

                <View style={styles.divider} />

                {/* Descripción */}
                <View style={[styles.rowStart]}>
                    <Ionicons name="clipboard-outline" size={18} color={TEXT_MID} style={{ marginTop: 2 }} />
                    <Text
                        style={[styles.desc, tarea.done ? { opacity: 0.7 } : null, { marginLeft: 8 }]}
                        numberOfLines={4}
                    >
                        {tarea.descripcion}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

export default function TareasProgramadasScreen() {
    // Animaciones en Android
    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const [tareas, setTareas] = useState<Tarea[]>([
        { id: 1, corral: '1', asignadoA: 'Juan Pérez', descripcion: 'Revisar bebederos y limpiar filtro.', done: false },
        { id: 2, corral: '2', asignadoA: 'Ana Gómez', descripcion: 'Desbloquear compuerta de comedero.', done: false },
        { id: 3, corral: '3', asignadoA: 'Luis Mateo', descripcion: 'Comprobar cierres y engrase de bisagras.', done: true },
        { id: 4, corral: '4', asignadoA: 'María López', descripcion: 'Inspeccionar sistema de ventilación.', done: false },
        { id: 5, corral: '5', asignadoA: 'Carlos Ruiz', descripcion: 'Verificar niveles de alimento y reponer si es necesario.', done: true },
        { id: 6, corral: '6', asignadoA: 'Sofía Fernández', descripcion: 'Revisar estado de las cercas eléctricas.', done: false },
        { id: 7, corral: '7', asignadoA: 'Miguel Torres', descripcion: 'Limpiar canaletas de desagüe y comprobar flujo de agua.', done: false },
        { id: 8, corral: '8', asignadoA: 'Laura Sánchez', descripcion: 'Inspeccionar sistema de iluminación y reemplazar bombillas fundidas.', done: true },
        { id: 9, corral: '9', asignadoA: 'Diego Ramírez', descripcion: 'Verificar funcionamiento de los sensores de temperatura.', done: false },
        { id: 10, corral: '10', asignadoA: 'Elena Morales', descripcion: 'Realizar mantenimiento preventivo de los equipos de alimentación automática.', done: false },
    ]);

    const sortedTareas = useMemo(() => {
        const pendientes = tareas.filter(t => !t.done);
        const hechas = tareas.filter(t => t.done);
        return [...pendientes, ...hechas];
    }, [tareas]);

    // Crear/editar
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<Tarea['id'] | null>(null);
    const [form, setForm] = useState<{ corral: string; asignadoA: string; descripcion: string }>({
        corral: '',
        asignadoA: '',
        descripcion: '',
    });
    const [errors, setErrors] = useState<{ corral?: string; descripcion?: string }>({});

    // Menú anclado
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
    const isLg = width >= 1024;
    const numCols = isLg ? 2 : 1;
    const listKey = `cols-${numCols}`;
    const insets = useSafeAreaInsets();
    const [headerH, setHeaderH] = useState(0);
    const listHeight = Math.max(0, height - headerH - insets.top - insets.bottom);



    // Menú anclado
    const MENU_W = 200;
    const SCREEN_W = Dimensions.get('window').width;
    const PADDING = 8;
    const menuLeft = anchor
        ? Math.max(PADDING, Math.min(anchor.x + anchor.width - MENU_W, SCREEN_W - MENU_W - PADDING))
        : 0;
    const menuTop = anchor ? anchor.y + anchor.height + 6 : 0;

    const renderItem = ({ item }: { item: Tarea }) => (
        <View style={styles.colWrap}>
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
        <View style={[styles.container, { backgroundColor: SURFACE_BG }]}>
            {/* Header */}
            <View style={styles.header}
                onLayout={e => setHeaderH(e.nativeEvent.layout.height)}

            >
                <View style={styles.rowCenter}>
                    <Ionicons name="calendar-outline" size={20} color={TEXT_DARK} />
                    <Text style={styles.headerTitle}>Tareas Programadas</Text>
                    <View style={styles.counter}>
                        <Text style={styles.counterText}>{tareas.length}</Text>
                    </View>
                </View>

                <Pressable
                    onPress={openCreate}
                    accessibilityLabel="Crear nueva tarea"
                    android_ripple={{ color: '#c7d2fe' }}
                    style={[styles.addBtn, shadowSm]}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                </Pressable>
            </View>

            {/* Lista */}
            <View style={{ height: listHeight }}>
                <FlatList
                    key={listKey}
                    style={{ flex: 1 }}
                    data={sortedTareas}
                    renderItem={renderItem}
                    keyExtractor={(i) => String(i.id)}
                    numColumns={numCols}
                    columnWrapperStyle={numCols > 1 ? { gap: 16 } : undefined}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 96 }}
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                />
            </View>

            {/* Popover anclado a ⋮ */}
            <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeAnchoredMenu}>
                <Pressable style={styles.menuBackdrop} onPress={closeAnchoredMenu}>
                    <View style={[styles.menuBox, { top: menuTop, left: menuLeft, width: MENU_W }, shadowSm]}>
                        <Pressable
                            onPress={() => {
                                closeAnchoredMenu();
                                if (menuTask) openEdit(menuTask);
                            }}
                            android_ripple={{ color: '#f1f5f9' }}
                            style={styles.menuItem}
                        >
                            <Text style={styles.menuItemText}>Editar</Text>
                        </Pressable>
                        <View style={styles.menuDivider} />
                        <Pressable
                            onPress={() => {
                                closeAnchoredMenu();
                                if (menuTask) confirmDelete(menuTask.id);
                            }}
                            android_ripple={{ color: '#fee2e2' }}
                            style={styles.menuItem}
                        >
                            <Text style={[styles.menuItemText, { color: '#dc2626' }]}>Eliminar</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            {/* Modal Crear/Editar */}
            <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
                <Pressable style={styles.sheetBackdrop} onPress={() => setShowForm(false)}>
                    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.sheetHandle} />
                            <Text style={styles.sheetTitle}>{editingId != null ? 'Editar tarea' : 'Nueva tarea'}</Text>

                            {/* Corral */}
                            <View style={{ marginBottom: 12 }}>
                                <Text style={styles.fieldLabel}>Corral</Text>
                                <TextInput
                                    placeholder="C-12"
                                    value={form.corral}
                                    onChangeText={(v) => setForm(f => ({ ...f, corral: v }))}
                                    style={styles.input}
                                    autoCapitalize="characters"
                                    returnKeyType="next"
                                />
                                {errors.corral ? <Text style={styles.errorText}>{errors.corral}</Text> : null}
                            </View>

                            {/* Asignado a */}
                            <View style={{ marginBottom: 12 }}>
                                <Text style={styles.fieldLabel}>Asignado a</Text>
                                <TextInput
                                    placeholder="Juan Pérez"
                                    value={form.asignadoA}
                                    onChangeText={(v) => setForm(f => ({ ...f, asignadoA: v }))}
                                    style={styles.input}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Descripción */}
                            <View style={{ marginBottom: 8 }}>
                                <Text style={styles.fieldLabel}>Descripción</Text>
                                <TextInput
                                    placeholder="Describe la tarea…"
                                    value={form.descripcion}
                                    onChangeText={(v) => setForm(f => ({ ...f, descripcion: v }))}
                                    style={[styles.input, { height: 88, textAlignVertical: 'top' }]}
                                    multiline
                                    numberOfLines={4}
                                    returnKeyType="done"
                                />
                                {errors.descripcion ? <Text style={styles.errorText}>{errors.descripcion}</Text> : null}
                            </View>

                            {/* Acciones */}
                            <View style={{ flexDirection: 'row', marginTop: 16 }}>
                                <Pressable onPress={() => setShowForm(false)} style={[styles.btn, styles.btnOutline]} android_ripple={{ color: '#e5e7eb' }}>
                                    <Text style={styles.btnOutlineText}>Cancelar</Text>
                                </Pressable>

                                <Pressable
                                    disabled={saveDisabled}
                                    onPress={handleSave}
                                    style={[styles.btn, styles.btnPrimary, saveDisabled && { backgroundColor: '#c7d2fe' }]}
                                    android_ripple={{ color: '#4338ca' }}
                                >
                                    <Text style={styles.btnPrimaryText}>{editingId != null ? 'Guardar cambios' : 'Guardar'}</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 0,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    rowStart: { flexDirection: 'row', alignItems: 'flex-start' },

    headerTitle: { marginLeft: 8, fontSize: 22, fontWeight: '800', color: TEXT_DARK },
    counter: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(226,232,240,0.7)' },
    counterText: { fontSize: 12, color: '#334155' },

    addBtn: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: BRAND,
    },

    listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 96 },
    colWrap: { flex: 1, minWidth: 0, paddingVertical: 8 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: CARD_BORDER,
        overflow: 'hidden',
    },
    cardBody: { padding: 16 },

    label: { color: TEXT_DARK, fontSize: 14, fontWeight: '600' },
    pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#E5E7EB', marginRight: 10 },
    pillText: { color: '#0f172a', fontWeight: '700' },

    doneBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginRight: 8 },
    doneBtnOn: { borderColor: '#22c55e', backgroundColor: '#22c55e' },
    doneBtnOff: { borderColor: '#cbd5e1', backgroundColor: 'transparent' },

    kebabBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

    assignee: { color: TEXT_DARK, fontWeight: '600' },
    divider: { height: 1, backgroundColor: CARD_BORDER, marginVertical: 12 },

    desc: { color: '#0f172a', lineHeight: 20, fontSize: 16 },

    // Popover
    menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
    menuBox: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
    menuItemText: { color: '#0f172a' },
    menuDivider: { height: 1, backgroundColor: '#f1f5f9' },

    // Sheet
    sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
    sheetHandle: { alignSelf: 'center', width: 40, height: 6, borderRadius: 4, backgroundColor: '#e2e8f0', marginBottom: 10 },
    sheetTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK, marginBottom: 12 },

    fieldLabel: { color: '#334155', marginBottom: 6 },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#0f172a',
        fontSize: 16,
    },
    errorText: { color: '#dc2626', fontSize: 12, marginTop: 4 },

    btn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    btnOutline: { borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8, backgroundColor: '#fff' },
    btnOutlineText: { color: '#334155', fontWeight: '700' },
    btnPrimary: { backgroundColor: BRAND, marginLeft: 8 },
    btnPrimaryText: { color: '#fff', fontWeight: '700' },
});
