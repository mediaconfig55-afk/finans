import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { COLORS, SIZES } from '../../constants/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

// Validation Schema
const schema = z.object({
    fullName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
});

const RegisterScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    });

    const onRegister = async (data) => {
        setIsLoading(true);
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // 2. Create User Document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                fullName: data.fullName,
                email: data.email,
                createdAt: new Date().toISOString(),
                settings: {
                    currency: 'TRY',
                    theme: 'dark'
                }
            });

            Alert.alert('Başarılı', 'Hesabınız oluşturuldu!', [
                // Navigation is handled by auth state listener
                { text: 'Tamam' }
            ]);

        } catch (error) {
            let errorMessage = 'Kayıt yapılamadı.';
            if (error.code === 'auth/email-already-in-use') errorMessage = 'Bu e-posta adresi zaten kullanımda.';
            if (error.code === 'auth/invalid-email') errorMessage = 'Geçersiz e-posta formatı.';

            Alert.alert('Hata', errorMessage);
        } finally {
            setIsLoading(false);
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
                        <Text style={styles.title}>Kayıt Ol</Text>
                        <Text style={styles.subtitle}>Finansal özgürlüğe ilk adım</Text>
                    </View>

                    <View style={styles.form}>
                        <Controller
                            control={control}
                            name="fullName"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Ad Soyad"
                                    placeholder="Adınız Soyadınız"
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.fullName?.message}
                                />
                            )}
                        />

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

                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Şifre Tekrar"
                                    placeholder="******"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry
                                    error={errors.confirmPassword?.message}
                                />
                            )}
                        />

                        <Button
                            title="Kayıt Ol"
                            onPress={handleSubmit(onRegister)}
                            isLoading={isLoading}
                            style={{ marginTop: 20 }}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>Giriş Yap</Text>
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
        marginBottom: 30,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    footerText: {
        color: COLORS.textSecondary,
    },
    link: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
