// import { PermissionsAndroid, Platform } from 'react-native';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// export async function RequestBluetoothPermissions() {
//   if (Platform.OS === 'android') {
//     const granted = await PermissionsAndroid.requestMultiple([
//      //  PermissionsAndroid.PERMISSIONS.BLUETOOTH,
//      //  PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
//       PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
//       PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
//       PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
//     ]);

//     if (
//      //  granted['android.permission.BLUETOOTH'] === PermissionsAndroid.RESULTS.GRANTED &&
//      //  granted['android.permission.BLUETOOTH_ADMIN'] === PermissionsAndroid.RESULTS.GRANTED &&
//      // granted['android.permission.BLUETOOTH_ADVERTISE'] === PermissionsAndroid.RESULTS.GRANTED &&
//      // granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
//      // granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED


//      //  granted['android.permission.BLUETOOTH'] === PermissionsAndroid.RESULTS.GRANTED &&
//      //  granted['android.permission.BLUETOOTH_ADMIN'] === PermissionsAndroid.RESULTS.GRANTED &&
//       granted['android.permission.BLUETOOTH_ADVERTISE'] === PermissionsAndroid.RESULTS.GRANTED &&
//       granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
//       granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
//     ) {
//       console.log('Bluetooth permissions granted');
//     } else {
//       console.log('Bluetooth permissions denied');
//     }
//   }
// }
import { PermissionsAndroid, Platform } from 'react-native';

export async function RequestBluetoothPermissions() {
  if (Platform.OS !== 'android') return;

  // Android 12+ (API 31+) -> “Dispositivos cercanos”
  if (Platform.Version >= 31) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      // PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE, // SOLO si de verdad anuncias
    ]);

    const ok =
      granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;

    console.log(ok ? 'Bluetooth (Nearby devices) granted' : 'Bluetooth (Nearby devices) denied');
    return;
  }

  // Android 6–11 (incluye Android 8) -> Ubicación
  const loc = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  const ok = loc === PermissionsAndroid.RESULTS.GRANTED;
  console.log(ok ? 'Location granted (needed for BLE scan on Android 8–11)' : 'Location denied');
}

