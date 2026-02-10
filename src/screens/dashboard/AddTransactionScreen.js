import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { COLORS, SIZES } from '../../constants/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Simple types for now
const TRANSACTION_TYPES = [
    { id: 'income', label: 'Gelir', icon: 'arrow-down', color: COLORS.success },
    { id: 'expense', label: 'Gider', icon: 'arrow-up', color: COLORS.error },
    { id: 'debt', label: 'Borç', icon: 'time', color: COLORS.warning },
];

const schema = z.object({
    amount: z.string().min(1, 'Tutar giriniz'),
    description: z.string().optional(),
    category: z.string().min(1, 'Kategori seçiniz'), // temporary until category picker
});

const AddTransactionScreen = ({ navigation }) => {
    const [selectedType, setSelectedType] = useState('expense');
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            amount: '',
            description: '',
            category: 'Genel', // Default category
        }
    });

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const amountValue = parseFloat(data.amount.replace(',', '.'));

            await addDoc(collection(db, "transactions"), {
                userId: auth.currentUser.uid,
                type: selectedType,
                amount: amountValue,
                category: data.category,
                description: data.description,
                date: new Date().toISOString(), // Use current date for now, add picker later
                createdAt: Timestamp.now(),
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Başarılı', 'İşlem kaydedildi', [
                {
                    text: 'Tamam', onPress: () => {
                        reset();
                        navigation.navigate('Ana Sayfa');
                    }
                }
            ]);
        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Hata', 'Kaydedilirken bir sorun oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Yeni İşlem Ekle</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Type Selection */}
                <View style={styles.typeContainer}>
                    {TRANSACTION_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.typeButton,
                                selectedType === type.id && { backgroundColor: type.color, borderColor: type.color }
                            ]}
                            onPress={() => handleTypeSelect(type.id)}
                        >
                            <Ionicons
                                name={type.icon}
                                size={24}
                                color={selectedType === type.id ? COLORS.background : type.color}
                            />
                            <Text style={[
                                styles.typeText,
                                selectedType === type.id ? { color: COLORS.background } : { color: type.color }
                            ]}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="amount"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Tutar"
                                placeholder="0.00"
                                value={value}
                                onChangeText={onChange}
                                keyboardType="numeric"
                                error={errors.amount?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="category"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Kategori"
                                placeholder="Örn: Market, Kira"
                                value={value}
                                onChangeText={onChange}
                                error={errors.category?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Açıklama (Opsiyonel)"
                                placeholder="Detay ekle..."
                                value={value}
                                onChangeText={onChange}
                                error={errors.description?.message}
                            />
                        )}
                    />

                    <Button
                        title="Kaydet"
                        onPress={handleSubmit(onSubmit)}
                        isLoading={isLoading}
                        style={{ marginTop: 20, backgroundColor: TRANSACTION_TYPES.find(t => t.id === selectedType).color }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    content: {
        padding: SIZES.padding,
    },
    typeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    typeButton: {
        flex: 1,
        height: 80,
        marginHorizontal: 5,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    typeText: {
        marginTop: 8,
        fontWeight: 'bold',
        fontSize: 14,
    },
    form: {
        flex: 1,
    }
});

export default AddTransactionScreen;
