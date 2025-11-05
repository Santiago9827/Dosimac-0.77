import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Pressable, Animated, Dimensions, TextInput } from 'react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { CerdoMaternidad } from '../../../assets';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Platform } from 'react-native';

type IoniconName = ComponentProps<typeof Icon>['name'];

const ipServer = 'http://192.168.1.238:3010';
const corralInfoUrl = (id: number) => `${ipServer}/corral/${id}`;

const CARD_BORDER = '#E2E8F0';
const BRAND = '#4F46E5';

// ===== util responsive =====
const useWinWidth = () => {
   const [w, setW] = React.useState(Dimensions.get('window').width);
   React.useEffect(() => {
      const sub = Dimensions.addEventListener('change', ({ window }) => setW(window.width));
      return () => (sub as any)?.remove?.();
   }, []);
   return w;
};

const useRightDrawer = () => {
   const w = Math.min(340, Math.round(Dimensions.get('window').width * 0.88));
   const [open, setOpen] = useState(false);
   const tx = useRef(new Animated.Value(w)).current;

   const show = () => {
      setOpen(true);
      Animated.timing(tx, { toValue: 0, duration: 240, useNativeDriver: true }).start();
   };

   const hide = (after?: () => void) => {
      Animated.timing(tx, { toValue: w, duration: 220, useNativeDriver: true })
         .start(({ finished }) => {
            if (finished) {
               setOpen(false);
               requestAnimationFrame(() => after?.());
            }
         });
   };

   return { open, show, hide, tx, width: w };
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };

// ====== Diálogos (sin cambios relevantes) ======
function RadioDialog({
   visible, title, options, current, onClose, onAccept,
}: {
   visible: boolean; title: string; options: string[]; current?: string;
   onClose: () => void; onAccept: (val: string) => void;
}) {
   const [val, setVal] = useState(current || options[0]);
   useEffect(() => setVal(current || options[0]), [current, options]);
   return (
      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
         <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
         <View style={{
            position: 'absolute', left: 20, right: 20, top: '26%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 16,
         }}>
            <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 10 }}>{title}</Text>
            {options.map(op => (
               <Pressable key={op} onPress={() => setVal(op)} android_ripple={{ color: '#e5e7eb' }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                  <Icon name={val === op ? 'radio-button-on' : 'radio-button-off'} size={18} color={val === op ? BRAND : '#64748B'} />
                  <Text style={{ marginLeft: 10, color: '#0f172a', fontWeight: val === op ? '800' as const : '600' }}>{op}</Text>
               </Pressable>
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
               <TouchableOpacity onPress={onClose} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => onAccept(val)} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Aceptar</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
   );
}

function SubEstadoDialog({
   visible, current, dateStr, onClose, onAccept,
}: {
   visible: boolean; current?: string; dateStr?: string;
   onClose: () => void; onAccept: (estado: string, fecha: string) => void;
}) {
   const opciones = ['PREPARTO', 'LACTANCIA', 'DESTETE'];
   const [val, setVal] = useState(current || opciones[0]);
   const hoy = useMemo(() => dateStr ?? todayStr(), [dateStr]);
   useEffect(() => setVal(current || opciones[0]), [current]);
   return (
      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
         <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
         <View style={{
            position: 'absolute', left: 20, right: 20, top: '26%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 16,
         }}>
            <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 10 }}>SubEstado</Text>
            {opciones.map(op => (
               <Pressable key={op} onPress={() => setVal(op)} android_ripple={{ color: '#e5e7eb' }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                  <Icon name={val === op ? 'radio-button-on' : 'radio-button-off'} size={18} color={val === op ? BRAND : '#64748B'} />
                  <Text style={{ marginLeft: 10, color: '#0f172a', fontWeight: val === op ? '800' as const : '600' }}>{op}</Text>
               </Pressable>
            ))}

            <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 10 }}>
               <Text style={{ color: '#64748B' }}>Fecha</Text>
               <Text style={{ color: '#0f172a', fontWeight: '800', marginTop: 4 }}>{hoy}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
               <TouchableOpacity onPress={onClose} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => onAccept(val, hoy)} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Aceptar</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
   );
}

function CrotalDialog({
   visible, oldCrotal, onClose, onAccept,
}: {
   visible: boolean; oldCrotal: string; onClose: () => void; onAccept: (nuevo: string) => void;
}) {
   const [nuevo, setNuevo] = useState('');
   useEffect(() => setNuevo(''), [visible]);
   return (
      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
         <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
         <View style={{
            position: 'absolute', left: 20, right: 20, top: '26%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 16,
         }}>
            <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 10 }}>Sustituir crotal</Text>
            <View style={{ marginBottom: 10 }}>
               <Text style={{ color: '#64748B' }}>Crotal antiguo</Text>
               <Text style={{ color: '#0f172a', fontWeight: '800', marginTop: 4 }}>{oldCrotal}</Text>
            </View>
            <View style={{ marginBottom: 10 }}>
               <Text style={{ color: '#64748B', marginBottom: 6 }}>Crotal nuevo</Text>
               <TextInput
                  value={nuevo}
                  onChangeText={setNuevo}
                  placeholder="Introduce nuevo crotal"
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#0f172a' }}
               />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
               <TouchableOpacity onPress={onClose} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => onAccept(nuevo.trim())} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Aceptar</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
   );
}

function ConfirmDialog({
   visible, title, message, onCancel, onAccept,
}: {
   visible: boolean;
   title: string;
   message?: string;
   onCancel: () => void;
   onAccept: () => void;
}) {
   return (
      <Modal
         visible={visible}
         transparent
         animationType="fade"
         statusBarTranslucent
         onRequestClose={onCancel}
      >
         <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
            <Pressable
               onPress={onCancel}
               style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
            />

            <View
               style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: CARD_BORDER,
                  shadowColor: '#000',
                  shadowOpacity: 0.15,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 16,
                  width: '100%',
                  maxWidth: 520,
                  alignSelf: 'center',
               }}
            >
               <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 8 }}>
                  {title}
               </Text>
               {message ? <Text style={{ color: '#334155', marginBottom: 12 }}>{message}</Text> : null}

               <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                     onPress={onCancel}
                     style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}
                  >
                     <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                     onPress={onAccept}
                     style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}
                  >
                     <Text style={{ color: '#fff', fontWeight: '700' }}>Aceptar</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
   );
}

function LactanciaFormModal({
   visible, onClose, onContinue,
}: {
   visible: boolean;
   onClose: () => void;
   onContinue: (data: {
      totalLechones?: string; nacidosVivos?: string; nacidosMuertos?: string;
      donados?: string; adoptados?: string; viables?: string;
   }) => void;
}) {
   const [form, setForm] = useState({
      totalLechones: '', nacidosVivos: '', nacidosMuertos: '',
      donados: '', adoptados: '', viables: '',
   });

   useEffect(() => {
      if (visible) {
         setForm({
            totalLechones: '', nacidosVivos: '', nacidosMuertos: '',
            donados: '', adoptados: '', viables: '',
         });
      }
   }, [visible]);

   const onlyNum = (t: string) => t.replace(/[^0-9]/g, '');
   const step = (k: keyof typeof form, delta: number) =>
      setForm(s => {
         const n = parseInt(s[k] || '0', 10) || 0;
         const v = Math.max(0, n + delta);
         return { ...s, [k]: String(v) };
      });

   const MAX_BODY_H = Math.min(Dimensions.get('window').height * 0.48, 360);

   const Row = ({ label, k }: { label: string; k: keyof typeof form }) => (
      <View style={{
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'space-between',
         paddingVertical: 6,
      }}>
         <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600', flexShrink: 1, paddingRight: 12 }}>
            {label}
         </Text>

         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Pressable
               onPress={() => step(k, -1)}
               android_ripple={{ color: '#e5e7eb' }}
               style={{
                  width: 28, height: 28, borderRadius: 14,
                  borderWidth: 1, borderColor: CARD_BORDER, alignItems: 'center', justifyContent: 'center',
               }}
            >
               <Text style={{ color: '#64748B', fontSize: 16 }}>–</Text>
            </Pressable>

            <TextInput
               value={form[k]}
               onChangeText={(t) => setForm(s => ({ ...s, [k]: onlyNum(t) }))}
               placeholder="0"
               placeholderTextColor="#94A3B8"
               keyboardType="numeric"
               inputMode="numeric"
               maxLength={4}
               style={{
                  width: 90, height: 38,
                  borderWidth: 1, borderColor: CARD_BORDER,
                  borderRadius: 999, paddingHorizontal: 12,
                  textAlign: 'center', color: '#0f172a', fontWeight: '700',
               }}
               accessibilityLabel={label}
            />

            <Pressable
               onPress={() => step(k, +1)}
               android_ripple={{ color: '#e5e7eb' }}
               style={{
                  width: 28, height: 28, borderRadius: 14,
                  borderWidth: 1, borderColor: CARD_BORDER, alignItems: 'center', justifyContent: 'center',
               }}
            >
               <Text style={{ color: '#64748B', fontSize: 16 }}>+</Text>
            </Pressable>
         </View>
      </View>
   );

   return (
      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
         <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
            <Pressable
               onPress={onClose}
               style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
            />

            <View
               style={{
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: CARD_BORDER,
                  shadowColor: '#000',
                  shadowOpacity: 0.15,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 18,
                  width: '100%',
                  maxWidth: 520,
                  alignSelf: 'center',
               }}
            >
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                     width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF',
                     alignItems: 'center', justifyContent: 'center', marginRight: 8,
                  }}>
                     <Icon name="medkit-outline" size={18} color={BRAND} />
                  </View>
                  <View style={{ flex: 1 }}>
                     <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a' }}>
                        Pasar a lactancia
                     </Text>
                     <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                        Todos los campos son opcionales
                     </Text>
                  </View>

                  <Pressable
                     onPress={onClose}
                     hitSlop={10}
                     android_ripple={{ color: '#e5e7eb', borderless: true }}
                     style={{ padding: 4, marginLeft: 6 }}
                  >
                     <Icon name="close" size={20} color="#64748B" />
                  </Pressable>
               </View>

               <ScrollView
                  style={{ maxHeight: MAX_BODY_H }}
                  contentContainerStyle={{ paddingBottom: 0 }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
               >
                  <Row label="Total lechones" k="totalLechones" />
                  <Row label="Nacidos vivos" k="nacidosVivos" />
                  <Row label="Nacidos muertos" k="nacidosMuertos" />
                  <Row label="Donados" k="donados" />
                  <Row label="Adoptados" k="adoptados" />
                  <Row label="Viables" k="viables" />
               </ScrollView>

               <View style={{ height: 1, backgroundColor: CARD_BORDER, marginTop: 10, marginBottom: 8 }} />

               <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                     onPress={onClose}
                     style={{
                        flex: 1, height: 44, borderRadius: 12,
                        backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: CARD_BORDER,
                        alignItems: 'center', justifyContent: 'center',
                     }}
                  >
                     <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                     onPress={() => onContinue(form)}
                     style={{
                        flex: 1, height: 44, borderRadius: 12,
                        backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center',
                     }}
                  >
                     <Text style={{ color: '#fff', fontWeight: '800' }}>Siguiente</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
   );
}

function NextStepModal({
   visible, onClose, onPasarDestete, onSalida,
}: {
   visible: boolean;
   onClose: () => void;
   onPasarDestete: () => void;
   onSalida: () => void;
}) {
   return (
      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
         <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
            <Pressable
               onPress={onClose}
               style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
            />

            <View
               style={{
                  backgroundColor: '#fff',
                  borderRadius: 18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: CARD_BORDER,
                  shadowColor: '#000',
                  shadowOpacity: 0.15,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 18,
                  width: '100%',
                  maxWidth: 480,
                  alignSelf: 'center',
               }}
            >
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View
                     style={{
                        width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEF2FF',
                        alignItems: 'center', justifyContent: 'center', marginRight: 8,
                     }}
                  >
                     <Icon name="arrow-forward-circle-outline" size={16} color={BRAND} />
                  </View>
                  <Text style={{ flex: 1, fontWeight: '900', fontSize: 16, color: '#0f172a' }}>
                     Siguiente operación
                  </Text>
                  <Pressable onPress={onClose} hitSlop={8} android_ripple={{ color: '#e5e7eb', borderless: true }}>
                     <Icon name="close" size={20} color="#64748B" />
                  </Pressable>
               </View>

               <Text style={{ color: '#64748B', marginBottom: 8, fontSize: 13 }}>Elige una opción:</Text>

               <View style={{ borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 12, overflow: 'hidden' }}>
                  <Pressable
                     onPress={onPasarDestete}
                     android_ripple={{ color: '#e5e7eb' }}
                     style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 }}
                  >
                     <Icon name="git-branch-outline" size={18} color={BRAND} />
                     <Text style={{ marginLeft: 10, fontSize: 15, color: '#0f172a', fontWeight: '700' }}>
                        Pasar a destete
                     </Text>
                     <View style={{ flex: 1 }} />
                     <Icon name="chevron-forward" size={18} color="#94A3B8" />
                  </Pressable>

                  <View style={{ height: 1, backgroundColor: CARD_BORDER }} />

                  <Pressable
                     onPress={onSalida}
                     android_ripple={{ color: '#e5e7eb' }}
                     style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 }}
                  >
                     <Icon name="exit-outline" size={18} color="#0f172a" />
                     <Text style={{ marginLeft: 10, fontSize: 15, color: '#0f172a', fontWeight: '700' }}>
                        Salida
                     </Text>
                     <View style={{ flex: 1 }} />
                     <Icon name="chevron-forward" size={18} color="#94A3B8" />
                  </Pressable>
               </View>

               <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                  <TouchableOpacity
                     onPress={onClose}
                     activeOpacity={0.9}
                     style={{
                        height: 36,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        backgroundColor: '#F1F5F9',
                        borderWidth: 1,
                        borderColor: CARD_BORDER,
                        alignItems: 'center',
                        justifyContent: 'center',
                     }}
                  >
                     <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
   );
}

function DrawerGrabber() {
   return (
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
         <View style={{ width: 42, height: 4, borderRadius: 999, backgroundColor: '#CBD5E1' }} />
      </View>
   );
}

function SectionTitle({
   icon, title, subtitle,
}: { icon: IoniconName; title: string; subtitle?: string }) {
   return (
      <View
         style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#C7D2FE',
            backgroundColor: '#EEF2FF',
            marginBottom: 10,
         }}
      >
         <View
            style={{
               width: 32, height: 32, borderRadius: 16,
               backgroundColor: '#E0E7FF',
               alignItems: 'center', justifyContent: 'center', marginRight: 10,
            }}
         >
            <Icon name={icon} size={18} color={BRAND} />
         </View>
         <View style={{ flex: 1 }}>
            <Text style={{ color: '#0f172a', fontWeight: '900', fontSize: 16 }}>{title}</Text>
            {!!subtitle && <Text style={{ color: '#64748B', fontSize: 12 }}>{subtitle}</Text>}
         </View>
      </View>
   );
}

function ListItem({
   icon, label, onPress, disabled,
}: {
   icon?: IoniconName; label: string; onPress: () => void; disabled?: boolean;
}) {
   return (
      <Pressable
         onPress={disabled ? undefined : onPress}
         disabled={disabled}
         android_ripple={disabled ? undefined : { color: '#e5e7eb' }}
         style={{
            opacity: disabled ? 0.45 : 1,
            flexDirection: 'row', alignItems: 'center',
            paddingVertical: 12, paddingHorizontal: 12,
         }}
      >
         {icon && <Icon name={icon} size={18} color={disabled ? '#94A3B8' : '#334155'} />}
         <Text style={{ marginLeft: icon ? 10 : 0, color: disabled ? '#94A3B8' : '#0F172A', fontWeight: '800', flex: 1 }}>
            {label}
         </Text>
         <Icon name="chevron-forward" size={18} color="#94A3B8" />
      </Pressable>
   );
}

function ListGroup({ children }: { children: React.ReactNode }) {
   return (
      <View
         style={{
            borderWidth: 1, borderColor: CARD_BORDER,
            borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff',
         }}
      >
         {children}
      </View>
   );
}

const Divider = () => <View style={{ height: 1, backgroundColor: CARD_BORDER }} />;

export const MatCorralDetail = () => {
   const insets = useSafeAreaInsets();
   const route = useRoute<any>();
   const params = route.params ?? {};
   const { corralId = 0, mockEmpty, mockData, deviceError, diasSinAlimentar, statusMessage } = params;
   const navigation = useNavigation<NavigationProp<any>>();
   const [corraInfo, setCorralInfo] = useState<any | null>(null);



   const [animalState, setAnimalState] = useState({
      crotal: '—',
      curva: '—',
      condicion: '—',
      subEstado: '—',
      subEstadoFecha: todayStr(),
   });
   const sub = (animalState.subEstado || '').toUpperCase();

   const [isDeviceError] = useState<boolean>(!!deviceError);
   const [hasDiasSinAlimentar] = useState<boolean>(!!diasSinAlimentar);

   const [dlgLactancia, setDlgLactancia] = useState(false);
   const [dlgNextStep, setDlgNextStep] = useState(false);
   const [dlgSalidaMotivo, setDlgSalidaMotivo] = useState(false);

   const [confirm, setConfirm] = useState<{
      visible: boolean; title: string; message?: string; onAccept?: () => void;
   }>({ visible: false, title: '' });

   const [requestError, setRequestError] = useState(false);

   const drawer = useRightDrawer();
   const [dlgCurva, setDlgCurva] = useState(false);
   const [dlgCond, setDlgCond] = useState(false);
   const [dlgSub, setDlgSub] = useState(false);
   const [dlgSalida, setDlgSalida] = useState(false);
   const [dlgCrotal, setDlgCrotal] = useState(false);

   // responsive flags
   const winW = useWinWidth();
   const isMd = Platform.OS === 'web' && winW >= 900;
   const isLg = Platform.OS === 'web' && winW >= 1200;

   const infoCols = isLg ? 3 : (isMd ? 2 : 1);
   const infoW = infoCols === 3 ? '32%' : infoCols === 2 ? '48%' : '100%';

   // tamaños adaptativos para KPI e histograma (más grandes)
   const isXl = Platform.OS === 'web' && winW >= 1440;
   const kpiFontSize = isXl ? 72 : (isLg ? 62 : (isMd ? 54 : 46));
   // ===== TAMAÑOS QUE PUEDES TOCAR RÁPIDO =====
   const pctFont = isMd ? 22 : 18;             // tamaño del "92%"
   const pctOffsetY = isMd ? -28 : -22;           // separación vertical del % sobre la barra

   const HISTO_BG_H = isMd ? 150 : 88;             // alto base del "fondo" gris del histograma
   const barW = isMd ? 18 : 14;              // ancho de cada barra
   const KPI_AREA_PCT = isMd ? 40 : 100;
   const KPI_HISTO_GAP = 8;
   const HISTO_WIDTH = isMd ? Math.min(440, Math.round(winW * 0.34)) : 260;
   const legendFont = isMd ? 18 : 17;             // tamaño "200/600" y "33%"
   const HISTO_NUDGE_Y = isMd ? 8 : 0;          // ajuste fino vertical del histograma
   const HISTO_LEGEND_GAP = isMd ? 8 : 6;        // espacio entre barras y leyenda del histograma

   const CURRENT_BAR_INDEX = 4;   // la barra “actual”
   const CURRENT_BAR_SCALE = 1.8; // cuánto se ensancha la actual
   const CURRENT_BORDER_W = 2;   // grosor del borde negro
   const PIG_OPACITY_SM = 0.22;
   const PIG_OPACITY_MD = 0.26;
   const PIG_OPACITY_LG = 0.30;

   const PIG_SCALE_SM = 1.08;
   const PIG_SCALE_MD = 1.18;
   const PIG_SCALE_LG = 1.28;



   const EmptyCorralCard = ({
      corralId,
      onPressAdd,
      buttonVariant = 'secondary',
   }: {
      corralId: number | string;
      onPressAdd?: () => void;
      buttonVariant?: 'primary' | 'secondary' | 'ghost';
   }) => {
      const baseBtn = {
         height: 42,
         borderRadius: 10,
         paddingHorizontal: 14,
         alignItems: 'center',
         justifyContent: 'center',
         alignSelf: 'center',
         width: '75%',
      } as const;

      const styleByVariant: Record<string, any> = {
         primary: { backgroundColor: BRAND },
         secondary: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: CARD_BORDER },
         ghost: { backgroundColor: 'transparent' },
      };

      const textColorByVariant: Record<string, string> = {
         primary: '#fff',
         secondary: BRAND,
         ghost: BRAND,
      };

      return (
         <View style={{ marginTop: 24, alignItems: 'center' }}>
            <View
               style={{
                  width: 64, height: 64, borderRadius: 32,
                  backgroundColor: '#FEF3C7',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 8,
               }}
            >
               <Icon name="warning-outline" size={34} color="#92400E" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Sin animales</Text>

            <View
               style={{
                  marginTop: 14,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
               }}
            >
               <Text style={{ color: '#475569', fontSize: 16 }}>
                  No hay ningún animal en el{' '}
               </Text>

               <View
                  style={{
                     backgroundColor: '#F1F5F9',
                     borderWidth: 1,
                     borderColor: CARD_BORDER,
                     paddingHorizontal: 10,
                     paddingVertical: 3,
                     borderRadius: 999,
                  }}
               >
                  <Text
                     style={{
                        color: '#0f172a',
                        fontWeight: '900',
                        fontSize: 16,
                        lineHeight: 18,
                     }}
                  >
                     Corral {corralId}
                  </Text>
               </View>
            </View>

            <TouchableOpacity
               onPress={onPressAdd}
               activeOpacity={0.9}
               style={[baseBtn, styleByVariant[buttonVariant], { marginTop: 20 }]}
            >
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                     name={buttonVariant === 'ghost' ? 'add-outline' : 'add-circle-outline'}
                     size={18}
                     color={textColorByVariant[buttonVariant]}
                     style={{ marginRight: 6 }}
                  />
                  <Text style={{ color: textColorByVariant[buttonVariant], fontWeight: '700' }}>
                     Introducir animal
                  </Text>
               </View>
            </TouchableOpacity>
         </View>
      );
   };

   useEffect(() => {
      if (mockEmpty) {
         setCorralInfo({});
         return;
      }
      if (mockData) {
         setCorralInfo(mockData);
         return;
      }
      const url = corralInfoUrl(corralId || 19);
      axios.get(url)
         .then((res) => setCorralInfo(res.data))
         .catch(() => setRequestError(true));
   }, [corralId, mockEmpty, mockData]);

   const animal = corraInfo?.animal;
   const hasAnimal = !!animal;

   useEffect(() => {
      if (!animal) return;
      setAnimalState(s => ({
         ...s,
         crotal: animal.crotal ?? s.crotal,
         curva: animal.curva ?? s.curva,
         subEstado: animal.subEstado ?? s.subEstado,
         subEstadoFecha: animal.subEstadoFecha ?? s.subEstadoFecha,
      }));
   }, [animal]);

   const openAction = (key: string) => {
      drawer.hide(() => {
         if (key === 'curva') setDlgCurva(true);
         else if (key === 'condicionCorporal') setDlgCond(true);
         else if (key === 'subEstado') setDlgSub(true);
         else if (key === 'salidaAnimal') setDlgSalida(true);
         else if (key === 'sustituirCrotal') setDlgCrotal(true);
      });
   };

   const resetAnimalState = () => ({
      crotal: '—',
      curva: '—',
      condicion: '—',
      subEstado: '—',
      subEstadoFecha: todayStr(),
   });

   const simulateRemoveAnimal = () => {
      setCorralInfo(c => ({ ...(c || {}), animal: null }));
      setAnimalState(resetAnimalState());
   };

   const applyCurva = (val: string) => { setAnimalState(s => ({ ...s, curva: val })); setDlgCurva(false); };
   const applyCondicion = (val: string) => { setAnimalState(s => ({ ...s, condicion: val })); setDlgCond(false); };
   const applySubEstado = (estado: string, fecha: string) => { setAnimalState(s => ({ ...s, subEstado: estado, subEstadoFecha: fecha })); setDlgSub(false); };
   const applySalida = () => setDlgSalida(false);
   const applyCrotal = (nuevo: string) => { if (!nuevo) return; setAnimalState(s => ({ ...s, crotal: nuevo })); setDlgCrotal(false); };

   const askConfirm = (title: string, message: string, onAccept: () => void) =>
      setConfirm({ visible: true, title, message, onAccept });

   const onContinueLactancia = (data: any) => {
      askConfirm('Pasar a lactancia', '¿Seguro de pasar a la siguiente operación?', () => {
         setAnimalState(s => ({ ...s, subEstado: 'LACTANCIA', subEstadoFecha: todayStr() }));
         setDlgLactancia(false);
      });
   };

   const onPasarDestete = () => {
      askConfirm('Pasar a destete', '¿Seguro de pasar a la siguiente operación?', () => {
         setAnimalState(s => ({ ...s, subEstado: 'DESTETE', subEstadoFecha: todayStr() }));
         setDlgNextStep(false);
      });
   };

   const onSalida = () => setDlgSalidaMotivo(true);

   const onAcceptSalidaMotivo = (motivo: string) => {
      askConfirm('Confirmar salida', `Motivo: ${motivo}. ¿Seguro?`, () => {
         setAnimalState(s => ({ ...s, subEstado: 'SALIDA', subEstadoFecha: todayStr() }));
         setDlgSalidaMotivo(false);
         setDlgNextStep(false);
         simulateRemoveAnimal();
      });
   };

   const objetivo = animal?.consumo?.objetivo ?? 12000;
   const actual = animal?.consumo?.actual ?? 11000;
   const pct = objetivo > 0 ? Math.round((actual / objetivo) * 100) : 0;

   return (
      <View style={{ flex: 1 }}>
         <ScrollView
            style={{ flex: 1, backgroundColor: '#F1F5F9' }}
            contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
         >
            <View style={[styles.card, { paddingHorizontal: 24 }]}>
               {hasAnimal && (
                  <Image
                     source={CerdoMaternidad}
                     resizeMode="contain"
                     style={[
                        styles.pigBg,
                        isLg
                           ? { opacity: PIG_OPACITY_LG, transform: [{ scale: PIG_SCALE_LG }], top: 200 }
                           : isMd
                              ? { opacity: PIG_OPACITY_MD, transform: [{ scale: PIG_SCALE_MD }], top: 200 }
                              : { opacity: PIG_OPACITY_SM, transform: [{ scale: PIG_SCALE_SM }], top: 240 },
                     ]}
                  />

               )}

               {(isDeviceError || !!statusMessage) && (
                  <View style={[styles.errorBand, { marginTop: 8 }]}>
                     <Text style={styles.errorText}>{statusMessage || 'Error: El motor no funciona'}</Text>
                  </View>
               )}

               {!hasAnimal ? (
                  <EmptyCorralCard
                     corralId={corralId}
                     onPressAdd={() => navigation.navigate('MAT-INTRO-ANIMAL', { corralId } as never)}
                  />
               ) : (
                  <>
                     {/* === ID · Crotal · Día · Ciclo  */}
                     <View style={styles.metaRowEven}>
                        <View style={styles.metaCellEven}>
                           <Text style={styles.chipLabel}>ID</Text>
                           <Text style={styles.chipValue}>{animal?.id ?? '—'}</Text>
                        </View>

                        <View style={[styles.metaCellEven, { minWidth: 0 }]}>
                           <Text style={styles.chipLabel}>Crotal</Text>
                           <Text numberOfLines={1} ellipsizeMode="middle" style={[styles.chipValue, { flexShrink: 1 }]}>
                              {animal?.crotal ?? '—'}
                           </Text>
                        </View>

                        <View style={styles.metaCellEven}>
                           <Text style={styles.chipLabel}>Día</Text>
                           <Text style={styles.chipValue}>{animal?.dia ?? '—'}</Text>
                        </View>

                        <View style={styles.metaCellEven}>
                           <Text style={styles.chipLabel}>Ciclo</Text>
                           <Text style={styles.chipValue}>{animal?.ciclo ?? '—'}</Text>
                        </View>
                     </View>

                     {/* Subestado */}
                     <View style={styles.headerRowMd}>
                        <Text style={styles.subTitle}>{animalState.subEstado ?? '—'}</Text>
                     </View>

                     {/* KPI + histograma */}
                     <View style={[styles.kpiRow, isMd && styles.kpiRowMd]}>
                        <View style={[styles.kpiLeft, { flexBasis: `${KPI_AREA_PCT}%`, marginRight: KPI_HISTO_GAP }]}>
                           <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                              <Text style={[styles.kpiNumber, { fontSize: kpiFontSize }]}>
                                 {actual.toLocaleString('es-ES')}
                              </Text>
                              <Text style={styles.kpiUnit}>gr</Text>
                           </View>

                           {/* barra + % anclado al final */}
                           <View style={[styles.progressWrap, { width: '100%' }]}>
                              <View style={styles.barBg} />
                              <View style={[styles.barFill, { width: `${Math.min(100, pct)}%` }]} />
                              <View style={[styles.pctAnchor, { left: `${Math.min(100, pct)}%`, top: pctOffsetY }]}>
                                 <Text style={[styles.pctLabel, { fontSize: pctFont }]}>{pct}%</Text>
                              </View>
                           </View>
                           <View style={styles.kpiFootRow}>
                              <Text style={styles.kpiFootTextStrong}>
                                 Objetivo {objetivo.toLocaleString('es-ES')} gr
                              </Text>
                           </View>
                        </View>
                        {/* <View style={{ width: KPI_HISTO_SPACER }} /> */}
                        <View
                           style={[
                              styles.histogram,
                              isMd && styles.histogramMd,
                              {
                                 width: HISTO_WIDTH,
                                 flexShrink: 0,
                                 transform: [{ translateY: HISTO_NUDGE_Y }],
                                 marginTop: isMd ? 0 : 12,
                              },
                           ]}
                        >
                           {/* fila de barras */}
                           <View style={styles.histoBarsRow}>
                              {[
                                 { pct: 1.00, color: '#10B981' },
                                 { pct: 0.85, color: '#10B981' },
                                 { pct: 0.40, color: '#EF4444' },
                                 { pct: 0.75, color: '#10B981' },
                                 { pct: 0.33, color: '#10B981' },
                                 { pct: 0.00, color: '#94A3B8' },
                                 { pct: 0.00, color: '#94A3B8' },
                                 { pct: 0.00, color: '#94A3B8' },
                              ].map((b, i) => {
                                 const isCurrent = i === CURRENT_BAR_INDEX;
                                 const w = isCurrent ? barW * CURRENT_BAR_SCALE : barW;
                                 const hFill = Math.round(Math.max(0, Math.min(1, b.pct)) * HISTO_BG_H);

                                 return (
                                    <View
                                       key={i}
                                       style={{
                                          marginLeft: i ? 10 : 0,
                                          height: HISTO_BG_H,
                                          width: w,
                                          backgroundColor: '#CBD5E1',
                                          borderTopLeftRadius: 6,
                                          borderTopRightRadius: 6,
                                          justifyContent: 'flex-end',
                                          overflow: 'hidden',
                                          borderWidth: isCurrent ? CURRENT_BORDER_W : 0,
                                          borderColor: isCurrent ? '#000' : 'transparent',
                                       }}
                                    >
                                       <View
                                          style={{
                                             height: hFill,
                                             width: '100%',
                                             backgroundColor: b.color,
                                          }}
                                       />
                                    </View>
                                 );
                              })}
                           </View>


                           {/* leyenda DEBAJO, alineada a la derecha */}
                           <View style={[styles.histoLegendRow, { marginTop: HISTO_LEGEND_GAP }]}>
                              <Text style={[styles.histoLegendPrimary, { fontSize: legendFont }]}>200/600</Text>
                              <View style={styles.histoLegendDivider} />
                              <Text style={[styles.histoLegendPrimary, { fontSize: legendFont }]}>33%</Text>
                           </View>
                        </View>
                     </View>

                     {/* banda dias sin alimentar */}
                     {hasDiasSinAlimentar && (
                        <>
                           <View style={{ height: 20 }} />  {/* separador explícito */}
                           <View style={styles.errorBand}>
                              <Text style={styles.errorText}>2 días sin alimentar</Text>
                           </View>
                           <View style={{ height: 2 }} />
                        </>
                     )}


                     {/* GRID de info */}
                     <View style={[styles.infoGrid]}>
                        <View style={[styles.infoCell, { width: infoW }]}>
                           <Text style={styles.infoLabel}>Curva</Text>
                           <View style={styles.infoRow}>
                              <Icon name="book-outline" size={18} color="#0f172a" />
                              <Text style={[styles.infoValue, styles.pill]}>{animal?.curva ?? '—'}</Text>
                           </View>
                        </View>

                        <View style={[styles.infoCell, { width: infoW }]}>
                           <Text style={styles.infoLabel}>Corrección</Text>
                           <View style={styles.infoRow}>
                              <Icon name="book-outline" size={18} color="#0f172a" />
                              <Text style={styles.infoValue}>{animal?.correccion ?? '—'}</Text>
                           </View>
                        </View>

                        <View style={[styles.infoCell, { width: infoW }]}>
                           <Text style={styles.infoLabel}>Fecha entrada</Text>
                           <View style={styles.infoRow}>
                              <Icon name="book-outline" size={18} color="#0f172a" />
                              <Text style={styles.infoValue}>{animal?.fechas?.entrada ?? '—'}</Text>
                           </View>
                        </View>

                        <View style={[styles.infoCell, { width: infoW }]}>
                           <Text style={styles.infoLabel}>Fecha parto</Text>
                           <View style={styles.infoRow}>
                              <Icon name="book-outline" size={18} color="#0f172a" />
                              <Text style={styles.infoValue}>{animal?.fechas?.parto ?? '—'}</Text>
                           </View>
                        </View>

                        <View style={[styles.infoCell, { width: infoW }]}>
                           <Text style={styles.infoLabel}>Nave</Text>
                           <View style={styles.infoRow}>
                              <Icon name="book-outline" size={18} color="#0f172a" />
                              <Text style={styles.infoValue}>{animal?.nave ?? '—'}</Text>
                           </View>
                        </View>

                        <View style={[styles.infoCell, { width: infoW }]}>
                           <Text style={styles.infoLabel}>Corral</Text>
                           <View style={styles.infoRow}>
                              <Icon name="book-outline" size={18} color="#0f172a" />
                              <Text style={styles.infoValue}>{animal?.corral ?? corralId ?? '—'}</Text>
                           </View>
                        </View>

                        <View style={[styles.infoCell, { width: '100%' }]}>
                           <Text style={styles.infoLabel}>Última alimentación</Text>
                           <View style={styles.infoRow}>
                              <Icon name="book-outline" size={18} color="#0f172a" />
                              <Text style={styles.infoValue}>{animal?.ultimaAlimentacion ?? '—'}</Text>
                           </View>
                        </View>
                     </View>
                  </>
               )}
            </View>
         </ScrollView >

         {/* --- Barra inferior --- */}
         < View
            style={{
               position: 'absolute',
               left: 0,
               right: 0,
               bottom: 0,
               paddingHorizontal: 20,
               paddingTop: 8,
               paddingBottom: 8 + insets.bottom,
               backgroundColor: 'rgba(248,250,252,0.96)',
               borderTopWidth: 1,
               borderTopColor: '#E5E7EB',
            }}
         >
            <View style={{ flexDirection: 'row', gap: 12 }}>
               <TouchableOpacity
                  onPress={() => drawer.show()}
                  activeOpacity={0.9}
                  style={{
                     flex: 1,
                     backgroundColor: BRAND,
                     borderRadius: 12,
                     height: 48,
                     alignItems: 'center',
                     justifyContent: 'center',
                  }}
               >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Operaciones</Text>
               </TouchableOpacity>
            </View>
         </View >

         {/* Drawer lateral derecho */}
         < Modal visible={drawer.open} transparent animationType="none" onRequestClose={() => drawer.hide()}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={() => drawer.hide()} />
            <Animated.View
               style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: drawer.width,
                  backgroundColor: '#fff',
                  paddingTop: 14,
                  paddingHorizontal: 12,
                  borderTopLeftRadius: 16,
                  borderBottomLeftRadius: 16,
                  transform: [{ translateX: drawer.tx }],
                  elevation: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.18,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
               }}
            >
               <DrawerGrabber />

               <SectionTitle
                  icon="arrow-forward-circle-outline"
                  title="Siguiente operación"
                  subtitle="Elige la siguiente acción para este animal"
               />

               {!hasAnimal ? (
                  <ListGroup>
                     <ListItem
                        icon="add-circle-outline"
                        label="Introducir animal"
                        onPress={() => drawer.hide(() => navigation.navigate('MAT-INTRO-ANIMAL', { corralId } as never))}
                     />
                  </ListGroup>
               ) : sub === 'PREPARTO' ? (
                  <ListGroup>
                     <ListItem
                        icon="medkit-outline"
                        label="Pasar a lactancia"
                        onPress={() => drawer.hide(() => setDlgLactancia(true))}
                     />
                  </ListGroup>
               ) : sub === 'LACTANCIA' ? (
                  <ListGroup>
                     <ListItem
                        icon="flag-outline"
                        label="Siguiente paso"
                        onPress={() => drawer.hide(() => setDlgNextStep(true))}
                     />
                  </ListGroup>
               ) : sub === 'DESTETE' ? (
                  <ListGroup>
                     <ListItem
                        icon="exit-outline"
                        label="Salida"
                        onPress={() => drawer.hide(() => setDlgSalidaMotivo(true))}
                     />
                  </ListGroup>
               ) : (
                  <ListGroup>
                     <ListItem
                        icon="arrow-forward-outline"
                        label="Siguiente paso"
                        onPress={() => drawer.hide(() => setDlgNextStep(true))}
                     />
                  </ListGroup>
               )}

               <View style={{ height: 1, backgroundColor: CARD_BORDER, marginVertical: 12 }} />

               <SectionTitle icon="options-outline" title="Acciones" />

               <ListGroup>
                  <ListItem icon="pulse-outline" label="Curva" onPress={() => openAction('curva')} disabled={!hasAnimal} />
                  <Divider />
                  <ListItem icon="body-outline" label="Condición corporal" onPress={() => openAction('condicionCorporal')} disabled={!hasAnimal} />
                  <Divider />
                  <ListItem icon="flag-outline" label="SubEstado" onPress={() => openAction('subEstado')} disabled={!hasAnimal} />
                  <Divider />
                  <ListItem icon="exit-outline" label="Salida animal" onPress={() => openAction('salidaAnimal')} disabled={!hasAnimal} />
                  <Divider />
                  <ListItem icon="pricetags-outline" label="Sustituir crotal" onPress={() => openAction('sustituirCrotal')} disabled={!hasAnimal} />
                  <Divider />
                  <ListItem icon="finger-print-outline" label="Identificador animal anónimo" onPress={() => openAction('identificadorAnonimo')} disabled={!hasAnimal} />
                  <Divider />
                  <ListItem icon="home-outline" label="Salida maternidad" onPress={() => openAction('salidaMaternidad')} disabled={!hasAnimal} />
               </ListGroup>
            </Animated.View>
         </Modal >

         {/* Diálogos */}
         < RadioDialog
            visible={dlgCurva}
            title="Seleccionar curva"
            options={['DEFECTO', 'PRIMALAS 2 FASE', 'CURVA GENERAL', 'ADAPTACION PRIM', 'ENFERMA', 'SEGUNDO CICLO']}
            current={animalState.curva}
            onClose={() => setDlgCurva(false)}
            onAccept={applyCurva}
         />

         <RadioDialog
            visible={dlgCond}
            title="Condición corporal"
            options={['Extra gorda', 'Muy gorda', 'Gorda', 'Normal', 'Delgada', 'Muy delgada', 'Extra delgada']}
            current={animalState.condicion}
            onClose={() => setDlgCond(false)}
            onAccept={applyCondicion}
         />

         <SubEstadoDialog
            visible={dlgSub}
            current={animalState.subEstado}
            dateStr={animalState.subEstadoFecha}
            onClose={() => setDlgSub(false)}
            onAccept={applySubEstado}
         />

         <RadioDialog
            visible={dlgSalida}
            title="Salida animal"
            options={[
               'SIN SALIDA PROGRAMADA',
               'SALIDA PROGRAMADA',
               'SALIDA PROGRAMADA CON VACIO TOLVA',
               'SALIDA MATERNIDAD',
            ]}
            current={undefined}
            onClose={() => setDlgSalida(false)}
            onAccept={applySalida}
         />

         <CrotalDialog
            visible={dlgCrotal}
            oldCrotal={animalState.crotal}
            onClose={() => setDlgCrotal(false)}
            onAccept={applyCrotal}
         />

         <LactanciaFormModal
            visible={dlgLactancia}
            onClose={() => setDlgLactancia(false)}
            onContinue={onContinueLactancia}
         />

         <NextStepModal
            visible={!drawer.open && dlgNextStep}
            onClose={() => setDlgNextStep(false)}
            onPasarDestete={onPasarDestete}
            onSalida={onSalida}
         />

         <RadioDialog
            visible={dlgSalidaMotivo}
            title="Motivo de salida"
            options={['Correcto', 'Aborto', 'Muerta']}
            current={undefined}
            onClose={() => setDlgSalidaMotivo(false)}
            onAccept={onAcceptSalidaMotivo}
         />

         <ConfirmDialog
            visible={confirm.visible}
            title={confirm.title}
            message={confirm.message}
            onCancel={() => setConfirm(c => ({ ...c, visible: false }))}
            onAccept={() => {
               const cb = confirm.onAccept;
               setConfirm(c => ({ ...c, visible: false }));
               cb && cb();
            }}
         />
      </View >
   );
};

const styles = StyleSheet.create({
   infoCellBox: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: CARD_BORDER,
      borderRadius: 12,
      padding: 12,
   },

   card: {
      width: '100%',
      alignSelf: 'stretch',
      paddingTop: 12,
      paddingBottom: 16,
      position: 'relative',
   },

   // cerdo fondo
   pigBg: {
      position: 'absolute',
      left: '5%',
      width: '90%',
      height: 500,
      opacity: 0.2,
      pointerEvents: 'none',
      alignSelf: 'center',
   },

   errorBand: {
      minHeight: 36,
      width: '100%',
      backgroundColor: '#EF4444',
      borderRadius: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
   },
   errorText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: Platform.OS === 'web' ? '600' : '400',
      textAlign: 'center',
   },

   bandSpacer: { marginTop: 50 },


   metaRowEven: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      columnGap: 18,
   },
   metaCellEven: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0,
   },

   chipLabel: {
      fontSize: 16,
      color: '#475569',
      backgroundColor: '#E5E7EB',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
   },
   chipValue: { marginLeft: 8, fontSize: 16, color: '#334155', fontWeight: '600' },

   headerRowMd: { marginTop: 16, flexDirection: 'row', alignItems: 'center' },
   subTitle: { fontSize: 22, color: '#1E3A8A', fontWeight: '700' },

   kpiRow: { marginTop: 12, flexDirection: 'column', rowGap: 12, alignItems: 'stretch' },
   kpiNumber: { fontSize: 54, color: '#475569', fontWeight: '700', letterSpacing: -1.5 },
   kpiUnit: { fontSize: 18, color: '#475569', marginLeft: 6 },


   barBg: { height: 14, borderRadius: 999, backgroundColor: '#D1D5DB', width: '100%' },
   barFill: { position: 'absolute', left: 0, top: 0, height: 14, borderRadius: 999, backgroundColor: '#22C55E' },

   kpiFootRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
   kpiFootText: { color: '#475569' },
   kpiFootTextStrong: { color: '#0f172a', fontSize: 16, fontWeight: '800' },

   histoLegendText: { color: '#334155', fontSize: 16, fontWeight: '800' },
   infoGrid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 14 },
   infoCell: {},
   infoCell2: { width: '48%' },
   infoCell3: { flexBasis: '31%', maxWidth: '31%' },
   infoLabel: { fontSize: 22, color: '#64748B' },
   infoRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6 },
   infoValue: { fontSize: 18, color: '#334155', fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : (Platform.OS === 'android' ? 'monospace' : undefined) },
   pill: {
      backgroundColor: '#F1F5F9',
      borderWidth: 1,
      borderColor: CARD_BORDER,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 2,
      fontWeight: '800',
      color: '#0f172a',
   },
   histogramCard: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginTop: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      alignSelf: 'flex-end',
   },


   progressWrap: { marginTop: 8, marginBottom: 10, position: 'relative' },
   pctAnchor: { position: 'absolute', transform: [{ translateX: -16 }] },
   pctLabel: { color: '#334155', fontWeight: '800' },

   histogramMd: { marginTop: 0, minWidth: 180, alignSelf: 'flex-end' },


   histoLegendPrimary: { color: '#0f172a', fontWeight: '800' },
   histoLegendDivider: { width: 1, height: 16, backgroundColor: '#CBD5E1', marginHorizontal: 10 },
   kpiRowMd: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      columnGap: 4,
   },
   kpiLeft: {
      flexGrow: 0,
      flexShrink: 1,
      minWidth: 0,
   },
   histogram: { flexDirection: 'column', alignItems: 'flex-end', marginTop: 0 },

   histoBarsRow: { flexDirection: 'row', alignItems: 'flex-end', alignSelf: 'flex-end' },

   histoLegendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 2,
      alignSelf: 'stretch',
   },


});
