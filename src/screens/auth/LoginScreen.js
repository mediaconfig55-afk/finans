import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store'; // For storing credentials if needed, or just use auth persistence
import { auth } from '../../config/firebaseConfig';
import { COLORS, SIZES } from '../../constants/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { authenticateWithBiometrics, checkBiometricAvailability } from '../../utils/biometricAuth';

// Validation Schema
const schema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

const LoginScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    useEffect(() => {
        checkBiometric();
    }, []);

    const checkBiometric = async () => {
        const available = await checkBiometricAvailability();
        setIsBiometricAvailable(available);
    };

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const onLogin = async (data) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            // Navigation is handled by auth state listener
        } catch (error) {
            let errorMessage = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
            if (error.code === 'auth/user-not-found') errorMessage = 'Kullanıcı bulunamadı.';
            if (error.code === 'auth/wrong-password') errorMessage = 'Hatalı şifre.';
            if (error.code === 'auth/invalid-email') errorMessage = 'Geçersiz e-posta formatı.';
            if (error.code === 'auth/too-many-requests') errorMessage = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.';

            Alert.alert('Hata', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        const success = await authenticateWithBiometrics();
        if (success) {
            // NOTE: In a real app, you would retrieve the stored email/password from SecureStore here
            // and then call signInWithEmailAndPassword.
            // For this implementation, we simulate it or need checking if user is already persisted but session expired.
            // Since Firebase handles persistence, if we are here, likely user is logged out.
            // We will show a message that they need to login with password first to enable biometrics effectively 
            // or implement SecureStore for credentials.

            Alert.alert('Bilgi', 'Biyometrik giriş için önce ayarlardan bu özelliği aktif etmelisiniz veya kimlik bilgilerinizi güvenli depolamaya kaydetmelisiniz.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Hoş Geldiniz</Text>
                        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
                    </View>

                    <View style={styles.form}>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="E-posta"
                                    placeholder="ornek@email.com"
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.email?.message}
                                    keyboardType="email-address"
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Şifre"
                                    placeholder="******"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry
                                    error={errors.password?.message}
                                />
                            )}
                        />

                        <Button
                            title="Giriş Yap"
                            onPress={handleSubmit(onLogin)}
                            isLoading={isLoading}
                            style={{ marginTop: 20 }}
                        />

                        {isBiometricAvailable && (
                            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
                                <Ionicons name="finger-print" size={32} color={COLORS.primary} />
                                <Text style={styles.biometricText}>Biyometrik Giriş</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Hesabınız yok mu? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.link}>Kayıt Ol</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SIZES.padding,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
    form: {
        width: '100%',
    },
    biometricButton: {
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
    },
    biometricText: {
        color: COLORS.primary,
        marginTop: 5,
        fontSize: SIZES.caption,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: COLORS.textSecondary,
    },
    link: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
