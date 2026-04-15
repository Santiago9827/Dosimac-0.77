import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../../../stores/authStore";

const STORAGE_KEY = "@cti_portal_base_url";

function construirUrlPortalDesdeApi(baseUrl: string, token: string) {
  const urlApi = new URL(baseUrl);

  urlApi.port = "8080";
  urlApi.pathname = "/CtiAlimentacion/login.xhtml";
  urlApi.search = "";

  urlApi.searchParams.set("type", "espada");
  urlApi.searchParams.set("token", token);

  return urlApi.toString();
}

export const PortalScreen = () => {
  const webRef = useRef<WebView>(null);

  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [urlPortal, setUrlPortal] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preparandoUrl, setPreparandoUrl] = useState(true);
  const [cargandoWeb, setCargandoWeb] = useState(false);

  useEffect(() => {
    const prepararUrl = async () => {
      try {
        setPreparandoUrl(true);
        setError(null);

        if (!isHydrated) return;

        if (!token) {
          setError("No hay token de sesión. Inicia sesión de nuevo.");
          return;
        }

        const baseUrlGuardada = await AsyncStorage.getItem(STORAGE_KEY);

        if (!baseUrlGuardada) {
          setError("No hay IP configurada. Configura primero la IP del servidor.");
          return;
        }

        const urlFinal = construirUrlPortalDesdeApi(baseUrlGuardada, token);

        // Alert.alert("URL portal", urlFinal);

        setUrlPortal(urlFinal);
      } catch {
        setError("No se pudo preparar la URL del portal.");
      } finally {
        setPreparandoUrl(false);
      }
    };

    prepararUrl();
  }, [token, isHydrated]);

  if (!isHydrated || preparandoUrl) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Preparando portal...</Text>
      </View>
    );
  }

  if (!urlPortal) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ textAlign: "center", color: "#DC2626", fontWeight: "700" }}>
          {error ?? "No se pudo cargar el portal."}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webRef}
        source={{ uri: urlPortal }}
        onLoadStart={() => {
          setCargandoWeb(true);
          setError(null);
        }}
        // onError={(e) => {
        //   setCargandoWeb(false);
        //   setError("No se pudo cargar el portal. Revisa la IP, el token y la Wi-Fi.");

        //   Alert.alert(
        //     "Error WebView",
        //     `Descripción: ${e.nativeEvent.description}\nCódigo: ${e.nativeEvent.code}\nURL: ${e.nativeEvent.url}`
        //   );
        // }}
        // onHttpError={(e) => {
        //   setCargandoWeb(false);
        //   setError(`Error HTTP ${e.nativeEvent.statusCode} al abrir el portal.`);

        //   Alert.alert(
        //     "HTTP Error WebView",
        //     `Código: ${e.nativeEvent.statusCode}\nURL: ${e.nativeEvent.url}`
        //   );
        // }}
        // onLoad={() => {
        //   Alert.alert("WebView", "La página se ha cargado");
        // }}
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 10 }}>Cargando portal...</Text>
          </View>
        )}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
      />

      {error && (
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            padding: 14,
            borderRadius: 14,
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        >
          <Text style={{ color: "white", marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => webRef.current?.reload()}
            style={{
              backgroundColor: "white",
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "700" }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};