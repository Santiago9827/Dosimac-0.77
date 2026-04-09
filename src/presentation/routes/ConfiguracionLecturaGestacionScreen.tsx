/* eslint-disable prettier/prettier */
import React, { useMemo, useState } from "react";
import { View, Alert } from "react-native";
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
import { TouchableOpacity } from "react-native";
import { awrStore } from "../../stores/awrStore";
import { useAwrConn } from "../../stores/awrConnStore";



type Modo = "entrada" | "salida" | "lectura" | "busqueda";
const ENDPOINT_BUSQUEDA_ANIMAL =
    "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada/busquedaAnimal";

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

export const ConfiguracionGestacionScreen = () => {
    const navigation = useNavigation<any>();

    const lectorConectado = useAwrConn((s) => s.isConnected);
    const espadasGuardadas = awrStore((s) => s.devices);

    const hayEspadasGuardadas = espadasGuardadas.length > 0;

    const irAConfiguracionAwr = () => {
        navigation.navigate(hayEspadasGuardadas ? "AWR-SAVED" : "AWR-STARTSCAN");
    };


    const [modo, setModo] = useState<Modo>("entrada");
    const [corral, setCorral] = useState("");
    const [detectarDesconocidos, setDetectarDesconocidos] = useState(true);
    const [confirmar, setConfirmar] = useState(true);

    const [valorBusqueda, setValorBusqueda] = useState("");
    const [buscandoAnimal, setBuscandoAnimal] = useState(false);

    const requiereCorral = modo === "entrada";
    const requiereBusqueda = modo === "busqueda";

    const puedeContinuar = useMemo(() => {
        if (requiereCorral) return corral.trim().length > 0;
        if (requiereBusqueda) return valorBusqueda.trim().length > 0;
        return true;
    }, [requiereCorral, requiereBusqueda, corral, valorBusqueda]);

    const onContinuar = async () => {
        if (modo === "busqueda") {
            const valor = valorBusqueda.trim();

            if (!valor) {
                Alert.alert("Falta dato", "Escribe un ID o un crotal para buscar.");
                return;
            }

            try {
                setBuscandoAnimal(true);

                const r = await buscarAnimalEnBackend(valor);

                if (!r.ok) {
                    if (r.status === 404) {
                        Alert.alert("No encontrado", "No existe ningún animal con ese ID o crotal.");
                        return;
                    }

                    const detalle =
                        (r.data && (r.data.message || r.data.error)) ||
                        r.rawText ||
                        `HTTP ${r.status}`;

                    Alert.alert("Error en la búsqueda", String(detalle));
                    return;
                }

                const animalEncontrado = r.data ?? null;

                if (!animalEncontrado) {
                    Alert.alert("No encontrado", "No existe ningún animal con ese ID o crotal.");
                    return;
                }

                navigation.navigate("LectorGestacion", {
                    modo,
                    valorBusqueda: valor,
                    animalEncontrado,
                });

                return;
            } catch {
                Alert.alert("Error de red", "No se pudo conectar con el servidor.");
                return;
            } finally {
                setBuscandoAnimal(false);
            }
        }

        navigation.navigate("LectorGestacion", {
            modo,
            corral: corral.trim(),
            detectarDesconocidos,
            confirmar,
        });
    };
    async function buscarAnimalEnBackend(valor: string) {
        const res = await fetch(ENDPOINT_BUSQUEDA_ANIMAL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ valor }),
        });

        let data: any = null;
        let rawText = "";

        try {
            rawText = await res.text();

            if (rawText) {
                try {
                    data = JSON.parse(rawText);
                } catch {
                    data = rawText;
                }
            }
        } catch {
            rawText = "";
            data = null;
        }

        return { ok: res.ok, status: res.status, data, rawText };
    }

    return (
        <View style={{ flex: 1, backgroundColor: BG }}>
            <Appbar.Header elevated style={{ backgroundColor: BRAND }}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Configuración Gestacion" titleStyle={{ color: "white" }} />
            </Appbar.Header>

            <View style={{ padding: 16, gap: 12, flex: 1 }}>
                {/* Card: opciones */}
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

                            {/*  SOLO EN ENTRADA: Corral */}
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

                            {/*  ENTRADA Y SALIDA: switches */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <Text style={{ color: TEXT, fontWeight: "800" }}>
                                        Identificar animales desconocidos
                                    </Text>
                                    <Text style={{ color: MUTED, marginTop: 2, fontSize: 12 }}>
                                        Cuando leas un animal sin identificar, podrás asignarle un ID
                                    </Text>
                                </View>
                                {/*  te faltaba este Switch */}
                                <Switch value={detectarDesconocidos} onValueChange={setDetectarDesconocidos} />
                            </View>

                            <View style={{ height: 12 }} />

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <Text style={{ color: TEXT, fontWeight: "800" }}>Confirmar envío</Text>
                                    <Text style={{ color: MUTED, marginTop: 2, fontSize: 12 }}>
                                        Pedirá confirmación antes de enviar los registro.
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
                                Escribe un ID o un crotal para buscar el animal.
                            </Text>

                            <View style={{ height: 12 }} />

                            <TextInput
                                mode="outlined"
                                label="ID o crotal"
                                value={valorBusqueda}
                                onChangeText={setValorBusqueda}
                                placeholder="Ej: 99 o 982091072397436"
                                keyboardType="number-pad"
                                // left={<TextInput.Icon icon="magnify" />}
                                outlineColor={BORDER}
                                activeOutlineColor={BRAND}
                            />

                            {valorBusqueda.trim().length === 0 && (
                                <Text style={{ color: "#DC2626", fontWeight: "700", marginTop: 8 }}>
                                    Escribe un ID o un crotal para continuar.
                                </Text>
                            )}
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
                                                ? "Tienes espadas guardadas. Pulsa para seleccionar una."
                                                : "No tienes ninguna espada guardada. Pulsa para escanear una."}
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
                {/* CTA abajo */}
                <View style={{ marginTop: "auto" }}>
                    <Button
                        mode="contained"
                        onPress={onContinuar}
                        disabled={!puedeContinuar || buscandoAnimal}
                        style={{
                            borderRadius: 16,
                            paddingVertical: 6,
                            backgroundColor: puedeContinuar ? BRAND : "#94A3B8",
                        }}
                        contentStyle={{ height: 48 }}
                        labelStyle={{ fontSize: 16, fontWeight: "900" }}
                    >
                        Continuar
                    </Button>
                </View>
            </View>
        </View>
    );
};