/* eslint-disable prettier/prettier */
import React from "react";
import { View, Text } from "react-native";
import { Switch } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { useTranslation } from "react-i18next";
import { formatearCrotalVisual } from "../../hooks/formatearCrotalVisual";

export const BG = "#F6F7FB";
export const CARD = "#FFFFFF";
export const BORDER = "#E5E7EB";
export const TEXT = "#0F172A";
export const MUTED = "#64748B";
export const BRAND = "#4F46E5";
export const SOFT = "#EEF2FF";
export const SOFT_BORDER = "#C7D2FE";
export const DANGER = "#DC2626";
export const SUCCESS = "#16A34A";

export const SHADOW = {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
};

export type RegistroEnviado = {
    localId: string;
    corral: string;
    idBackend: string;
    crotal: string;
    estado: string;
    nave: string;
};

export type TipoMovimiento = "entrada" | "salida" | "lectura" | "busqueda";
export type EstadoIdVisual = "neutro" | "success" | "error";

export const normalizarClave = (valor: string) =>
    valor.trim().toUpperCase().replace(/\s+/g, "");

export const parseNumeroSeguro = (txt: string) => {
    const n = Number(txt);
    return Number.isFinite(n) ? n : null;
};

export const SwitchRowReadonly = ({
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

export const MiniResumenCard = ({
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

export const CajaDatoLectura = ({
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

export const FichaDatoAnimal = ({
    icon,
    titulo,
    valor,
    anchoCompleto = false,
}: {
    icon: any;
    titulo: string;
    valor: string;
    anchoCompleto?: boolean;
}) => (
    <View
        style={{
            width: anchoCompleto ? "100%" : "48%",
            backgroundColor: "#F8FAFF",
            borderWidth: 1.5,
            borderColor: "#CBD5E1",
            borderRadius: 16,
            padding: 14,
        }}
    >
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
            }}
        >
            <Ionicons name={icon} size={16} color={BRAND} />
            <Text
                style={{
                    color: MUTED,
                    fontWeight: "800",
                    fontSize: 12,
                }}
            >
                {titulo}
            </Text>
        </View>

        <Text
            style={{
                color: TEXT,
                fontWeight: "900",
                fontSize: 16,
            }}
            numberOfLines={anchoCompleto ? 2 : 1}
            ellipsizeMode="tail"
        >
            {valor}
        </Text>
    </View>
);

export const RegistroLecturaCard = ({
    registro,
    estadoTraducido,
}: {
    registro: RegistroEnviado;
    estadoTraducido: string;
}) => {
    const { t } = useTranslation();

    const idEsError = registro.idBackend === "—" || registro.idBackend === "0";

    const coloresCard = idEsError
        ? {
            fondoCard: "#FFF7F7",
            bordeCard: "#FECACA",
            fondoHeader: "#FEF2F2",
            bordeSeparador: "#FECACA",
            colorEtiqueta: "#991B1B",
            colorValorId: DANGER,
            fondoEstado: "#FEE2E2",
            colorEstado: "#991B1B",
            fondoNave: "#FFF1F2",
            colorNave: "#9F1239",
        }
        : {
            fondoCard: "#F8FAFF",
            bordeCard: "#C7D2FE",
            fondoHeader: "#EEF2FF",
            bordeSeparador: "#D7DEFF",
            colorEtiqueta: "#4F46E5",
            colorValorId: TEXT,
            fondoEstado: "#EEF2FF",
            colorEstado: "#4338CA",
            fondoNave: "#EEF2FF",
            colorNave: "#4338CA",
        };

    return (
        <View
            style={{
                backgroundColor: coloresCard.fondoCard,
                borderWidth: 1.5,
                borderColor: coloresCard.bordeCard,
                borderRadius: 18,
                padding: 14,
                gap: 12,
                ...SHADOW,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 18,
                    backgroundColor: coloresCard.fondoHeader,
                    borderRadius: 14,
                    padding: 12,
                }}
            >
                <View style={{ width: 82 }}>
                    <Text
                        style={{
                            color: coloresCard.colorEtiqueta,
                            fontSize: 11,
                            fontWeight: "800",
                            marginBottom: 4,
                        }}
                    >
                        {t("Reader_labelId")}
                    </Text>

                    <Text
                        style={{
                            color: idEsError ? DANGER : coloresCard.colorValorId,
                            fontSize: 22,
                            fontWeight: "900",
                        }}
                    >
                        {registro.idBackend}
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: coloresCard.colorEtiqueta,
                            fontSize: 11,
                            fontWeight: "800",
                            marginBottom: 4,
                        }}
                    >
                        {t("Reader_labelCrotal")}
                    </Text>

                    <Text
                        style={{
                            color: TEXT,
                            fontSize: 18,
                            fontWeight: "900",
                            textAlign: "left",
                        }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                    >
                        {formatearCrotalVisual(registro.crotal)}
                    </Text>
                </View>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "stretch",
                    borderTopWidth: 1,
                    borderTopColor: coloresCard.bordeSeparador,
                    paddingTop: 12,
                }}
            >
                <View style={{ flex: 0.8, paddingHorizontal: 4 }}>
                    <Text
                        style={{
                            color: MUTED,
                            fontSize: 12,
                            fontWeight: "800",
                            marginBottom: 4,
                        }}
                    >
                        {t("Reader_labelCorral")}
                    </Text>

                    <Text
                        style={{
                            color: TEXT,
                            fontSize: 15,
                            fontWeight: "900",
                        }}
                    >
                        {registro.corral}
                    </Text>
                </View>

                <View
                    style={{
                        width: 1,
                        backgroundColor: coloresCard.bordeSeparador,
                        marginHorizontal: 10,
                    }}
                />

                <View style={{ flex: 1.5, paddingHorizontal: 4 }}>
                    <Text
                        style={{
                            color: MUTED,
                            fontSize: 12,
                            fontWeight: "800",
                            marginBottom: 4,
                        }}
                    >
                        {t("Reader_labelHouse")}
                    </Text>

                    <View
                        style={{
                            alignSelf: "flex-start",
                            backgroundColor: coloresCard.fondoNave,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 10,
                            marginTop: 2,
                            maxWidth: "100%",
                        }}
                    >
                        <Text
                            style={{
                                color: coloresCard.colorNave,
                                fontSize: 15,
                                fontWeight: "900",
                                lineHeight: 19,
                            }}
                            numberOfLines={2}
                        >
                            {registro.nave}
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        width: 1,
                        backgroundColor: coloresCard.bordeSeparador,
                        marginHorizontal: 10,
                    }}
                />

                <View style={{ flex: 1.5, paddingHorizontal: 4 }}>
                    <Text
                        style={{
                            color: MUTED,
                            fontSize: 12,
                            fontWeight: "800",
                            marginBottom: 4,
                        }}
                    >
                        {t("Reader_labelState")}
                    </Text>

                    <View
                        style={{
                            alignSelf: "flex-start",
                            backgroundColor: coloresCard.fondoEstado,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 10,
                            marginTop: 2,
                            maxWidth: "100%",
                        }}
                    >
                        <Text
                            style={{
                                color: coloresCard.colorEstado,
                                fontSize: 15,
                                fontWeight: "900",
                                lineHeight: 19,
                            }}
                            numberOfLines={2}
                        >
                            {estadoTraducido}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export async function postGestation(
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

export function upsertRegistroPorCrotal(
    prev: RegistroEnviado[],
    corralValor: string,
    crotalValor: string,
    idBackend: string,
    estadoValor?: string,
    naveValor?: string
) {
    const key = normalizarClave(String(crotalValor));
    const idx = prev.findIndex((x) => normalizarClave(x.crotal) === key);

    const corralTexto = corralValor?.trim() ? corralValor : "—";

    if (idx >= 0) {
        const copia = [...prev];
        const previo = copia[idx];

        const actualizado: RegistroEnviado = {
            ...previo,
            corral: corralTexto,
            crotal: String(crotalValor),
            idBackend: idBackend || "—",
            estado: estadoValor?.trim() ? estadoValor : previo.estado || "—",
            nave: naveValor?.trim() ? naveValor : previo.nave || "—",
        };

        copia.splice(idx, 1);
        return [actualizado, ...copia];
    }

    return [
        {
            localId: String(Date.now()),
            corral: corralTexto,
            idBackend: idBackend || "—",
            crotal: String(crotalValor),
            estado: estadoValor?.trim() ? estadoValor : "—",
            nave: naveValor?.trim() ? naveValor : "—",
        },
        ...prev,
    ];
}


