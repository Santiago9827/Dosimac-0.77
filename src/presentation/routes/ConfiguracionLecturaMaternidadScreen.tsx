/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import {
    Appbar,
    Button,
    Card,
    Divider,
    Switch,
    Text,
    TextInput,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { awrStore } from "../../stores/awrStore";
import { useAwrConn } from "../../stores/awrConnStore";
import { obtenerLecturaEspada, obtenerAnimalPorId } from "../routes/obtenerLecturaEspada";

type Modo = "entrada" | "salida" | "lectura" | "busqueda";

const BRAND = "#0F766E";
const BG = "#F6F7FB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT = "#0F172A";
const MUTED = "#64748B";

function OptionCard({
    label,
    icon,
    active,
    onPress,
}: {
    label: string;
    icon: any;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <View
            style={{
                flex: 1,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: active ? BRAND : BORDER,
                backgroundColor: active ? "#ECFDF5" : "#fff",
                overflow: "hidden",
            }}
        >
            <Button
                onPress={onPress}
                mode="text"
                contentStyle={{
                    height: 46,
                    justifyContent: "flex-start",
                    paddingLeft: 10,
                }}
                labelStyle={{
                    color: TEXT,
                    fontWeight: "800",
                    textAlign: "left",
                }}
                icon={() => (
                    <Ionicons
                        name={icon}
                        size={18}
                        color={active ? BRAND : MUTED}
                        style={{ marginRight: 4 }}
                    />
                )}
            >
                {label}
            </Button>

            {active && (
                <View style={{ height: 3, backgroundColor: BRAND, opacity: 0.9 }} />
            )}
        </View>
    );
}

export const ConfiguracionLecturaMaternidadScreen = () => {
    const navigation = useNavigation<any>();

    const lectorConectado = useAwrConn((s) => s.isConnected);
    const crotalLeido = useAwrConn((s) => s.lastTag);
    const iniciarLectura = useAwrConn((s) => s.startReading);
    const detenerLectura = useAwrConn((s) => s.stopReading);
    const limpiarCrotalLeido = useAwrConn((s) => s.clearLastTag);

    const espadasGuardadas = awrStore((s) => s.devices);
    const hayEspadasGuardadas = espadasGuardadas.length > 0;

    const [modo, setModo] = useState<Modo>("entrada");
    const [corral, setCorral] = useState("");
    const [detectarDesconocidos, setDetectarDesconocidos] = useState(true);
    const [confirmar, setConfirmar] = useState(true);

    const [tipoBusqueda, setTipoBusqueda] = useState<"crotal" | "id">("crotal");
    const [origenBusquedaCrotal, setOrigenBusquedaCrotal] = useState<"manual" | "espada">("manual");
    const [valorBusqueda, setValorBusqueda] = useState("");

    const [buscandoAnimal, setBuscandoAnimal] = useState(false);
    const [leyendoBusquedaEspada, setLeyendoBusquedaEspada] = useState(false);
    const [esperandoCoincidencia, setEsperandoCoincidencia] = useState(false);

    const [animalPendiente, setAnimalPendiente] = useState<any | null>(null);
    const [crotalEsperado, setCrotalEsperado] = useState("");

    const requiereCorral = modo === "entrada";
    const requiereBusqueda = modo === "busqueda";

    const irAConfiguracionAwr = () => {
        navigation.navigate(hayEspadasGuardadas ? "AWR-SAVED" : "AWR-STARTSCAN");
    };

    const resetEstadoBusqueda = async () => {
        setBuscandoAnimal(false);
        setLeyendoBusquedaEspada(false);
        setEsperandoCoincidencia(false);
        setAnimalPendiente(null);
        setCrotalEsperado("");
        limpiarCrotalLeido();

        try {
            await detenerLectura?.();
        } catch { }
    };

    useEffect(() => {
        return () => {
            detenerLectura?.().catch(() => { });
        };
    }, [detenerLectura]);

    useEffect(() => {
        resetEstadoBusqueda();
    }, [modo, tipoBusqueda, origenBusquedaCrotal]);

    const puedeContinuar = useMemo(() => {
        if (requiereCorral) return corral.trim().length > 0;

        if (requiereBusqueda) {
            if (tipoBusqueda === "crotal" && origenBusquedaCrotal === "espada") {
                return lectorConectado;
            }
            return valorBusqueda.trim().length > 0;
        }

        return true;
    }, [
        requiereCorral,
        requiereBusqueda,
        corral,
        valorBusqueda,
        tipoBusqueda,
        origenBusquedaCrotal,
        lectorConectado,
    ]);

    const prepararEsperaCoincidencia = async (animal: any) => {
        const crotalAnimal =
            animal?.crotal !== null &&
                animal?.crotal !== undefined &&
                String(animal.crotal).trim() !== ""
                ? String(animal.crotal).trim()
                : "";

        if (!crotalAnimal) {
            Alert.alert("Error", "El backend no devolvió un crotal válido para comparar.");
            return false;
        }

        if (!lectorConectado) {
            Alert.alert("AWR no conectado", "Conecta una espada antes de continuar.");
            return false;
        }

        try {
            setAnimalPendiente(animal);
            setCrotalEsperado(crotalAnimal);
            setEsperandoCoincidencia(true);

            limpiarCrotalLeido();
            await iniciarLectura();

            return true;
        } catch {
            Alert.alert("Error", "No se pudo iniciar la lectura con la espada.");
            setEsperandoCoincidencia(false);
            setAnimalPendiente(null);
            setCrotalEsperado("");
            return false;
        }
    };

    const onContinuar = async () => {
        if (modo === "busqueda") {
            try {
                setBuscandoAnimal(true);

                if (tipoBusqueda === "crotal" && origenBusquedaCrotal === "espada") {
                    if (!lectorConectado) {
                        Alert.alert("AWR no conectado", "Conecta una espada antes de continuar.");
                        return;
                    }

                    setLeyendoBusquedaEspada(true);
                    limpiarCrotalLeido();

                    try {
                        await iniciarLectura();
                    } catch {
                        Alert.alert("Error", "No se pudo iniciar la lectura con la espada.");
                        setLeyendoBusquedaEspada(false);
                    }

                    return;
                }

                const valor = valorBusqueda.trim();

                if (!valor) {
                    Alert.alert(
                        "Falta dato",
                        tipoBusqueda === "crotal"
                            ? "Escribe un crotal para buscar."
                            : "Escribe un ID para buscar."
                    );
                    return;
                }

                const r =
                    tipoBusqueda === "crotal"
                        ? await obtenerLecturaEspada(valor)
                        : await obtenerAnimalPorId(valor);

                if (!r.ok) {
                    if (r.status === 404) {
                        Alert.alert(
                            "No encontrado",
                            tipoBusqueda === "crotal"
                                ? "No existe ningún animal con ese crotal."
                                : "No existe ningún animal con ese ID."
                        );
                        return;
                    }

                    const detalle =
                        typeof r.data === "string"
                            ? r.data
                            : r.data?.message ||
                            r.data?.error ||
                            r.data?.mensaje ||
                            r.rawText ||
                            `HTTP ${r.status}`;

                    if (r.status === 400) {
                        Alert.alert("Aviso", String(detalle));
                        return;
                    }

                    Alert.alert("Error en la búsqueda", String(detalle));
                    return;
                }

                const animalEncontrado = r.data ?? null;

                if (!animalEncontrado) {
                    Alert.alert(
                        "No encontrado",
                        tipoBusqueda === "crotal"
                            ? "No existe ningún animal con ese crotal."
                            : "No existe ningún animal con ese ID."
                    );
                    return;
                }

                const ok = await prepararEsperaCoincidencia(animalEncontrado);
                if (!ok) return;

                return;
            } catch {
                Alert.alert("Error de red", "No se pudo conectar con el servidor.");
                return;
            } finally {
                setBuscandoAnimal(false);
            }
        }

        navigation.navigate("LectorMaternidad", {
            modo,
            corral: corral.trim(),
            detectarDesconocidos,
            confirmar,
        });
    };

    useEffect(() => {
        const crotalActual = String(crotalLeido ?? "").trim();

        if (!leyendoBusquedaEspada || !crotalActual) return;

        let cancelado = false;

        const ejecutarBusqueda = async () => {
            try {
                const r = await obtenerLecturaEspada(crotalActual);

                if (cancelado) return;

                if (!r.ok) {
                    setLeyendoBusquedaEspada(false);

                    if (r.status === 404) {
                        Alert.alert("No encontrado", "No existe ningún animal con ese crotal.");
                        return;
                    }

                    const detalle =
                        typeof r.data === "string"
                            ? r.data
                            : r.data?.message ||
                            r.data?.error ||
                            r.data?.mensaje ||
                            r.rawText ||
                            `HTTP ${r.status}`;

                    if (r.status === 400) {
                        Alert.alert("Aviso", String(detalle));
                        return;
                    }

                    Alert.alert("Error en la búsqueda", String(detalle));
                    return;
                }

                const animalEncontrado = r.data ?? null;

                if (!animalEncontrado) {
                    setLeyendoBusquedaEspada(false);
                    Alert.alert("No encontrado", "No existe ningún animal con ese crotal.");
                    return;
                }

                setLeyendoBusquedaEspada(false);
                limpiarCrotalLeido();
                detenerLectura?.().catch(() => { });

                navigation.navigate("LectorMaternidad", {
                    modo: "busqueda",
                    tipoBusqueda: "crotal",
                    origenBusquedaCrotal: "espada",
                    valorBusqueda: String(animalEncontrado?.crotal ?? crotalActual),
                    animalEncontrado,
                });
            } catch {
                if (cancelado) return;
                setLeyendoBusquedaEspada(false);
                Alert.alert("Error de red", "No se pudo conectar con el servidor.");
            }
        };

        ejecutarBusqueda();

        return () => {
            cancelado = true;
        };
    }, [leyendoBusquedaEspada, crotalLeido, navigation, limpiarCrotalLeido, detenerLectura]);

    useEffect(() => {
        const leido = String(crotalLeido ?? "").trim();
        const esperado = String(crotalEsperado ?? "").trim();

        if (!esperandoCoincidencia || !animalPendiente || !leido || !esperado) return;
        if (leido !== esperado) return;

        setEsperandoCoincidencia(false);
        limpiarCrotalLeido();
        detenerLectura?.().catch(() => { });

        navigation.navigate("LectorMaternidad", {
            modo: "busqueda",
            tipoBusqueda,
            origenBusquedaCrotal,
            valorBusqueda,
            animalEncontrado: animalPendiente,
        });
    }, [
        esperandoCoincidencia,
        animalPendiente,
        crotalLeido,
        crotalEsperado,
        navigation,
        limpiarCrotalLeido,
        detenerLectura,
        tipoBusqueda,
        origenBusquedaCrotal,
        valorBusqueda,
    ]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: BG }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={90}
        >
            <Appbar.Header elevated style={{ backgroundColor: BRAND }}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Configuración Maternidad" titleStyle={{ color: "white" }} />
            </Appbar.Header>

            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: 16,
                    gap: 12,
                    paddingBottom: 24,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Card mode="contained" style={{ borderRadius: 18, backgroundColor: CARD }}>
                    <Card.Content>
                        <Text style={{ fontSize: 18, fontWeight: "900", color: TEXT }}>
                            Elige una opción
                        </Text>
                        <Text style={{ marginTop: 4, color: MUTED }}>
                            Define el flujo antes de empezar con el lector.
                        </Text>

                        <View style={{ height: 12 }} />

                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <OptionCard
                                label="Entrada"
                                icon="log-in-outline"
                                active={modo === "entrada"}
                                onPress={() => setModo("entrada")}
                            />
                            <OptionCard
                                label="Salida"
                                icon="log-out-outline"
                                active={modo === "salida"}
                                onPress={() => setModo("salida")}
                            />
                        </View>

                        <View style={{ height: 10 }} />

                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <OptionCard
                                label="Lectura"
                                icon="barcode-outline"
                                active={modo === "lectura"}
                                onPress={() => setModo("lectura")}
                            />
                            <OptionCard
                                label="Búsqueda"
                                icon="search-outline"
                                active={modo === "busqueda"}
                                onPress={() => setModo("busqueda")}
                            />
                        </View>
                    </Card.Content>
                </Card>

                {(modo === "entrada" || modo === "salida") && (
                    <Card mode="contained" style={{ borderRadius: 18, backgroundColor: CARD }}>
                        <Card.Content>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Ionicons name="options-outline" size={18} color={BRAND} />
                                <Text style={{ fontSize: 16, fontWeight: "900", color: TEXT }}>
                                    {modo === "entrada" ? "Parámetros de entrada" : "Parámetros de salida"}
                                </Text>
                            </View>

                            <Text style={{ marginTop: 6, color: MUTED }}>
                                {modo === "entrada"
                                    ? "Selecciona el corral y el comportamiento del flujo."
                                    : "Configura el comportamiento del flujo de salida."}
                            </Text>

                            <View style={{ height: 12 }} />

                            {modo === "entrada" && (
                                <>
                                    <TextInput
                                        mode="outlined"
                                        label="Corral"
                                        value={corral}
                                        onChangeText={setCorral}
                                        placeholder="Ej: 1"
                                        keyboardType="number-pad"
                                        left={<TextInput.Icon icon="home-outline" />}
                                        outlineColor={BORDER}
                                        activeOutlineColor={BRAND}
                                    />

                                    {!puedeContinuar && (
                                        <Text style={{ color: "#DC2626", fontWeight: "700", marginTop: 8 }}>
                                            Escribe el corral para continuar.
                                        </Text>
                                    )}

                                    <View style={{ height: 14 }} />
                                    <Divider />
                                    <View style={{ height: 14 }} />
                                </>
                            )}

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <Text style={{ color: TEXT, fontWeight: "800" }}>
                                        Identificar animales desconocidos
                                    </Text>
                                    <Text style={{ color: MUTED, marginTop: 2, fontSize: 12 }}>
                                        Cuando leas un animal sin identificar, podrás asignarle un ID
                                    </Text>
                                </View>
                                <Switch value={detectarDesconocidos} onValueChange={setDetectarDesconocidos} />
                            </View>

                            <View style={{ height: 12 }} />

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <Text style={{ color: TEXT, fontWeight: "800" }}>Confirmar envío</Text>
                                    <Text style={{ color: MUTED, marginTop: 2, fontSize: 12 }}>
                                        Pedirá confirmación antes de enviar cada registro.
                                    </Text>
                                </View>
                                <Switch value={confirmar} onValueChange={setConfirmar} />
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {modo === "busqueda" && (
                    <Card mode="contained" style={{ borderRadius: 18, backgroundColor: CARD }}>
                        <Card.Content>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Ionicons name="search-outline" size={18} color={BRAND} />
                                <Text style={{ fontSize: 16, fontWeight: "900", color: TEXT }}>
                                    Búsqueda de animal
                                </Text>
                            </View>

                            <Text style={{ marginTop: 6, color: MUTED }}>
                                Elige si quieres buscar por crotal o por ID.
                            </Text>

                            <View style={{ height: 12 }} />

                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <OptionCard
                                    label="Por crotal"
                                    icon="barcode-outline"
                                    active={tipoBusqueda === "crotal"}
                                    onPress={() => {
                                        setTipoBusqueda("crotal");
                                        setValorBusqueda("");
                                    }}
                                />
                                <OptionCard
                                    label="Por ID"
                                    icon="id-card-outline"
                                    active={tipoBusqueda === "id"}
                                    onPress={() => {
                                        setTipoBusqueda("id");
                                        setValorBusqueda("");
                                    }}
                                />
                            </View>

                            {tipoBusqueda === "crotal" && (
                                <>
                                    <View style={{ height: 12 }} />

                                    <View style={{ flexDirection: "row", gap: 10 }}>
                                        <OptionCard
                                            label="Manual"
                                            icon="create-outline"
                                            active={origenBusquedaCrotal === "manual"}
                                            onPress={() => {
                                                setOrigenBusquedaCrotal("manual");
                                                setValorBusqueda("");
                                            }}
                                        />
                                        <OptionCard
                                            label="Con espada"
                                            icon="barcode-outline"
                                            active={origenBusquedaCrotal === "espada"}
                                            onPress={() => {
                                                setOrigenBusquedaCrotal("espada");
                                                setValorBusqueda("");
                                            }}
                                        />
                                    </View>
                                </>
                            )}

                            {!(tipoBusqueda === "crotal" && origenBusquedaCrotal === "espada") && (
                                <>
                                    <View style={{ height: 12 }} />

                                    <TextInput
                                        mode="outlined"
                                        label={tipoBusqueda === "crotal" ? "Crotal" : "ID"}
                                        value={valorBusqueda}
                                        onChangeText={setValorBusqueda}
                                        placeholder={
                                            tipoBusqueda === "crotal"
                                                ? "Ej: 982091072397436"
                                                : "Ej: A13"
                                        }
                                        keyboardType={tipoBusqueda === "crotal" ? "number-pad" : "default"}
                                        autoCapitalize={tipoBusqueda === "id" ? "characters" : "none"}
                                        autoCorrect={false}
                                        outlineColor={BORDER}
                                        activeOutlineColor={BRAND}
                                    />

                                    {valorBusqueda.trim().length === 0 && (
                                        <Text style={{ color: "#DC2626", fontWeight: "700", marginTop: 8 }}>
                                            {tipoBusqueda === "crotal"
                                                ? "Escribe un crotal para continuar."
                                                : "Escribe un ID para continuar."}
                                        </Text>
                                    )}
                                </>
                            )}

                            {tipoBusqueda === "crotal" && origenBusquedaCrotal === "espada" && (
                                <Text style={{ color: MUTED, marginTop: 12 }}>
                                    Al pulsar Escanear, se leerá la espada en esta pantalla y se buscará el animal con ese crotal.
                                </Text>
                            )}
                        </Card.Content>
                    </Card>
                )}

                {(buscandoAnimal || leyendoBusquedaEspada || esperandoCoincidencia) && (
                    <Card mode="contained" style={{ borderRadius: 18, backgroundColor: CARD }}>
                        <Card.Content>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <Ionicons name="scan-outline" size={22} color={BRAND} />
                                <Text style={{ fontSize: 16, fontWeight: "900", color: TEXT }}>
                                    {leyendoBusquedaEspada
                                        ? "Leyendo espada..."
                                        : esperandoCoincidencia
                                            ? "Esperando coincidencia"
                                            : "Buscando animal..."}
                                </Text>
                            </View>

                            <Text style={{ marginTop: 8, color: MUTED }}>
                                {leyendoBusquedaEspada
                                    ? "Acerca el crotal al lector para identificar el animal."
                                    : esperandoCoincidencia
                                        ? `Animal localizado. Ahora acerca a la espada el crotal ${crotalEsperado} para confirmar la coincidencia.`
                                        : "Consultando información del animal en el backend."}
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {!lectorConectado && (
                    <Card mode="contained" style={{ borderRadius: 18, backgroundColor: CARD }}>
                        <Card.Content>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={irAConfiguracionAwr}
                                style={{
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: "#FECACA",
                                    backgroundColor: "#FEF2F2",
                                    padding: 14,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 999,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#FEE2E2",
                                        }}
                                    >
                                        <Ionicons
                                            name="alert-circle-outline"
                                            size={20}
                                            color="#DC2626"
                                        />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{
                                                color: "#991B1B",
                                                fontWeight: "900",
                                                fontSize: 15,
                                            }}
                                        >
                                            AWR no conectado
                                        </Text>

                                        <Text
                                            style={{
                                                color: "#B91C1C",
                                                marginTop: 3,
                                                fontSize: 12,
                                            }}
                                        >
                                            {hayEspadasGuardadas
                                                ? "Tienes AWR guardadas. Pulsa para seleccionar una."
                                                : "No tienes ninguna AWR guardada. Pulsa para escanear una."}
                                        </Text>
                                    </View>

                                    <Ionicons
                                        name="chevron-forward-outline"
                                        size={22}
                                        color="#DC2626"
                                    />
                                </View>
                            </TouchableOpacity>
                        </Card.Content>
                    </Card>
                )}

                <View style={{ marginTop: 16 }}>
                    <Button
                        mode="contained"
                        onPress={onContinuar}
                        disabled={
                            !puedeContinuar ||
                            buscandoAnimal ||
                            leyendoBusquedaEspada ||
                            esperandoCoincidencia
                        }
                        style={{
                            borderRadius: 16,
                            paddingVertical: 6,
                            backgroundColor: puedeContinuar ? BRAND : "#94A3B8",
                        }}
                        contentStyle={{ height: 48 }}
                        labelStyle={{ fontSize: 16, fontWeight: "900" }}
                    >
                        {modo === "busqueda" ? "Escanear" : "Continuar"}
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};