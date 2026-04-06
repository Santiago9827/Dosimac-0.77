/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAwrConn } from "../../../stores/awrConnStore";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Appbar, Switch } from "react-native-paper";
import Feather from '@expo/vector-icons/Feather';

const BG = "#F6F7FB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const BRAND = "#4F46E5";
const SOFT = "#EEF2FF";
const SOFT_BORDER = "#C7D2FE";
const DANGER = "#DC2626";
const SUCCESS = "#16A34A";

// const ENDPOINT_GESTATION =
//     "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada/gestation";

const ENDPOINT_GESTATION_ENTRADA =
    "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada/gestation";

const ENDPOINT_GESTATION_SALIDA =
    "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada/gestation/exit";

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

type TipoMovimiento = "entrada" | "salida" | "lectura" | "busqueda";
type EstadoIdVisual = "neutro" | "success" | "error";

// ---------- helpers ----------
const normalizarClave = (valor: string) =>
    valor.trim().toUpperCase().replace(/\s+/g, "");

const parseNumeroSeguro = (txt: string) => {
    const n = Number(txt);
    return Number.isFinite(n) ? n : null;
};



async function postGestation(
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
const InfoRow = ({
    icon,
    label,
    value,
}: {
    icon: any;
    label: string;
    value: string;
}) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Ionicons name={icon} size={18} color={MUTED} />
        <Text style={{ color: MUTED, fontWeight: "800", width: 160 }}>{label}</Text>
        <Text style={{ color: TEXT, fontWeight: "900", flex: 1, textAlign: "right" }}>{value}</Text>
    </View>
);

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
    textoSecundario,
}: {
    icon?: string;
    usarFeather?: boolean;
    titulo: string;
    valor: string;
    fondo: string;
    borde: string;
    colorTitulo: string;
    colorValor: string;
    textoSecundario?: string;
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

        {!!textoSecundario && (
            <Text
                style={{
                    marginTop: 8,
                    color: colorTitulo,
                    fontSize: 13,
                    fontWeight: "700",
                    textAlign: "center",
                }}
            >
                {textoSecundario}
            </Text>
        )}
    </View>
);
// ---------- componente ----------
export const LectorGestacionScreen = () => {
    const navigation = useNavigation<any>();

    // AWR store
    const lectorConectado = useAwrConn((s) => s.isConnected);
    const idLector = useAwrConn((s) => s.currentId);
    const crotalLeido = useAwrConn((s) => s.lastTag);
    const iniciarLectura = useAwrConn((s) => s.startReading);
    const detenerLectura = useAwrConn((s) => s.stopReading);
    const limpiarCrotalLeido = useAwrConn((s) => s.clearLastTag);

    const [detectarDesconocidos, setDetectarDesconocidos] = useState(true);
    const [confirmar, setConfirmar] = useState(true);

    // UI state
    const [corralInput, setCorralInput] = useState("");
    const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>("entrada");
    const [registrosEnviados, setRegistrosEnviados] = useState<RegistroEnviado[]>([]);
    const [estaEnviando, setEstaEnviando] = useState(false);

    const [idRecibido, setIdRecibido] = useState("");
    const [estadoIdVisual, setEstadoIdVisual] = useState<EstadoIdVisual>("neutro");

    const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoEnvioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ultimoCrotalAutoRef = useRef<string | null>(null);

    const route = useRoute<any>();
    const modoParam = route.params?.modo ?? "entrada";
    const corralParam = route.params?.corral ?? "";
    const detectarParam = route.params?.detectarDesconocidos ?? true;
    const confirmarParam = route.params?.confirmar ?? true;
    const valorBusquedaParam = route.params?.valorBusqueda ?? "";
    const animalEncontradoParam = route.params?.animalEncontrado ?? null;

    // paginación
    const TAM_PAGINA = 10;
    const [pagina, setPagina] = useState(0);

    const totalPaginas = Math.max(1, Math.ceil(registrosEnviados.length / TAM_PAGINA));


    const esEntrada = tipoMovimiento === "entrada";
    const esSalida = tipoMovimiento === "salida";
    const esLectura = tipoMovimiento === "lectura";
    const esBusqueda = tipoMovimiento === "busqueda";

    const requiereCorral = esEntrada;
    const usaEnvioAutomatico = !esBusqueda && (esLectura || !confirmar);
    const tiempoAutoEnvioMs = esLectura ? 300 : 1000;

    const itemsPagina = useMemo(() => {
        const start = pagina * TAM_PAGINA;
        return registrosEnviados.slice(start, start + TAM_PAGINA);
    }, [registrosEnviados, pagina]);
    const limpiarAutoEnvioTimer = React.useCallback(() => {
        if (autoEnvioTimerRef.current) {
            clearTimeout(autoEnvioTimerRef.current);
            autoEnvioTimerRef.current = null;
        }
    }, []);


    useEffect(() => {
        const maxPagina = Math.max(0, Math.ceil(registrosEnviados.length / TAM_PAGINA) - 1);
        if (pagina > maxPagina) setPagina(maxPagina);
    }, [registrosEnviados.length, pagina]);

    useEffect(() => {
        return () => {
            if (timerIdRef.current) {
                clearTimeout(timerIdRef.current);
            }
            if (autoEnvioTimerRef.current) {
                clearTimeout(autoEnvioTimerRef.current);
            }
        };
    }, []);
    const mostrarIdTemporal = (valor: string, estado: EstadoIdVisual) => {
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

    // al entrar/salir
    useFocusEffect(
        React.useCallback(() => {
            let mounted = true;

            setRegistrosEnviados([]);
            limpiarCrotalLeido();
            setDetectarDesconocidos(detectarParam);
            setConfirmar(confirmarParam);
            setIdRecibido("");
            setEstadoIdVisual("neutro");

            if (timerIdRef.current) {
                clearTimeout(timerIdRef.current);
            }

            limpiarAutoEnvioTimer();
            ultimoCrotalAutoRef.current = null;

            const mov: TipoMovimiento =
                modoParam === "salida"
                    ? "salida"
                    : modoParam === "lectura"
                        ? "lectura"
                        : modoParam === "busqueda"
                            ? "busqueda"
                            : "entrada";

            setTipoMovimiento(mov);
            setCorralInput(mov === "entrada" ? String(corralParam) : "");

            (async () => {
                if (mov === "busqueda") return;
                if (!idLector) return;

                try {
                    await iniciarLectura();
                } catch {
                    if (!mounted) return;
                }
            })();

            return () => {
                mounted = false;

                if (timerIdRef.current) {
                    clearTimeout(timerIdRef.current);
                }

                limpiarAutoEnvioTimer();
                ultimoCrotalAutoRef.current = null;

                detenerLectura?.().catch(() => { });
            };
        }, [
            idLector,
            iniciarLectura,
            detenerLectura,
            limpiarCrotalLeido,
            modoParam,
            corralParam,
            detectarParam,
            confirmarParam,
            limpiarAutoEnvioTimer,
        ])
    );
    const volverACtiFeed = () => {
        const parent = navigation.getParent?.();
        if (parent?.navigate) parent.navigate("Tabs");
        else navigation.navigate("Tabs");
    };

    const enviarRegistro = React.useCallback(async (crotalForzado?: string) => {
        const requiereCorral = esEntrada;

        const corralTxt = corralInput.trim();
        const crotalTxt = (crotalForzado ?? crotalLeido ?? "").trim();

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
            Alert.alert("Corral inválido", "El corral debe ser un número.");
            return;
        }

        if (crotalNum === null) {
            Alert.alert("Crotal inválido", "El crotal debe ser numérico.");
            return;
        }

        try {
            setEstaEnviando(true);

            const payload = requiereCorral
                ? { corral: corralNum as number, crotal: crotalNum }
                : { crotal: crotalNum };

            const endpointActual = esSalida
                ? ENDPOINT_GESTATION_SALIDA
                : ENDPOINT_GESTATION_ENTRADA;

            const respuesta = await postGestation(endpointActual, payload);

            if (!respuesta.ok) {
                if (respuesta.status === 400) {
                    Alert.alert("No válido", "El corral y/o el crotal que has enviado no existe.");
                    return;
                }

                const detalle =
                    (respuesta.data && (respuesta.data.message || respuesta.data.error)) || respuesta.rawText || `HTTP ${respuesta.status}`;

                Alert.alert("Error al enviar", String(detalle));
                return;
            }

            const idBackendRaw =
                respuesta.data?.id ??
                respuesta.data?.animalId ??
                respuesta.data?.idAnimal ??
                respuesta.data?.identificador ??
                (respuesta.rawText ? respuesta.rawText.replace(/^id\s*/i, "").trim() : null);

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

            setPagina(0);
            limpiarCrotalLeido();
            ultimoCrotalAutoRef.current = null;
        } catch {
            Alert.alert("Error de red", "No se pudo conectar con el servidor.");
        } finally {
            setEstaEnviando(false);
        }
    }, [esEntrada, corralInput, crotalLeido, limpiarCrotalLeido]);

    const onEnviar = () => {
        if (esLectura || !confirmar) return;
        enviarRegistro();
    };
    useEffect(() => {
        const crotalActual = (crotalLeido ?? "").trim();

        if (!usaEnvioAutomatico) {
            limpiarAutoEnvioTimer();
            ultimoCrotalAutoRef.current = null;
            return;
        }

        if (!crotalActual) {
            limpiarAutoEnvioTimer();
            ultimoCrotalAutoRef.current = null;
            return;
        }

        if (estaEnviando) return;

        if (ultimoCrotalAutoRef.current === crotalActual) return;

        limpiarAutoEnvioTimer();
        ultimoCrotalAutoRef.current = crotalActual;

        autoEnvioTimerRef.current = setTimeout(() => {
            enviarRegistro(crotalActual);
        }, tiempoAutoEnvioMs);

        return () => {
            limpiarAutoEnvioTimer();
        };
    }, [
        usaEnvioAutomatico,
        tiempoAutoEnvioMs,
        crotalLeido,
        estaEnviando,
        enviarRegistro,
        limpiarAutoEnvioTimer,
    ]);

    const estilosCajaId = useMemo(() => {
        if (estadoIdVisual === "success") {
            return {
                backgroundColor: "#ECFDF5",
                borderColor: "#BBF7D0",
                colorTexto: SUCCESS,
                colorSubtexto: "#15803D",
                icono: "checkmark-circle-outline" as const,
            };
        }

        if (estadoIdVisual === "error") {
            return {
                backgroundColor: "#FEF2F2",
                borderColor: "#FECACA",
                colorTexto: DANGER,
                colorSubtexto: "#B91C1C",
                icono: "close-circle-outline" as const,
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
                <Appbar.Content title="Lector Gestación" titleStyle={{ color: TEXT }} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14 }}>

                {esBusqueda && (
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
                            <Text style={{ color: TEXT, fontSize: 18, fontWeight: "900" }}>
                                Resultado de búsqueda
                            </Text>
                            <Text style={{ color: MUTED, marginTop: 4 }}>
                                Información devuelta por el backend para el animal encontrado.
                            </Text>
                        </View>

                        <View style={{ padding: 14, gap: 12 }}>
                            <InfoRow
                                icon="search-outline"
                                label="Buscado"
                                value={valorBusquedaParam || "—"}
                            />

                            <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />

                            <InfoRow
                                icon="id-card-outline"
                                label="ID"
                                value={
                                    String(
                                        animalEncontradoParam?.id ??
                                        animalEncontradoParam?.idAnimal ??
                                        animalEncontradoParam?.identificador ??
                                        "—"
                                    )
                                }
                            />

                            <InfoRow
                                icon="barcode-outline"
                                label="Crotal"
                                value={
                                    String(
                                        animalEncontradoParam?.crotal ??
                                        animalEncontradoParam?.tag ??
                                        "—"
                                    )
                                }
                            />

                            <TouchableOpacity
                                onPress={() => navigation.navigate("ConfiguracionGestacion")}
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
                                    Nueva búsqueda
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Resumen */}
                {!esLectura && !esBusqueda && (
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
                                    valor={
                                        tipoMovimiento === "entrada"
                                            ? "Entrada"
                                            : tipoMovimiento === "salida"
                                                ? "Salida"
                                                : tipoMovimiento === "lectura"
                                                    ? "Lectura"
                                                    : "Búsqueda"
                                    }
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
                                onPress={() => navigation.navigate("ConfiguracionGestacion")}
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
                )}

                {/* Card lectura */}
                {!esLectura && !esBusqueda && (
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
                                    El crotal detectado y el ID asociado aparecerán aquí.
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
                                textoSecundario={estadoIdVisual === "error" ? "Animal desconocido" : undefined}
                            />
                        </View>
                    </View>
                )}

                {/* Tabla */}
                {!esBusqueda && (
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
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: TEXT, fontSize: 18, fontWeight: "900" }}>
                                    Registros enviados
                                </Text>

                                {esLectura && !lectorConectado && (
                                    <View
                                        style={{
                                            marginTop: 8,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            alignSelf: "flex-start",
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
                        {esLectura ? (
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
                                        flex: 1,
                                        color: MUTED,
                                        fontWeight: "900",
                                    }}
                                    numberOfLines={1}
                                >
                                    Crotal
                                </Text>

                                <Text
                                    style={{
                                        width: 72,
                                        color: MUTED,
                                        fontWeight: "900",
                                        textAlign: "center",
                                    }}
                                    numberOfLines={1}
                                >
                                    ID
                                </Text>
                            </View>
                        ) : esSalida ? (
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
                                        width: 72,
                                        color: MUTED,
                                        fontWeight: "900",
                                        textAlign: "center",
                                    }}
                                    numberOfLines={1}
                                >
                                    ID
                                </Text>

                                <Text
                                    style={{
                                        flex: 1,
                                        color: MUTED,
                                        fontWeight: "900",
                                        textAlign: "right",
                                    }}
                                    numberOfLines={1}
                                >
                                    Crotal
                                </Text>
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
                                        width: 68,
                                        color: MUTED,
                                        fontWeight: "900",
                                    }}
                                    numberOfLines={1}
                                >
                                    Corral
                                </Text>

                                <Text
                                    style={{
                                        width: 52,
                                        color: MUTED,
                                        fontWeight: "900",
                                        textAlign: "center",
                                        transform: [{ translateX: 26 }],
                                    }}
                                    numberOfLines={1}
                                >
                                    ID
                                </Text>

                                <Text
                                    style={{
                                        flex: 1,
                                        color: MUTED,
                                        fontWeight: "900",
                                        textAlign: "right",
                                        paddingRight: 26,
                                    }}
                                    numberOfLines={1}
                                >
                                    Crotal
                                </Text>
                            </View>
                        )}
                        {registrosEnviados.length === 0 ? (
                            <View style={{ padding: 14 }}>
                                <Text style={{ color: MUTED }}>Aún no has enviado ningún registro.</Text>
                            </View>
                        ) : (
                            itemsPagina.map((r, idx) => (
                                esLectura ? (
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
                                                flex: 1,
                                                color: TEXT,
                                                fontWeight: "700",
                                                fontSize: 15,
                                            }}
                                            numberOfLines={1}
                                            ellipsizeMode="middle"
                                        >
                                            {r.crotal}
                                        </Text>

                                        <Text
                                            style={{
                                                width: 72,
                                                color: r.idBackend === "—" ? DANGER : TEXT,
                                                fontWeight: "700",
                                                textAlign: "center",
                                            }}
                                            numberOfLines={1}
                                        >
                                            {r.idBackend}
                                        </Text>
                                    </View>
                                ) : esSalida ? (
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
                                                width: 72,
                                                color: r.idBackend === "—" ? DANGER : TEXT,
                                                fontWeight: "700",
                                                textAlign: "center",
                                            }}
                                            numberOfLines={1}
                                        >
                                            {r.idBackend}
                                        </Text>

                                        <Text
                                            style={{
                                                flex: 1,
                                                color: TEXT,
                                                fontWeight: "700",
                                                textAlign: "right",
                                                fontSize: 15,
                                            }}
                                            numberOfLines={1}
                                            ellipsizeMode="middle"
                                        >
                                            {r.crotal}
                                        </Text>
                                    </View>
                                ) : (
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
                                                width: 68,
                                                color: TEXT,
                                                fontWeight: "700",
                                            }}
                                            numberOfLines={1}
                                        >
                                            {r.corral}
                                        </Text>

                                        <Text
                                            style={{
                                                width: 52,
                                                color: r.idBackend === "—" ? DANGER : TEXT,
                                                fontWeight: "700",
                                                textAlign: "center",
                                                transform: [{ translateX: 26 }],
                                            }}
                                            numberOfLines={1}
                                        >
                                            {r.idBackend}
                                        </Text>

                                        <Text
                                            style={{
                                                flex: 1,
                                                color: TEXT,
                                                fontWeight: "700",
                                                textAlign: "right",
                                                fontSize: 15,
                                            }}
                                            numberOfLines={1}
                                            ellipsizeMode="middle"
                                        >
                                            {r.crotal}
                                        </Text>
                                    </View>
                                )
                            ))
                        )}
                    </View>
                )}

                {/* Enviar */}
                {!esBusqueda && (

                    <View style={{ marginTop: 12 }}>
                        <TouchableOpacity
                            onPress={onEnviar}
                            disabled={estaEnviando || !confirmar || esLectura}
                            activeOpacity={0.9}
                            style={{
                                height: 46,
                                borderRadius: 14,
                                backgroundColor: esLectura
                                    ? "#CBD5E1"
                                    : !confirmar
                                        ? "#CBD5E1"
                                        : estaEnviando
                                            ? "#A5B4FC"
                                            : BRAND,
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
                                {esLectura
                                    ? "Lectura automática activa"
                                    : !confirmar
                                        ? "Envío automático activo"
                                        : estaEnviando
                                            ? "Enviando..."
                                            : "Enviar"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};