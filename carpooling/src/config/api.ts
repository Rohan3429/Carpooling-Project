import { Platform } from 'react-native';

const ANDROID_EMULATOR_BASE_URL = 'https://julian-mitral-silverly.ngrok-free.dev';
const IOS_SIMULATOR_BASE_URL = 'http://localhost:5141';

// For a physical device, replace the Android base URL with your machine IP.
export const API_BASE_URL =
    Platform.OS === 'android' ? ANDROID_EMULATOR_BASE_URL : IOS_SIMULATOR_BASE_URL;

