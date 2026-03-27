// /* eslint-disable prettier/prettier */
// import React, { useState } from 'react';
// import {
//   Text,
//   View,
//   TouchableOpacity,
//   Pressable,
//   ScrollView,
//   useWindowDimensions,
//   FlatList,
//   Platform,
//   StyleSheet
// } from 'react-native';
// import type { ViewStyle } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useTranslation } from 'react-i18next';
// import { useNavigation, NavigationProp } from '@react-navigation/native';
// import Ionicons from '@expo/vector-icons/Ionicons';

// import { HamburgerMenu } from '../../components/shared/HamburgerMenu';
// import { DonutChart } from '../../components/shared/DonutChart';

// // ===== Tipos / const =====
// type Incidencia = {
//   id: string | number;
//   area: 'Maternidad' | 'Gestación';
//   corral: string | number;
//   descripcion: string;
// };

// const TAB_MATERNIDAD = 'MaternidadTab';
// const TAB_GESTACION = 'GestacionTab';

// const SURFACE_BG = '#F6F8FC';
// const CARD_BG = '#FFFFFF';
// const CARD_BORDER = '#E6EAF2';
// const BRAND = '#4F46E5';

// const ITEM_BG_SOFT = '#FEE2E2';
// const ITEM_BORDER_SOFT = '#FECACA';
// const PILL_BG_STRONG = '#FCA5A5';
// const PILL_TEXT_STRONG = '#7F1D1D';
// const RIPPLE_RED = 'rgba(127, 29, 29, 0.18)';

// const SHADOW: ViewStyle = {
//   shadowColor: '#000',
//   shadowOpacity: 0.06,
//   shadowRadius: 8,
//   shadowOffset: { width: 0, height: 3 },
//   elevation: 1,
// };

// // === Altura uniforme (colapsado) y nº de líneas ===
// // const CARD_H = 92;
// const DESC_LINES = 2;
// const LINE_H = 18;
// const CHIP_H = 22;
// const PAD_V = 16;
// const GAP = 8;
// const MAX_INCIDENCIAS_WEB = 12;
// const CARD_H = PAD_V + CHIP_H + GAP + (LINE_H * DESC_LINES) + PAD_V; // ≈ 100


// export const HomeScreen = () => {
//   const { t } = useTranslation(['common']);
//   const navigation = useNavigation<NavigationProp<any>>();
//   const insets = useSafeAreaInsets();

//   const { width, height } = useWindowDimensions();
//   const isMd = width >= 768;
//   const isLg = width >= 1024;
//   const isWeb = Platform.OS === 'web';
//   const pagePX = isLg ? 48 : isMd ? 24 : 16;
//   const incHeight = !isMd
//     ? Math.round(Math.max(260, Math.min(420, height * 0.38)))
//     : undefined;

//   // —— Datos demo ——
//   const maternidad = { alimentados: 180, noAlimentados: 20 };
//   const gestacion = { alimentados: 135, noAlimentados: 115 };
//   const totalM = maternidad.alimentados + maternidad.noAlimentados;
//   const totalG = gestacion.alimentados + gestacion.noAlimentados;
//   const pctM = totalM ? Math.round((maternidad.alimentados / totalM) * 100) : 0;
//   const pctG = totalG ? Math.round((gestacion.alimentados / totalG) * 100) : 0;

//   const donutSize = isLg ? 150 : isMd ? 170 : 120;
//   const donutStroke = isLg ? 26 : isMd ? 24 : 22;
//   const statsWidth = isLg ? 240 : 210;
//   const statsTopOffset = isLg ? 16 : isMd ? 12 : 10;
//   const stackGap = isMd ? 32 : 16;

//   const DESC_LINES = 2;
//   const LINE_H = 18;
//   const CHIP_H = 22;
//   const PAD_V = 16;
//   const GAP = 8;
//   const CARD_H = PAD_V + CHIP_H + GAP + (LINE_H * DESC_LINES) + PAD_V; // ≈100px
//   const MAX_INCIDENCIAS_WEB = 12;



//   const StatRowCompact = ({ label, value }: { label: string; value: number }) => (
//     <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, alignSelf: 'stretch' }}>

//       <Text
//         style={{
//           flex: 1,
//           paddingRight: 14,
//           fontSize: 13,
//           color: '#64748B',
//           lineHeight: 18,
//         }}
//         numberOfLines={1}
//         ellipsizeMode="tail"
//       >
//         {label}
//       </Text>

//       <Text
//         style={{
//           minWidth: 36,
//           textAlign: 'right',
//           fontSize: 16,
//           fontWeight: '700',
//           color: '#0F172A',
//           lineHeight: 20,
//         }}
//       >
//         {value}
//       </Text>
//     </View>
//   );

//   const incidencias: Incidencia[] = [
//     { id: 1, area: 'Maternidad', corral: '1', descripcion: 'Bebedero con caudal bajo.' },
//     { id: 2, area: 'Gestación', corral: '2', descripcion: 'Comedero bloqueado Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo.' },
//     { id: 3, area: 'Gestación', corral: '3', descripcion: 'Sensor de paso intermitente Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo.' },
//     { id: 4, area: 'Maternidad', corral: '4', descripcion: 'Puerta sin cierre .' },
//     { id: 5, area: 'Gestación', corral: '5', descripcion: 'Fallo de báscula.' },
//     { id: 6, area: 'Maternidad', corral: '6', descripcion: 'Alarma de temperatura alta.' },
//     { id: 7, area: 'Gestación', corral: '7', descripcion: 'Luz de emergencia encendida.' },
//     { id: 8, area: 'Maternidad', corral: '8', descripcion: 'Fuga de agua detectada.' },
//     { id: 9, area: 'Gestación', corral: '9', descripcion: 'Problema de ventilación.' },
//     { id: 10, area: 'Maternidad', corral: '10', descripcion: 'Alarma de movimiento inusual.' },
//     { id: 11, area: 'Gestación', corral: '11', descripcion: 'Fallo en el sistema de alimentación.' },
//     { id: 12, area: 'Maternidad', corral: '12', descripcion: 'Sensor de humedad fuera de rango.' },
//     { id: 13, area: 'Gestación', corral: '13', descripcion: 'Problema eléctrico detectado' },
//     { id: 14, area: 'Maternidad', corral: '14', descripcion: 'Alarma de intrusión activada.' },
//     { id: 15, area: 'Gestación', corral: '15', descripcion: 'Fallo en el sistema de calefacción.' },
//   ];

//   // —— Estado: IDs expandidos ——
//   const [expandedIds, setExpandedIds] = useState<Set<Incidencia['id']>>(new Set());
//   const toggleExpanded = (id: Incidencia['id']) =>
//     setExpandedIds(prev => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });

//   const SectionTitle = ({ icon, text, count }: { icon: string; text: string; count?: number }) => (
//     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
//       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//         <Ionicons name={icon as any} size={18} color="#0f172a" />
//         <Text
//           style={{
//             marginLeft: 8,
//             color: '#0f172a',
//             fontWeight: '800',
//             fontSize: isLg ? 22 : isMd ? 20 : 18,
//           }}
//         >
//           {text}
//         </Text>
//       </View>
//       {typeof count === 'number' && (
//         <View
//           style={{
//             paddingHorizontal: 8,
//             paddingVertical: 2,
//             borderRadius: 999,
//             backgroundColor: 'rgba(226,232,240,0.7)',
//           }}
//         >
//           <Text style={{ fontSize: 12, color: '#334155' }}>{count}</Text>
//         </View>
//       )}
//     </View>
//   );

//   const IndicadorCard = ({
//     label,
//     alimentados,
//     noAlimentados,
//     percent,
//     headerTitle,
//     headerBg,
//     headerIcon,
//   }: {
//     label: string;
//     alimentados: number;
//     noAlimentados: number;
//     percent: number;
//     headerTitle?: string;
//     headerBg?: string;
//     headerIcon?: string;

//   }) => (
//     <View
//       style={{
//         padding: 0,
//         borderWidth: 1,
//         borderRadius: 16,
//         backgroundColor: CARD_BG,
//         borderColor: CARD_BORDER,
//         overflow: 'hidden',
//         ...SHADOW,
//         minHeight: donutSize + (isLg ? 40 : 32),
//       }}
//     >

//       {/*  Header coloreado */}
//       {headerTitle && (
//         <View
//           style={{
//             backgroundColor: headerBg || '#E0E7FF',
//             paddingHorizontal: 12,
//             paddingVertical: 8,
//             borderBottomWidth: 1,
//             borderBottomColor: CARD_BORDER,
//             flexDirection: 'row',
//             alignItems: 'center',
//             gap: 8,
//           }}
//         >
//           {headerIcon ? <Ionicons name={headerIcon as any} size={16} color="#111827" /> : null}
//           <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827' }} numberOfLines={1}>
//             {headerTitle}
//           </Text>
//         </View>
//       )}

//       <View
//         style={{
//           padding: isLg ? 20 : 16,
//         }}
//       >
//         <View
//           style={{
//             flexDirection: isMd ? 'row' : 'column',
//             alignItems: isMd ? 'flex-start' : 'stretch',
//             gap: stackGap,
//           }}
//         >
//           {/* Donut */}
//           <View
//             style={{
//               width: donutSize,
//               height: donutSize,
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexShrink: 0,
//               alignSelf: isMd ? "auto" : "center"
//             }}
//           >

//             <DonutChart
//               size={donutSize}
//               strokeWidth={donutStroke}
//               label=""
//               segmentA={alimentados}
//               segmentB={noAlimentados}
//               colorA="#22C55E"
//               colorB="#EF4444"
//               lineCap="butt"
//               gapDegrees={0}
//               centerPercent={percent}
//             />
//           </View>

//           {/* Stats */}
//           <View style={[{ flexGrow: 1 }, isMd ? { width: statsWidth, paddingTop: statsTopOffset } : { marginTop: statsTopOffset, alignSelf: 'stretch', width: "100%" }]}>
//             <StatRowCompact label="Alimentados" value={alimentados} />
//             <StatRowCompact label="No Alimentados" value={noAlimentados} />
//             <View style={{ height: 1, marginVertical: 10, backgroundColor: CARD_BORDER }} />
//             <StatRowCompact label="Totales" value={alimentados + noAlimentados} />
//           </View>
//         </View>
//       </View>
//     </View>
//   );


//   // —— Card de incidencia con expand/collapse ——
//   const renderIncidenciaCard = (item: Incidencia) => {
//     const isExpanded = expandedIds.has(item.id);
//     // dentro de renderIncidenciaCard
//     const clampWeb =
//       !isExpanded && Platform.OS === 'web'
//         ? ({
//           display: '-webkit-box',
//           WebkitLineClamp: DESC_LINES,     // nº de líneas visibles
//           WebkitBoxOrient: 'vertical',
//           overflow: 'hidden',
//         } as any)
//         : null;

//     <Text
//       style={[
//         {
//           marginTop: 8,
//           color: '#0f172a',
//           minWidth: 0,
//           lineHeight: 18,
//         },
//         clampWeb, // 👈 aplica sólo en web cuando está colapsado
//       ]}
//       numberOfLines={isExpanded ? undefined : DESC_LINES}
//       ellipsizeMode="tail"
//     >
//       {item.descripcion}
//     </Text>

//     return (
//       <Pressable
//         key={String(item.id)}
//         onPress={() => toggleExpanded(item.id)} // alterna expandir/colapsar
//         android_ripple={{ color: RIPPLE_RED }}
//         style={{
//           borderRadius: 16,
//           padding: 16,
//           borderWidth: 1,
//           backgroundColor: ITEM_BG_SOFT,
//           borderColor: ITEM_BORDER_SOFT,
//           ...SHADOW,

//           // Colapsado: altura uniforme; expandido: auto
//           height: isExpanded ? undefined : CARD_H,
//           minHeight: CARD_H,
//         }}
//         accessibilityRole="button"
//         accessibilityLabel={`Incidencia en ${item.area}, Corral ${item.corral}`}
//         accessibilityHint={isExpanded ? 'Pulsa para contraer' : 'Pulsa para expandir'}
//       >
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <Text
//             style={{
//               paddingHorizontal: 8,
//               paddingVertical: 2,
//               borderRadius: 999,
//               fontSize: 12,
//               fontWeight: '600',
//               backgroundColor: PILL_BG_STRONG,
//               color: PILL_TEXT_STRONG,
//             }}
//           >
//             {item.area}
//           </Text>
//           <Text
//             style={{
//               marginLeft: 8,
//               paddingHorizontal: 8,
//               paddingVertical: 2,
//               borderRadius: 999,
//               backgroundColor: '#F1F5F9',
//               color: '#475569',
//               fontSize: 12,
//             }}
//           >
//             Corral {item.corral}
//           </Text>
//           <View style={{ flex: 1 }} />
//           <Ionicons
//             name={isExpanded ? 'chevron-up' : 'chevron-down'}
//             size={16}
//             color="#7c3aed"
//           />
//         </View>

//         <Text
//           style={[
//             {
//               marginTop: 8,
//               color: '#0f172a',
//               minWidth: 0,
//               lineHeight: 18,
//             },
//             Platform.OS === 'web' ? ({ wordBreak: 'break-word' } as any) : null,
//           ]}
//           numberOfLines={isExpanded ? undefined : DESC_LINES}
//           ellipsizeMode="tail"
//         >
//           {item.descripcion}
//         </Text>

//       </Pressable>
//     );
//   };

//   // —— Navegación ——
//   const goMaternidad = () => navigation.getParent()?.navigate(TAB_MATERNIDAD as never);
//   const goGestacion = () => navigation.getParent()?.navigate(TAB_GESTACION as never);

//   // Grid responsivo incidencias
//   const gridCol = (isLg ? '32%' : isMd ? '48%' : '100%') as any;

//   return (
//     <View style={{ flex: 1, backgroundColor: SURFACE_BG }}>
//       <HamburgerMenu />

//       <ScrollView
//         style={{ flex: 1 }}
//         nestedScrollEnabled
//         contentContainerStyle={{
//           paddingHorizontal: pagePX,
//           paddingTop: 16,
//           paddingBottom: insets.bottom + 24,
//         }}
//         keyboardShouldPersistTaps="handled"
//       >
//         {/* ——— Indicadores ——— */}
//         <View style={{ marginBottom: 12 }}>
//           <View style={{ flexDirection: isMd ? 'row' : 'column', gap: isMd ? 24 : 12, marginBottom: 24 }}>
//             {/* Maternidad */}
//             <Pressable
//               onPress={goMaternidad}
//               android_ripple={{ color: '#dbeafe' }}
//               style={[{ borderRadius: 16, overflow: 'hidden' }, isMd && { flex: 1 }]}
//               accessibilityRole="button"
//               accessibilityLabel="Ir a Maternidad"
//             >
//               <IndicadorCard
//                 label={t('common:Maternidad') || 'Maternidad'}
//                 alimentados={maternidad.alimentados}
//                 noAlimentados={maternidad.noAlimentados}
//                 percent={pctM}
//                 headerTitle={t('common:Maternidad') || 'Maternidad'}
//                 headerBg="#E0E7FF"
//                 headerIcon="paw-outline"
//               />
//             </Pressable>

//             {/* Gestación */}
//             <Pressable
//               onPress={goGestacion}
//               android_ripple={{ color: '#dbeafe' }}
//               style={[{ borderRadius: 16, overflow: 'hidden' }, isMd && { flex: 1 }]}
//               accessibilityRole="button"
//               accessibilityLabel="Ir a Gestación"
//             >
//               <IndicadorCard
//                 label={t('common:Gestación') || 'Gestación'}
//                 alimentados={gestacion.alimentados}
//                 noAlimentados={gestacion.noAlimentados}
//                 percent={pctG}
//                 headerTitle={t('common:Gestación') || 'Gestación'}
//                 headerIcon="paw-outline"
//               />
//             </Pressable>
//           </View>
//         </View>

//         {/* ——— Incidencias ——— */}
//         <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidencias.length} />

//         {/* Aviso de “hay más” solo en Web y vista grid */}
//         {isWeb && isMd && incidencias.length > MAX_INCIDENCIAS_WEB && (
//           <Text style={{ marginBottom: 8, color: '#64748B', fontSize: 12 }}>
//             {MAX_INCIDENCIAS_WEB} de {incidencias.length}.
//           </Text>
//         )}

//         {!isMd ? (
//           // ===== MÓVIL: lista con FlatList =====
//           <View
//             style={{
//               borderWidth: 1,
//               borderRadius: 16,
//               borderColor: CARD_BORDER,
//               backgroundColor: CARD_BG,
//               ...SHADOW,
//               maxHeight: incHeight,
//               marginBottom: 16,
//             }}
//           >
//             <FlatList<Incidencia>
//               data={incidencias}
//               keyExtractor={(i) => String(i.id)}
//               renderItem={({ item }) => renderIncidenciaCard(item)}
//               ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
//               contentContainerStyle={{ padding: 12 }}
//               showsVerticalScrollIndicator
//               nestedScrollEnabled
//               extraData={expandedIds}
//             />
//           </View>
//         ) : (
//           // ===== TABLET/ESCRITORIO: Masonry por columnas =====
//           (() => {
//             const src = isWeb ? incidencias.slice(0, MAX_INCIDENCIAS_WEB) : incidencias;
//             const numCols = isLg ? 3 : 2;

//             // Reparto simple 0,1,2,0,1,2...
//             const cols: Incidencia[][] = Array.from({ length: numCols }, () => []);
//             src.forEach((it, i) => cols[i % numCols].push(it));

//             return (
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'flex-start',
//                   ...(Platform.OS === 'web' ? { gap: 8 } : {}), // 'gap' seguro en web
//                   marginBottom: 16,
//                 }}
//               >
//                 {cols.map((col, ci) => (
//                   <View key={`col-${ci}`} style={{ flex: 1 }}>
//                     {col.map((it, idx) => (
//                       <View key={String(it.id)} style={idx > 0 ? { marginTop: 8 } : undefined}>
//                         {renderIncidenciaCard(it)}
//                       </View>
//                     ))}
//                   </View>
//                 ))}
//               </View>
//             );
//           })()
//         )}



//         {/* CTA inferior */}
//         <TouchableOpacity
//           onPress={() => navigation.getParent()?.navigate('TareasProgramadas' as never)}
//           activeOpacity={0.85}
//           style={[
//             {
//               marginTop: 8,
//               borderRadius: 12,
//               paddingHorizontal: 20,
//               paddingVertical: isMd ? 10 : 12,
//               backgroundColor: BRAND,
//               shadowColor: '#000',
//               shadowOpacity: 0.18,
//               shadowRadius: 8,
//               shadowOffset: { width: 0, height: 4 },
//               elevation: 3,
//             },
//             isMd
//               ? { width: '100%', maxWidth: 580, alignSelf: 'center' }
//               : { alignSelf: 'stretch' },
//           ]}
//         >
//           <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
//             <Ionicons name="calendar" size={18} color="#fff" />
//             <Text style={{ marginLeft: 8, color: '#fff', fontWeight: '600', textAlign: 'center' }}>
//               Tareas Programadas
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };



//----------WebView-----------------------------------
// import React from "react";
// import { View, StyleSheet, Text } from "react-native";
// import { WebView } from "react-native-webview";
// import { HamburgerMenu } from '../../components/shared/HamburgerMenu';


// export const HomeScreen = () => {
//   <HamburgerMenu />
//   return (
//     <View style={styles.container}>
//       <WebView
//         source={{ uri: "http://192.168.10.142:3000/" }}
//         startInLoadingState
//         javaScriptEnabled
//         domStorageEnabled
//         renderError={(errorName) => (
//           <View style={styles.errorContainer}>
//             {/* Esto te ayuda a ver si hay error en vez de pantalla en blanco */}
//             <Text>Error al cargar: {errorName}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 16,
//   },
// });


import React from "react";
import { Text, View } from "react-native";
import { Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HamburgerMenu } from "../../components/shared/HamburgerMenu";
import { farmStore } from "../../../stores/store";
import { globalColors } from "../../theme/theme"; // ajusta la ruta si cambia

export const HomeScreen = () => {
  const sfarm = farmStore((state) => state.farm);
  const { t } = useTranslation(["common"]);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      {/* ✅ Botón drawer (inline) */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 12,
          left: 16,
          zIndex: 50,
        }}
      >
        <HamburgerMenu variant="inline" color={globalColors.primary} size={32} />
      </View>

      <View className="flex-1 flex-col justify-center items-center">
        <Text className="text-6xl text-slate-700 font-bold">DOSIMAC</Text>
        <Text className="text-3xl text-slate-700 font-bold">CTIFEED</Text>

        <View className="flex flex-row pt-10 space-x-1">
          <View className="h-[80px] w-5 rounded-t-lg bg-red-600" />
          <View className="h-[80px] w-5 rounded-t-lg bg-cyan-500" />
          <View className="h-[80px] w-5 rounded-t-lg bg-cyan-600" />
          <View className="h-[80px] w-5 rounded-t-lg bg-cyan-800" />
        </View>

        <View>
          <View className="-mt-[110px] h-5 w-5 rounded-full bg-orange-400" />
        </View>

        <Divider className="w-44 bg-black my-10" />

        {sfarm ? (
          <View className="flex flex-col pt-6 px-6 py-4 rounded-xl border-gray-400">
            <Text className="text-lg mb-2 font-bold text-blue-800 text-center">
              {t("common:Instalación_seleccionada")}
            </Text>
            <Text className="text-lg text-center text-slate-700">{sfarm.name}</Text>
            <Text className="text-lg text-center text-slate-700">{sfarm.location}</Text>
          </View>
        ) : (
          <View className="flex flex-col pt-6 px-6 py-4 rounded-xl border-gray-400">
            <Text className="text-lg mb-2 font-bold text-red-800 text-center">
              {t("common:NoInstalacionSeleccionada")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};