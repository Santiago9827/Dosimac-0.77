// /* eslint-disable prettier/prettier */
// /* eslint-disable react-native/no-inline-styles */
// import React, { useState } from 'react';
// import { View, Button, TextInput, Text } from 'react-native';
// import { StackScreenProps } from '@react-navigation/stack';
// import { useTranslation } from 'react-i18next';
// import { DefaultTheme } from '@react-navigation/native';

// // type Props = StackScreenProps<MainStackTypeParamList, 'LOGIN_SCREEN'>;

// // export const LoginScreen = ({ navigation}: Props) => {
// export const LoginScreen = () => {
// 	const { t } = useTranslation();
// 	const onLogin = () => { };
// 	const [userName, setUserName] = useState('');
// 	const [password, setPassword] = useState('');
// 	return (
// 		<View>
// 			<Text
// 				style={{
// 					justifyContent: 'space-around',
// 					alignSelf: 'center',
// 					fontSize: 20,
// 					fontWeight: 'bold',
// 					margin: 5,
// 					color: DefaultTheme.colors.primary,
// 				}}>
// 				{' '}
// 				{t('common:welcome')}
// 			</Text>

// 			<Text
// 				style={{
// 					fontSize: 18,
// 					fontWeight: 'bold',
// 					margin: 5,
// 					color: DefaultTheme.colors.primary,
// 				}}>
// 				{' '}
// 				{t('common:username')}
// 			</Text>
// 			<TextInput
// 				value={userName}
// 				onChangeText={text => setUserName(text)}
// 				style={{ borderWidth: 2, margin: 5, padding: 5 }}
// 			/>
// 			<Text
// 				style={{
// 					fontSize: 18,
// 					fontWeight: 'bold',
// 					margin: 5,
// 					color: DefaultTheme.colors.primary,
// 				}}>
// 				{' '}
// 				{t('common:password')}
// 			</Text>
// 			<TextInput
// 				value={password}
// 				onChangeText={text => setPassword(text)}
// 				style={{ borderWidth: 2, margin: 5, padding: 5 }}
// 			/>
// 			<View style={{ margin: 5, padding: 5 }}>
// 				<Button
// 					title={t('common:login')}
// 					onPress={() => {
// 						onLogin();
// 					}}
// 				/>
// 			</View>
// 			<View style={{ margin: 5, padding: 5 }}>
// 				<Button
// 					title={t('navigate:settings')}
// 					onPress={() => {
// 						// navigation.navigate('SETTINGS_SCREEN');
// 					}}
// 				/>
// 			</View>
// 		</View>
// 	);
// };

//export default Login;


///Provicional --> Falta mejorarlo

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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuthStore } from "../../../stores/authStore";
import { HamburgerMenu } from "../../components/shared/HamburgerMenu";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BG = require("../../../assets/images/TecLogin.jpg");
const LOGO = require("../../../assets/images/logo-cti.png");

export const LoginScreen = () => {
	const [email, setEmail] = useState("");
	const [pass, setPass] = useState("");
	const [showPass, setShowPass] = useState(false);
	const insets = useSafeAreaInsets();

	const login = useAuthStore((s) => s.login);

	const onSubmit = () => {
		login("token-demo", { email });
	};

	const disabled = !email.trim() || !pass.trim();

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
							{/*  Card más compacta */}
							<View
								className="w-full max-w-[390px] rounded-2xl bg-white/95 px-5 py-6"
								style={{ elevation: 10 }}
							>
								{/* Logo */}
								<View className="items-center mb-3">
									<Image
										source={LOGO}
										resizeMode="contain"
										style={{ height: 48, width: 200 }}   //  un poco más pequeño
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

								{/* Email */}
								<Text className="text-slate-700 mb-2 font-semibold">Email</Text>

								{/*  Input más bajito */}
								<View className="flex-row items-center h-10 rounded-lg bg-slate-50 border border-slate-200 px-3">
									<Ionicons name="mail-outline" size={14} color="#64748b" />
									<TextInput
										value={email}
										onChangeText={setEmail}
										autoCapitalize="none"
										keyboardType="email-address"
										placeholder="nombre@granja.com"
										placeholderTextColor="#94a3b8"
										className="flex-1 ml-2 text-[14px] text-slate-900"
										style={{ paddingVertical: 0 }}          // ✅ clave
										textAlignVertical="center"              // ✅ Android
										returnKeyType="next"
									/>
								</View>
								{/* Password */}
								<Text className="text-slate-700 mt-4 mb-2 font-semibold">
									Contraseña
								</Text>

								{/* Input más bajito */}
								<View className="flex-row items-center h-10 rounded-lg bg-slate-50 border border-slate-200 px-3">
									<Ionicons name="lock-closed-outline" size={14} color="#64748b" />
									<TextInput
										value={pass}
										onChangeText={setPass}
										secureTextEntry={!showPass}
										placeholder="••••••••"
										placeholderTextColor="#94a3b8"
										className="flex-1 ml-2 text-[14px] text-slate-900"
										style={{ paddingVertical: 0 }}          // ✅ clave
										textAlignVertical="center"              // ✅ Android
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

								{/*  Botón más fino */}
								<TouchableOpacity
									onPress={onSubmit}
									disabled={disabled}
									className={`mt-5 rounded-xl py-3 items-center ${disabled ? "bg-indigo-300" : "bg-indigo-600"
										}`}
								>
									<Text className="text-white font-bold text-base">
										Entrar
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