import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const coloresDegradado = [
    "#2563EB",
    "#2370E3",
    "#2180DB",
    "#1F8FD2",
    "#1D9CC9",
    "#1CA9BF",
    "#1AB4B1",
    "#18B78F",
    "#17AD67",
    "#16A34A",
];

export const PantallaSeleccionInicio = () => {
    return (
        <View style={styles.container}>
            <View style={styles.fondo}>
                {coloresDegradado.map((color, index) => (
                    <View
                        key={index}
                        style={[styles.franja, { backgroundColor: color }]}
                    />
                ))}
            </View>

            <View style={styles.contenido}>
                <TouchableOpacity style={styles.tarjeta}>
                    <Text style={styles.tituloBoton}>Alta Dosimac</Text>
                    <Text style={styles.descripcion}>
                        Dar de alta los dispositivos Dosimac y prepararlos para su uso.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tarjeta}>
                    <Text style={styles.tituloBoton}>CTIFEED</Text>
                    <Text style={styles.descripcion}>
                        Aquí podrás iniciar sesión y ver tu CTIFEED.
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fondo: {
        ...StyleSheet.absoluteFillObject,
    },
    franja: {
        flex: 1,
    },
    contenido: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        gap: 18,
    },
    tarjeta: {
        backgroundColor: "rgba(255,255,255,0.96)",
        borderRadius: 22,
        paddingVertical: 24,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
    },
    tituloBoton: {
        fontSize: 22,
        fontWeight: "900",
        color: "#0F172A",
        textAlign: "center",
    },
    descripcion: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 20,
        color: "#475569",
        textAlign: "center",
    },
});