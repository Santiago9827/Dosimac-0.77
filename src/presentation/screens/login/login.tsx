import React, { useState } from "react";
import {
	Image,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuthStore } from "../../../stores/authStore";
import { HamburgerMenu } from "../../components/shared/HamburgerMenu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { loginEspada } from "../login/loginEspada";

const BG = require("../../../assets/images/TecLogin.jpg");
const LOGO = require("../../../assets/images/logo-cti.png");

export const LoginScreen = () => {
	const [userName, setUserName] = useState("");
	const [pass, setPass] = useState("");
	const [showPass, setShowPass] = useState(false);
	const [cargando, setCargando] = useState(false);
	const insets = useSafeAreaInsets();

	const login = useAuthStore((s) => s.login);

	const onSubmit = async () => {
		const usernameLimpio = userName.trim();
		const passwordLimpia = pass.trim();

		if (!usernameLimpio || !passwordLimpia) {
			Alert.alert("Faltan datos", "Introduce usuario y contraseña.");
			return;
		}

		try {
			setCargando(true);

			const respuesta = await loginEspada({
				username: usernameLimpio,
				password: passwordLimpia,
			});

			if (respuesta.errorMessage) {
				Alert.alert("Configuración", respuesta.errorMessage);
				return;
			}

			if (!respuesta.ok) {
				const detalle =
					(typeof respuesta.data === "object" &&
						(respuesta.data?.message ||
							respuesta.data?.error ||
							respuesta.data?.mensaje)) ||
					respuesta.rawText ||
					`HTTP ${respuesta.status}`;

				Alert.alert("Error de login", String(detalle));
				return;
			}

			const token =
				respuesta.data?.token ??
				respuesta.data?.accessToken ??
				respuesta.data?.jwt ??
				null;

			if (!token) {
				Alert.alert("Error", "El backend no devolvió ningún token.");
				return;
			}

			login(token, { email: usernameLimpio });
		} catch {
			Alert.alert("Error de red", "No se pudo conectar con el servidor.");
		} finally {
			setCargando(false);
		}
	};

	const disabled = !userName.trim() || !pass.trim() || cargando;

	return (
		<ImageBackground source={BG} resizeMode="cover" style={{ flex: 1 }}>
			<StatusBar barStyle="light-content" />

			<View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}>
				<View
					style={{
						position: "absolute",
						top: insets.top + 12,
						left: 16,
						zIndex: 50,
					}}
				>
					<HamburgerMenu variant="inline" color="white" size={30} />
				</View>

				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
				>
					<ScrollView
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{
							flexGrow: 1,
							justifyContent: "center",
							paddingHorizontal: 18,
							paddingTop: 90,
							paddingBottom: 36,
						}}
					>
						<View style={{ alignItems: "center" }}>
							<View
								className="w-full max-w-[390px] rounded-2xl bg-white/95 px-5 py-6"
								style={{ elevation: 10 }}
							>
								<View className="items-center mb-3">
									<Image
										source={LOGO}
										resizeMode="contain"
										style={{ height: 48, width: 200 }}
									/>
									<Text className="mt-2 text-[11px] font-bold tracking-[3px] text-blue-900">
										DOSIMAC
									</Text>
								</View>

								<Text className="text-xl font-extrabold text-slate-900">
									Iniciar sesión
								</Text>
								<Text className="text-slate-500 mt-1 mb-4">
									Introduce tus datos
								</Text>

								<Text className="text-slate-700 mb-2 font-semibold">Usuario</Text>
								<View className="flex-row items-center h-10 rounded-lg bg-slate-50 border border-slate-200 px-3">
									<Ionicons name="person-outline" size={14} color="#64748b" />
									<TextInput
										value={userName}
										onChangeText={setUserName}
										autoCapitalize="none"
										placeholder="admin"
										placeholderTextColor="#94a3b8"
										className="flex-1 ml-2 text-[14px] text-slate-900"
										style={{ paddingVertical: 0 }}
										textAlignVertical="center"
										returnKeyType="next"
									/>
								</View>

								<Text className="text-slate-700 mt-4 mb-2 font-semibold">
									Contraseña
								</Text>
								<View className="flex-row items-center h-10 rounded-lg bg-slate-50 border border-slate-200 px-3">
									<Ionicons name="lock-closed-outline" size={14} color="#64748b" />
									<TextInput
										value={pass}
										onChangeText={setPass}
										secureTextEntry={!showPass}
										placeholder="••••••••"
										placeholderTextColor="#94a3b8"
										className="flex-1 ml-2 text-[14px] text-slate-900"
										style={{ paddingVertical: 0 }}
										textAlignVertical="center"
										returnKeyType="done"
									/>

									<TouchableOpacity onPress={() => setShowPass(v => !v)} style={{ paddingLeft: 6 }}>
										<Ionicons
											name={showPass ? "eye-off-outline" : "eye-outline"}
											size={14}
											color="#64748b"
										/>
									</TouchableOpacity>
								</View>

								<TouchableOpacity
									onPress={onSubmit}
									disabled={disabled}
									className={`mt-5 rounded-xl py-3 items-center ${disabled ? "bg-indigo-300" : "bg-indigo-600"
										}`}
								>
									<Text className="text-white font-bold text-base">
										{cargando ? "Entrando..." : "Entrar"}
									</Text>
								</TouchableOpacity>

								<Text className="text-center text-[11px] text-slate-400 mt-4">
									© 2026 DOSIMAC · Panel de control
								</Text>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		</ImageBackground>
	);
};