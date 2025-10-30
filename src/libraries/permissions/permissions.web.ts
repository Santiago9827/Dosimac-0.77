// En web no hay PermissionsAndroid ni react-native-permissions.
// Stub no-op para que la app compile y funcione el resto de UI.
export async function RequestBluetoothPermissions() {
    console.log('[web] Skipping Bluetooth permissions (not applicable on web)');
}
