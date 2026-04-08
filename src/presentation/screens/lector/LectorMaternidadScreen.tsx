/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Appbar, Switch } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAwrConn } from "../../../stores/awrConnStore";
import { useRoute, RouteProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import Feather from '@expo/vector-icons/Feather';


type LectorMaternidadParams = {
    modo?: "entrada" | "salida" | "lectura" | "busqueda";
    corral?: string;
    detectarDesconocidos?: boolean;
    confirmar?: boolean;
};

const BG = "#F6F7FB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const BRAND = "#4F46E5";
const SOFT = "#EEF2FF";
const SOFT_BORDER = "#C7D2FE";
const DANGER = "#DC2626";

const ENDPOINT_MATERNITY_ENTRADA = "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada/maternity";

const ENDPOINT_MATERNITY_SALIDA = "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada/maternity/exit"

const SHADOW = {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
};

type RegistroEnviado = {
    localId: string;
    corral: string;
    idBackend: string;
    crotal: string;
};

type TipoMovimiento = "entrada" | "salida";

// ---------- helpers ----------
const normalizarClave = (valor: string) =>
    valor.trim().toUpperCase().replace(/\s+/g, "");

const soloDigitos = (txt: string) => txt.replace(/[^0-9]/g, "");

const parseNumeroSeguro = (txt: string) => {
    const n = Number(txt);
    return Number.isFinite(n) ? n : null;
};

function incrementarCorral(valor: string) {
    const v = valor.trim();
    if (!v) return "1";

    const n = Number(v);
    if (Number.isFinite(n) && String(n) === v) return String(n + 1);

    const match = v.match(/^(.*?)(\d+)\s*$/);
    if (match) {
        const prefix = match[1];
        const num = Number(match[2]);
        if (Number.isFinite(num)) return `${prefix}${num + 1}`;
    }

    return v;
}

async function postMaternity(
    endpoint: string,
    payload: { corral?: number; crotal: number }
) {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    let data: any = null;
    let rawText = "";

    try {
        rawText = await res.text();

        if (rawText) {
            try {
                data = JSON.parse(rawText);
            } catch {
                data = null;
            }
        }
    } catch {
        rawText = "";
        data = null;
    }

    return { ok: res.ok, status: res.status, data, rawText };
}
function upsertRegistroPorCrotal(
    prev: RegistroEnviado[],
    corralNum: number | null,
    crotalNum: number,
    idBackend: string
) {
    const key = normalizarClave(String(crotalNum));
    const idx = prev.findIndex((x) => normalizarClave(x.crotal) === key);

    const corralTexto = corralNum !== null ? String(corralNum) : "—";

    if (idx >= 0) {
        const copia = [...prev];
        const actualizado: RegistroEnviado = {
            ...copia[idx],
            corral: corralTexto,
            crotal: String(crotalNum),
            idBackend: idBackend || "—",
        };
        copia.splice(idx, 1);
        return [actualizado, ...copia];
    }

    return [
        {
            localId: String(Date.now()),
            corral: corralTexto,
            idBackend: idBackend || "—",
            crotal: String(crotalNum),
        },
        ...prev,
    ];
}

// ---------- UI helpers ----------
const SwitchRowReadonly = ({
    title,
    description,
    value,
}: {
    title: string;
    description: string;
    value: boolean;
}) => (
    <View
        style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
        }}
    >
        <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ color: TEXT, fontWeight: "800" }}>{title}</Text>
            <Text style={{ color: MUTED, marginTop: 2, fontSize: 12 }}>
                {description}
            </Text>
        </View>

        <View pointerEvents="none">
            <Switch value={value} onValueChange={() => { }} />
        </View>
    </View>
);

const MiniResumenCard = ({
    icon,
    titulo,
    valor,
}: {
    icon: any;
    titulo: string;
    valor: string;
}) => (
    <View
        style={{
            flex: 1,
            backgroundColor: "#F8FAFF",
            borderWidth: 1,
            borderColor: "#E0E7FF",
            borderRadius: 14,
            padding: 12,
            gap: 8,
        }}
    >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name={icon} size={16} color={BRAND} />
            <Text style={{ color: MUTED, fontWeight: "800", fontSize: 12 }}>
                {titulo}
            </Text>
        </View>

        <Text
            style={{
                color: TEXT,
                fontWeight: "900",
                fontSize: 16,
            }}
            numberOfLines={1}
        >
            {valor}
        </Text>
    </View>
);

const CajaDatoLectura = ({
    icon,
    usarFeather = false,
    titulo,
    valor,
    fondo,
    borde,
    colorTitulo,
    colorValor,
}: {
    icon?: string;
    usarFeather?: boolean;
    titulo: string;
    valor: string;
    fondo: string;
    borde: string;
    colorTitulo: string;
    colorValor: string;
}) => (
    <View
        style={{
            borderRadius: 18,
            borderWidth: 1,
            borderColor: borde,
            backgroundColor: fondo,
            paddingVertical: 18,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 130,
        }}
    >
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
            }}
        >
            {icon ? (
                usarFeather ? (
                    <Feather name={icon as any} size={16} color={colorTitulo} />
                ) : (
                    <Ionicons name={icon as any} size={18} color={colorTitulo} />
                )
            ) : null}

            <Text style={{ color: colorTitulo, fontWeight: "800", fontSize: 16 }}>
                {titulo}
            </Text>
        </View>

        <Text
            style={{
                color: colorValor,
                fontSize: 30,
                fontWeight: "900",
                letterSpacing: 1,
            }}
            numberOfLines={1}
            ellipsizeMode="middle"
        >
            {valor}
        </Text>
    </View>
);
// ---------- componente ----------
export const LectorMaternidadScreen = () => {

    const ANCHO_CORRAL = 60;
    const ANCHO_ID = 56;
    const ANCHO_CROTAL_SALIDA = 150;

    const ESPACIO_CORRAL_ID_ENTRADA = 30;
    const ESPACIO_ID_CROTAL_ENTRADA = 70;

    const ESPACIO_ID_CROTAL_SALIDA = 24;
    const COLOR_LINEA_COLUMNA = "#E2E8F0";
    const PADDING_TABLA_X = 14;

    const LineaVerticalTabla = ({ left }: { left: number }) => (
        <View
            pointerEvents="none"
            style={{
                position: "absolute",
                left,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: COLOR_LINEA_COLUMNA,
                zIndex: 1,
            }}
        />
    );


    const navigation = useNavigation<any>();

    const lectorConectado = useAwrConn((s) => s.isConnected);
    const idLector = useAwrConn((s) => s.currentId);
    const crotalLeido = useAwrConn((s) => s.lastTag);
    const iniciarLectura = useAwrConn((s) => s.startReading);
    const detenerLectura = useAwrConn((s) => s.stopReading);
    const limpiarCrotalLeido = useAwrConn((s) => s.clearLastTag);
    const [idRecibido, setIdRecibido] = useState("");
    const [estadoIdVisual, setEstadoIdVisual] = useState<"neutro" | "success" | "error">("neutro");
    const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);


    const [corralInput, setCorralInput] = useState("");
    const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>("entrada");

    const [registrosEnviados, setRegistrosEnviados] = useState<RegistroEnviado[]>([]);
    const [estaEnviando, setEstaEnviando] = useState(false);

    const [detectarDesconocidos, setDetectarDesconocidos] = useState(true);
    const [confirmar, setConfirmar] = useState(true);

    const esEntrada = tipoMovimiento === "entrada";
    const esSalida = tipoMovimiento === "salida";

    const route = useRoute<RouteProp<Record<string, LectorMaternidadParams>, string>>();
    const params = route.params ?? {};

    const TAM_PAGINA = 10;
    const [pagina, setPagina] = useState(0);

    const totalPaginas = Math.max(1, Math.ceil(registrosEnviados.length / TAM_PAGINA));

    const pageItems = useMemo(() => {
        const start = pagina * TAM_PAGINA;
        return registrosEnviados.slice(start, start + TAM_PAGINA);
    }, [registrosEnviados, pagina]);
    const mostrarIdTemporal = (valor: string, estado: "neutro" | "success" | "error") => {
        if (timerIdRef.current) {
            clearTimeout(timerIdRef.current);
        }

        setIdRecibido(valor);
        setEstadoIdVisual(estado);

        timerIdRef.current = setTimeout(() => {
            setIdRecibido("");
            setEstadoIdVisual("neutro");
        }, 3000);
    };
    useEffect(() => {
        return () => {
            if (timerIdRef.current) {
                clearTimeout(timerIdRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const maxPagina = Math.max(0, Math.ceil(registrosEnviados.length / TAM_PAGINA) - 1);
        if (pagina > maxPagina) setPagina(maxPagina);
    }, [registrosEnviados.length, pagina]);


    useFocusEffect(
        React.useCallback(() => {
            const modoInicial: TipoMovimiento =
                params.modo === "salida" ? "salida" : "entrada";

            setTipoMovimiento(modoInicial);
            setCorralInput(
                modoInicial === "entrada" && params.corral
                    ? soloDigitos(String(params.corral))
                    : ""
            );
            setDetectarDesconocidos(params.detectarDesconocidos ?? true);
            setConfirmar(params.confirmar ?? true);

            setRegistrosEnviados([]);
            limpiarCrotalLeido();

            (async () => {
                if (!idLector) return;
                try {
                    await iniciarLectura();
                } catch { }
            })();

            return () => {
                detenerLectura?.().catch(() => { });
            };
        }, [
            params?.modo,
            params?.corral,
            params?.detectarDesconocidos,
            params?.confirmar,
            idLector,
            iniciarLectura,
            detenerLectura,
            limpiarCrotalLeido,
        ])
    );

    const volverACtiFeed = () => {
        const parent = navigation.getParent?.();
        if (parent?.navigate) parent.navigate("Tabs");
        else navigation.navigate("Tabs");
    };

    const onEnviar = async () => {
        const requiereCorral = esEntrada;

        const corralTxt = corralInput.trim();
        const crotalTxt = (crotalLeido ?? "").trim();

        if (requiereCorral && !corralTxt) {
            Alert.alert("Falta corral", "Escribe el corral antes de enviar.");
            return;
        }

        if (!crotalTxt) {
            Alert.alert("Falta crotal", "Acerca el crotal al lector antes de enviar.");
            return;
        }

        const corralNum = requiereCorral ? parseNumeroSeguro(corralTxt) : null;
        const crotalNum = parseNumeroSeguro(crotalTxt);

        if (requiereCorral && corralNum === null) {
            Alert.alert("Corral inválido", "El corral debe ser un número (ej: 8).");
            return;
        }

        if (crotalNum === null) {
            Alert.alert("Crotal inválido", "El crotal debe ser numérico.");
            return;
        }

        try {
            setEstaEnviando(true);

            const endpointActual = esSalida
                ? ENDPOINT_MATERNITY_SALIDA
                : ENDPOINT_MATERNITY_ENTRADA;

            const payload = esSalida
                ? { crotal: crotalNum }
                : { corral: corralNum as number, crotal: crotalNum };

            const r = await postMaternity(endpointActual, payload);

            if (!r.ok) {
                if (r.status === 400) {
                    Alert.alert("No válido", "El corral y/o el crotal que has enviado no existe.");
                    return;
                }

                const detalle =
                    (r.data && typeof r.data === "object" && (r.data.message || r.data.error)) ||
                    r.rawText ||
                    `HTTP ${r.status}`;

                Alert.alert("Error al enviar", String(detalle));
                return;
            }

            const idBackendRaw =
                typeof r.data === "number" || typeof r.data === "string"
                    ? r.data
                    : r.data?.id ??
                    r.data?.animalId ??
                    r.data?.idAnimal ??
                    r.data?.identificador ??
                    (r.rawText ? r.rawText.replace(/^id\s*/i, "").trim() : null);

            const idBackendTexto =
                idBackendRaw !== null &&
                    idBackendRaw !== undefined &&
                    String(idBackendRaw).trim() !== ""
                    ? String(idBackendRaw)
                    : "—";

            if (idBackendTexto !== "—") {
                mostrarIdTemporal(idBackendTexto, "success");
            } else {
                mostrarIdTemporal("—", "error");
            }

            setRegistrosEnviados((prev) =>
                upsertRegistroPorCrotal(prev, corralNum, crotalNum, idBackendTexto)
            );

            if (esEntrada) {
                setCorralInput((prev) => incrementarCorral(prev));
            }

            setPagina(0);
            limpiarCrotalLeido();
        } catch {
            Alert.alert("Error de red", "No se pudo conectar con el servidor.");
        } finally {
            setEstaEnviando(false);
        }
    };
    const estilosCajaId = useMemo(() => {
        if (estadoIdVisual === "success") {
            return {
                backgroundColor: "#ECFDF5",
                borderColor: "#BBF7D0",
                colorTexto: "#16A34A",
                colorSubtexto: "#15803D",
                icono: "checkmark-circle-outline" as const,
            };
        }

        if (estadoIdVisual === "error") {
            return {
                backgroundColor: "#FEF2F2",
                borderColor: "#FECACA",
                colorTexto: "#DC2626",
                colorSubtexto: "#B91C1C",
                icono: "alert-circle-outline" as const,
            };
        }

        return {
            backgroundColor: "#F1F5F9",
            borderColor: BORDER,
            colorTexto: TEXT,
            colorSubtexto: MUTED,
            icono: "id-card-outline" as const,
        };
    }, [estadoIdVisual]);

    return (
        <View style={{ flex: 1, backgroundColor: BG }}>
            <Appbar.Header
                elevated
                style={{
                    backgroundColor: "#fff",
                    borderBottomWidth: 1,
                    borderBottomColor: BORDER,
                }}
            >
                <Appbar.BackAction color={TEXT} onPress={volverACtiFeed} />
                <Appbar.Content title="Lector Maternidad" titleStyle={{ color: TEXT }} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14 }}>
                {/* Resumen */}
                <View
                    style={{
                        backgroundColor: CARD,
                        borderRadius: 18,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: BORDER,
                        ...SHADOW,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: SOFT,
                            padding: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: SOFT_BORDER,
                        }}
                    >
                        <Text style={{ color: TEXT, fontSize: 18, fontWeight: "900" }}>Resumen</Text>
                        <Text style={{ color: MUTED, marginTop: 4 }}>
                            Parámetros elegidos en Configuración
                        </Text>
                    </View>

                    <View style={{ padding: 14, gap: 12 }}>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <MiniResumenCard
                                icon="swap-horizontal-outline"
                                titulo="Modo"
                                valor={tipoMovimiento === "entrada" ? "Entrada" : "Salida"}
                            />

                            <MiniResumenCard
                                icon="home-outline"
                                titulo="Corral"
                                valor={corralInput || "—"}
                            />
                        </View>

                        <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />

                        <SwitchRowReadonly
                            title="Identificar animales desconocidos"
                            description="Cuando salga un animal sin ID, ofrecer asignarle un ID."
                            value={detectarDesconocidos}
                        />

                        <SwitchRowReadonly
                            title="Confirmar envío"
                            description="Pedirá confirmación antes de enviar cada registro."
                            value={confirmar}
                        />

                        <TouchableOpacity
                            onPress={() => navigation.navigate("ConfiguracionLectura")}
                            activeOpacity={0.9}
                            style={{
                                marginTop: 6,
                                height: 42,
                                borderRadius: 12,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#E5E7EB",
                            }}
                        >
                            <Text style={{ color: TEXT, fontWeight: "900" }}>
                                Cambiar configuración
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Lectura actual */}
                <View
                    style={{
                        backgroundColor: CARD,
                        borderRadius: 18,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: BORDER,
                        ...SHADOW,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "#F8FAFF",
                            padding: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: "#E0E7FF",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: TEXT, fontSize: 19, fontWeight: "900" }}>
                                Lectura actual
                            </Text>
                            <Text style={{ color: MUTED, marginTop: 4 }}>
                                El crotal detectado aparecerá aquí.
                            </Text>
                        </View>

                        {!lectorConectado && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 999,
                                    backgroundColor: "#FEF2F2",
                                    borderWidth: 1,
                                    borderColor: "#FECACA",
                                }}
                            >
                                <Ionicons name="alert-circle-outline" size={16} color={DANGER} />
                                <Text style={{ color: DANGER, fontWeight: "900", fontSize: 12 }}>
                                    AWR no conectado
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={{ padding: 14, gap: 12 }}>
                        <CajaDatoLectura
                            icon="barcode-outline"
                            titulo="Crotal leído"
                            valor={crotalLeido ? String(crotalLeido) : "—"}
                            fondo="#F8FAFF"
                            borde="#E2E8F0"
                            colorTitulo="#64748B"
                            colorValor={TEXT}
                        />

                        <CajaDatoLectura
                            icon={
                                estadoIdVisual === "success"
                                    ? "checkmark-circle-outline"
                                    : estadoIdVisual === "error"
                                        ? "alert-circle-outline"
                                        : "hash"
                            }
                            usarFeather={estadoIdVisual === "neutro"}
                            titulo="ID"
                            valor={idRecibido ? String(idRecibido) : "—"}
                            fondo={estilosCajaId.backgroundColor}
                            borde={estilosCajaId.borderColor}
                            colorTitulo={estilosCajaId.colorSubtexto}
                            colorValor={estilosCajaId.colorTexto}
                        />
                    </View>
                </View>



                {/* Tabla */}
                <View
                    style={{
                        marginTop: 12,
                        backgroundColor: CARD,
                        borderRadius: 18,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: BORDER,
                        ...SHADOW,
                    }}
                >
                    <View
                        style={{
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            backgroundColor: "#F8FAFF",
                            borderBottomWidth: 1,
                            borderBottomColor: "#E0E7FF",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                        }}
                    >
                        <Text style={{ color: TEXT, fontSize: 18, fontWeight: "900" }}>
                            Registros enviados
                        </Text>

                        {registrosEnviados.length > TAM_PAGINA && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() => setPagina((p) => Math.max(0, p - 1))}
                                    disabled={pagina === 0}
                                    activeOpacity={0.9}
                                    style={{
                                        paddingVertical: 12,
                                        paddingHorizontal: 18,
                                        borderRadius: 12,
                                        backgroundColor: pagina === 0 ? "#E5E7EB" : BRAND,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: pagina === 0 ? "#6B7280" : "white",
                                            fontWeight: "900",
                                        }}
                                    >
                                        {"<"}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={{ color: MUTED, fontWeight: "900" }}>
                                    {pagina + 1}/{totalPaginas}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                                    disabled={pagina >= totalPaginas - 1}
                                    activeOpacity={0.9}
                                    style={{
                                        paddingVertical: 12,
                                        paddingHorizontal: 18,
                                        borderRadius: 12,
                                        backgroundColor: pagina >= totalPaginas - 1 ? "#E5E7EB" : BRAND,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: pagina >= totalPaginas - 1 ? "#6B7280" : "white",
                                            fontWeight: "900",
                                        }}
                                    >
                                        {">"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={{ position: "relative" }}>
                        {esEntrada && (
                            <>
                                <LineaVerticalTabla
                                    left={PADDING_TABLA_X + ANCHO_CORRAL + ESPACIO_CORRAL_ID_ENTRADA / 2}
                                />
                                <LineaVerticalTabla
                                    left={
                                        PADDING_TABLA_X +
                                        ANCHO_CORRAL +
                                        ESPACIO_CORRAL_ID_ENTRADA +
                                        ANCHO_ID +
                                        ESPACIO_ID_CROTAL_ENTRADA / 2
                                    }
                                />
                            </>
                        )}

                        {esSalida && (
                            <LineaVerticalTabla
                                left={PADDING_TABLA_X + ANCHO_ID + ESPACIO_ID_CROTAL_SALIDA / 2}
                            />
                        )}

                        {esSalida ? (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    borderBottomWidth: 1,
                                    borderBottomColor: BORDER,
                                    backgroundColor: "#FFFFFF",
                                }}
                            >
                                <Text
                                    style={{
                                        width: ANCHO_ID,
                                        color: MUTED,
                                        fontWeight: "900",
                                        textAlign: "center",
                                    }}
                                    numberOfLines={1}
                                >
                                    ID
                                </Text>

                                <View style={{ width: ESPACIO_ID_CROTAL_SALIDA }} />

                                <View style={{ flex: 1, alignItems: "flex-end" }}>
                                    <Text
                                        style={{
                                            width: ANCHO_CROTAL_SALIDA,
                                            color: MUTED,
                                            fontWeight: "900",
                                            textAlign: "left",
                                        }}
                                        numberOfLines={1}
                                    >
                                        Crotal
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    borderBottomWidth: 1,
                                    borderBottomColor: BORDER,
                                    backgroundColor: "#FFFFFF",
                                }}
                            >
                                <Text
                                    style={{
                                        width: ANCHO_CORRAL,
                                        color: MUTED,
                                        fontWeight: "900",
                                    }}
                                    numberOfLines={1}
                                >
                                    Corral
                                </Text>

                                <View style={{ width: ESPACIO_CORRAL_ID_ENTRADA }} />

                                <Text
                                    style={{
                                        width: ANCHO_ID,
                                        color: MUTED,
                                        fontWeight: "900",
                                        textAlign: "center",
                                    }}
                                    numberOfLines={1}
                                >
                                    ID
                                </Text>

                                <View style={{ width: ESPACIO_ID_CROTAL_ENTRADA }} />

                                <View style={{ flex: 1, alignItems: "flex-start" }}>
                                    <Text
                                        style={{
                                            color: MUTED,
                                            fontWeight: "900",
                                            textAlign: "left",
                                        }}
                                        numberOfLines={1}
                                    >
                                        Crotal
                                    </Text>
                                </View>
                            </View>
                        )}

                        {registrosEnviados.length === 0 ? (
                            <View style={{ padding: 14 }}>
                                <Text style={{ color: MUTED }}>Aún no has enviado ningún registro.</Text>
                            </View>
                        ) : (
                            pageItems.map((r, idx) =>
                                esSalida ? (
                                    <View
                                        key={r.localId}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            paddingVertical: 12,
                                            paddingHorizontal: 14,
                                            borderTopWidth: 1,
                                            borderTopColor: "#F1F5F9",
                                            backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFF",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                width: ANCHO_ID,
                                                color: r.idBackend === "—" ? DANGER : TEXT,
                                                fontWeight: "700",
                                                textAlign: "center",
                                            }}
                                            numberOfLines={1}
                                        >
                                            {r.idBackend}
                                        </Text>

                                        <View style={{ width: ESPACIO_ID_CROTAL_SALIDA }} />

                                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                                            <Text
                                                style={{
                                                    width: ANCHO_CROTAL_SALIDA,
                                                    color: TEXT,
                                                    fontWeight: "700",
                                                    textAlign: "left",
                                                    fontSize: 15,
                                                }}
                                                numberOfLines={1}
                                                ellipsizeMode="middle"
                                            >
                                                {r.crotal}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View
                                        key={r.localId}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "flex-start",
                                            paddingVertical: 12,
                                            paddingHorizontal: 14,
                                            borderTopWidth: 1,
                                            borderTopColor: "#F1F5F9",
                                            backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFF",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                width: ANCHO_CORRAL,
                                                color: TEXT,
                                                fontWeight: "700",
                                            }}
                                            numberOfLines={1}
                                        >
                                            {r.corral}
                                        </Text>

                                        <View style={{ width: ESPACIO_CORRAL_ID_ENTRADA }} />

                                        <Text
                                            style={{
                                                width: ANCHO_ID,
                                                color: r.idBackend === "—" ? DANGER : TEXT,
                                                fontWeight: "700",
                                                textAlign: "center",
                                            }}
                                            numberOfLines={1}
                                        >
                                            {r.idBackend}
                                        </Text>

                                        <View style={{ width: ESPACIO_ID_CROTAL_ENTRADA }} />

                                        <View style={{ flex: 1, alignItems: "flex-start" }}>
                                            <Text
                                                style={{
                                                    color: TEXT,
                                                    fontWeight: "700",
                                                    textAlign: "left",
                                                    fontSize: 14,
                                                    flexShrink: 1,
                                                }}
                                            >
                                                {r.crotal}
                                            </Text>
                                        </View>
                                    </View>
                                )
                            )
                        )}
                    </View>
                </View>
                {/* Enviar */}
                <View style={{ marginTop: 12 }}>
                    <TouchableOpacity
                        onPress={onEnviar}
                        disabled={estaEnviando}
                        activeOpacity={0.9}
                        style={{
                            height: 46,
                            borderRadius: 14,
                            backgroundColor: estaEnviando ? "#A5B4FC" : BRAND,
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: 10,
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 3 },
                            elevation: 2,
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>
                            {estaEnviando ? "Enviando..." : "Enviar"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};