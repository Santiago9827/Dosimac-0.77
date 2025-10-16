import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Pressable, Animated, Dimensions, TextInput } from 'react-native'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { CerdoMaternidad } from '../../../assets'
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { CorralMatInfo } from '../../../libraries/interfaces/corral-Info.interface';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ipServer: string = 'http://192.168.1.238:3010'
const corralInfoUrl: string = ipServer + '/corral/19'

// --- estilos util ---
const CARD_BORDER = '#E2E8F0';
const BRAND = '#4F46E5';

// --- helpers drawer derecho ---
const useRightDrawer = () => {
   const w = Math.min(340, Math.round(Dimensions.get('window').width * 0.88));
   const [open, setOpen] = useState(false);
   const tx = useRef(new Animated.Value(w)).current;
   const show = () => { setOpen(true); Animated.timing(tx, { toValue: 0, duration: 240, useNativeDriver: true }).start(); };
   const hide = () => { Animated.timing(tx, { toValue: w, duration: 220, useNativeDriver: true }).start(({ finished }) => finished && setOpen(false)); };
   return { open, show, hide, tx, width: w };
};

const DrawerItem = ({ label, onPress }: { label: string; onPress: () => void }) => (
   <Pressable onPress={onPress} android_ripple={{ color: '#e5e7eb' }} style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 }}>
      <Text style={{ color: '#0f172a', fontWeight: '600' }}>{label}</Text>
   </Pressable>
);

// --- diálogos reutilizables (mismos de tu otra pantalla) ---
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

const pad2 = (n: number) => String(n).padStart(2, '0');
const todayStr = () => {
   const d = new Date();
   return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

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

export const MatCorralDetail = () => {
   const insets = useSafeAreaInsets();

   const [isDeviceError, setDeviceError] = useState(true)
   const [hasDiasSinAlimentar, setHasDiasSinAlimentar] = useState(true)
   const [corraInfo, setCorralInfo] = useState<CorralMatInfo | null>(null);
   const [requestError, setRequestError] = useState(false);

   // estado “local” para operar con el animal mostrado (no cambia tu UI fija si no quieres)
   const [animalState, setAnimalState] = useState({
      crotal: '123456789',
      curva: 'Multiparas',
      condicion: 'Normal',
      subEstado: 'LACTANCIA',
      subEstadoFecha: todayStr(),
   });

   // drawer y diálogos
   const drawer = useRightDrawer();
   const [dlgCurva, setDlgCurva] = useState(false);
   const [dlgCond, setDlgCond] = useState(false);
   const [dlgSub, setDlgSub] = useState(false);
   const [dlgSalida, setDlgSalida] = useState(false); // placeholder
   const [dlgCrotal, setDlgCrotal] = useState(false);

   const requestInfo = () => {
      console.log("llamada axios:" + corralInfoUrl)
      axios.get(corralInfoUrl)
         .then((response) => {
            console.log(response.data)
            console.log(response.data.animal)
            setCorralInfo(response.data)
         })
         .catch((error) => {
            console.log('Error axios' + error)
            setRequestError(true)
         })
   }

   useEffect(() => { requestInfo() }, [])

   const hasAnimal = !!corraInfo?.animal;

   // acciones del drawer (mismas keys que en tu otra pantalla)
   const openAction = (key: string) => {
      drawer.hide();
      setTimeout(() => {
         if (key === 'curva') setDlgCurva(true);
         else if (key === 'condicionCorporal') setDlgCond(true);
         else if (key === 'subEstado') setDlgSub(true);
         else if (key === 'salidaAnimal') setDlgSalida(true);
         else if (key === 'sustituirCrotal') setDlgCrotal(true);
         else {
            // otras opciones placeholder
         }
      }, 120);
   };

   // handlers de aceptación (actualizan solo estado local)
   const applyCurva = (val: string) => {
      setAnimalState(s => ({ ...s, curva: val }));
      setDlgCurva(false);
   };
   const applyCondicion = (val: string) => {
      setAnimalState(s => ({ ...s, condicion: val }));
      setDlgCond(false);
   };
   const applySubEstado = (estado: string, fecha: string) => {
      setAnimalState(s => ({ ...s, subEstado: estado, subEstadoFecha: fecha }));
      setDlgSub(false);
   };
   const applySalida = (val: string) => {
      // placeholder; cierra dialog
      setDlgSalida(false);
   };
   const applyCrotal = (nuevo: string) => {
      if (!nuevo) return;
      setAnimalState(s => ({ ...s, crotal: nuevo }));
      setDlgCrotal(false);
   };

   return (
      <View style={{ flex: 1 }}>
         <ScrollView className='flex-1 bg-gray-100 ' contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
            <Text>{hasAnimal ? 'hay animal' : 'no hay animal'}</Text>
            <Image source={CerdoMaternidad} className="w-fit h-2/3  absolute translate-x-3 translate-y-60 opacity-40 " />

            <View className='mx-4'>
               {/* Error en el dispositivo del corral */}
               {isDeviceError &&
                  <View className='mt-3 h-8 bg-red-500 rounded-md flex-col justify-center items-center'>
                     <Text className='text-white font-normal text-base'>Error:  El motor no funciona</Text>
                  </View>
               }

               {/* ---- BLOQUE DE INFORMACIÓN: lo dejas tal cual ---- */}
               {/* ID - CROTAL - CICLO */}
               <View className='flex-row justify-between mt-4'>
                  <View className='flex-row items-end'>
                     <Text className='text-base text-gray-500 px-2  bg-gray-200 rounded-full'>ID</Text>
                     <Text className='text-xl text-gray-600 font-semibold'>1235</Text>
                  </View>
                  <View className='flex-row items-end'>
                     <Text className='text-base text-gray-500 px-2  bg-gray-200 rounded-full'>Crotal</Text>
                     <Text className='text-xl text-gray-600 font-semibold'>123456789</Text>
                  </View>
                  <View className='flex-row items-end'>
                     <Text className='text-base text-gray-500 px-2 bg-gray-200 rounded-full'> Cicle</Text>
                     <Text className='text-xl text-gray-600 font-semibold'> 5</Text>
                  </View>
               </View>

               {/* SUBESTADO - DIA */}
               <View className='flex-row justify-between mx-8 mt-6 items-end'>
                  <View className='flex-row flex-1'>
                     <Text className='text-3xl text-blue-900 font-semibold'>Parto</Text>
                  </View>
                  <View className='flex-row flex-1 justify-end '>
                     <Text className='text-base text-gray-500 px-2 bg-gray-200 rounded-full'> Dia</Text>
                     <Text className='text-xl text-gray-600 font-semibold pl-2'>5</Text>
                  </View>
               </View>

               {/* ALIMENTACION */}
               <View className='flex-row justify-between mt-6'>
                  <View className='flex-col'>
                     <View className='flex-row items-baseline'>
                        <Text className='text-6xl text-gray-600 font-semibold tracking-tighter  '>11000</Text>
                        <Text className='text-xl text-gray-600 font-normal ml-1 '>gr</Text>
                     </View>
                     <View className=''>
                        <View className='w-fit h-3 bg-gray-300 rounded-full'></View>
                        <View className='w-10/12 h-3 bg-green-500 rounded-full absolute '></View>
                     </View>
                     <View className='flex-row justify-between'>
                        <Text className='font-normal text-md'>12000 gr</Text>
                        <Text className='font-normal text-md'>92%</Text>
                     </View>
                  </View>

                  <View className='flex-col justify-end'>
                     <View className='flex-row '>
                        <View className='flex-row items-end ml-1'>
                           <View className='h-12 w-2 bg-gray-500 absolute rounded-t-full'></View>
                           <View className='h-10 w-2 bg-green-500 rounded-t-full'></View>
                        </View>
                        <View className='flex-row items-end ml-1'>
                           <View className='h-12 w-2 bg-gray-500 absolute rounded-t-full'></View>
                           <View className='h-12 w-2 bg-green-500 rounded-t-full'></View>
                        </View>
                        <View className='flex-row items-end ml-1'>
                           <View className='h-12 w-2 bg-gray-500 absolute rounded-t-full'></View>
                           <View className='h-5 w-2 bg-red-600 rounded-t-full'></View>
                        </View>
                        <View className='flex-row items-end ml-1'>
                           <View className='h-12 w-2 bg-gray-500 absolute rounded-t-full'></View>
                           <View className='h-12 w-2 bg-green-500 rounded-t-full'></View>
                        </View>
                        <View className='flex-row items-end ml-1'>
                           <View className='h-12 w-6 bg-gray-500 absolute rounded-t-full'></View>
                           <View className='h-5 w-6 bg-green-500 rounded-t-full'></View>
                        </View>
                        <View className='flex-row items-end ml-1'>
                           <View className='h-12 w-2 bg-gray-500  rounded-t-full'></View>
                        </View>
                        <View className='flex-row items-end ml-1'>
                           <View className='h-12 w-2 bg-gray-500  rounded-t-full'></View>
                        </View>
                        <View className='flex-row items-end ml-1'>
                           <View className='h-12 w-2 bg-gray-500  rounded-t-full'></View>
                        </View>
                     </View>
                     <View className='flex-row justify-between'>
                        <Text className='font-normal text-md'>200/600</Text>
                        <Text className='font-normal text-md'>33%</Text>
                     </View>
                  </View>
               </View>

               {/* Aviso días sin alimentar */}
               {hasDiasSinAlimentar &&
                  <View className='mt-4 h-8 bg-red-500 rounded-md flex-col justify-center items-center'>
                     <Text className='text-white font-normal text-base'>2 días sins alimentar</Text>
                  </View>
               }

               {/* Resto informacion animal */}
               <View className='flex-col stretch'>
                  <View className='flex-row justify-between mt-6'>
                     <View className='flex-col'>
                        <Text className='text-lg text-gray-600 font-normal'>Curva</Text>
                        <View className='flex-row'>
                           <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                           <Text className='text-xl text-gray-600 font-bold font-mono'>Multiparas</Text>
                        </View>
                     </View>

                     <View className='flex-col'>
                        <Text className='text-lg text-gray-600 font-normal'>Correción</Text>
                        <View className='flex-row'>
                           <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                           <Text className='text-xl text-gray-600 font-bold font-mono'>100% curva</Text>
                        </View>
                     </View>
                  </View>

                  <View className='flex-row justify-between mt-5'>
                     <View className='flex-col'>
                        <Text className='text-lg text-gray-600 font-normal'>Fecha entrada</Text>
                        <View className='flex-row'>
                           <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                           <Text className='text-xl text-gray-600 font-bold font-mono'>15/10/2025</Text>
                        </View>
                     </View>
                     <View className='flex-col'>
                        <Text className='text-lg text-gray-600 font-normal'>Fecha parto</Text>
                        <View className='flex-row'>
                           <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                           <Text className='text-xl text-gray-600 font-bold font-mono'>12/12/2025</Text>
                        </View>
                     </View>
                  </View>

                  <View className='flex-row justify-between mt-5'>
                     <View className='flex-col'>
                        <Text className='text-lg text-gray-600 font-normal'>Nave</Text>
                        <View className='flex-row'>
                           <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                           <Text className='text-xl text-gray-600 font-bold font-mono'>G-1</Text>
                        </View>
                     </View>
                     <View className='flex-col'>
                        <Text className='text-lg text-gray-600 font-normal'>Corral</Text>
                        <View className='flex-row'>
                           <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                           <Text className='text-xl text-gray-600 font-bold font-mono'>21</Text>
                        </View>
                     </View>
                  </View>

                  <View className='flex-row justify-between mt-5'>
                     <View className='flex-col'>
                        <Text className='text-lg text-gray-600 font-normal'>Última alimentacion</Text>
                        <View className='flex-row'>
                           <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                           <Text className='text-xl text-gray-600 font-bold font-mono'>13/10/2025</Text>
                        </View>
                     </View>
                  </View>
               </View>

               {/* CTA cuando NO hay animal (sigues usándolo aquí arriba) */}
               {!hasAnimal && (
                  <View className='mt-6'>
                     <TouchableOpacity
                        onPress={() => { /* acción para meter animales */ }}
                        activeOpacity={0.9}
                        className='h-12 rounded-md bg-indigo-600 items-center justify-center'
                     >
                        <Text className='text-white font-semibold'>Meter animales</Text>
                     </TouchableOpacity>
                  </View>
               )}
            </View>
         </ScrollView>

         {/* --- Barra inferior SOLO si hay animal --- */}
         {hasAnimal && (
            <View
               style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 + insets.bottom,
                  backgroundColor: 'rgba(248,250,252,0.96)', borderTopWidth: 1, borderTopColor: '#E5E7EB',
               }}
            >
               <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                     onPress={() => drawer.show()}
                     activeOpacity={0.9}
                     style={{ flex: 1, backgroundColor: BRAND, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}
                  >
                     <Text style={{ color: '#fff', fontWeight: '700' }}>Operaciones</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                     onPress={() => setDlgSub(true)}
                     activeOpacity={0.9}
                     style={{ flex: 1, backgroundColor: '#E5E7EB', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}
                  >
                     <Text style={{ color: '#0f172a', fontWeight: '700' }}>Siguiente estado</Text>
                  </TouchableOpacity>
               </View>
            </View>
         )}

         {/* Drawer lateral derecho */}
         <Modal visible={drawer.open} transparent animationType="none" onRequestClose={drawer.hide}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={drawer.hide} />
            <Animated.View
               style={{
                  position: 'absolute', top: 0, bottom: 0, right: 0, width: drawer.width,
                  backgroundColor: '#fff', paddingTop: 14, paddingHorizontal: 12,
                  borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
                  transform: [{ translateX: drawer.tx }],
                  elevation: 12, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
               }}
            >
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Icon name="options-outline" size={18} color="#0f172a" />
                  <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '900', fontSize: 16 }}>Acciones</Text>
               </View>

               <DrawerItem label="Curva" onPress={() => openAction('curva')} />
               <DrawerItem label="Condición corporal" onPress={() => openAction('condicionCorporal')} />
               <DrawerItem label="SubEstado" onPress={() => openAction('subEstado')} />
               <DrawerItem label="Salida animal" onPress={() => openAction('salidaAnimal')} />
               <DrawerItem label="Sustituir crotal" onPress={() => openAction('sustituirCrotal')} />
               <DrawerItem label="Identificador animal anónimo" onPress={() => openAction('identificadorAnonimo')} />
               <DrawerItem label="Salida maternidad" onPress={() => openAction('salidaMaternidad')} />
            </Animated.View>
         </Modal>

         {/* Diálogos */}
         <RadioDialog
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
            options={['SIN SALIDA PROGRAMADA', 'SALIDA PROGRAMADA', 'SALIDA PROGRAMADA CON VACIO TOLVA', 'SALIDA MATERNIDAD']}
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
      </View>
   )
}
