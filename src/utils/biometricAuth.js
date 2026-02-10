import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export const checkBiometricAvailability = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
};

export const authenticateWithBiometrics = async () => {
    try {
        const isAvailable = await checkBiometricAvailability();

        if (!isAvailable) {
            Alert.alert('Hata', 'Cihazınızda biyometrik doğrulama aktif değil veya desteklenmiyor.');
            return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Giriş yapmak için kimliğinizi doğrulayın',
            cancelLabel: 'İptal',
            disableDeviceFallback: false,
        });

        return result.success;
    } catch (error) {
        console.error('Biometric auth error:', error);
        return false;
    }
};
