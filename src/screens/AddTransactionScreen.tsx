import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { TextInput, Button, SegmentedButtons, HelperText, useTheme, Switch, Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../store';
import { formatShortDate } from '../utils/format';

const schema = z.object({
    amount: z.string()
        .min(1, 'Tutar gereklidir')
        .transform((val) => val.replace(',', '.'))
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Geçerli bir tutar giriniz')
        .transform((val) => parseFloat(val)),
    description: z.string().optional(),
    category: z.string().min(1, 'Kategori seçiniz'),
    isInstallment: z.boolean().optional(),
    installmentCount: z.string().optional().transform((val) => val ? parseInt(val) : 0),
}).refine((data) => {
    if (data.isInstallment && (!data.installmentCount || data.installmentCount < 2)) {
        return false;
    }
    return true;
}, {
    message: "Taksit sayısı en az 2 olmalıdır",
    path: ["installmentCount"]
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = {
    income: ['Maaş', 'Ek Gelir', 'Yatırım', 'Diğer'],
    expense: ['Gıda', 'Ulaşım', 'Fatura', 'Eğlence', 'Kira', 'Sağlık', 'Giyim', 'Teknoloji', 'Diğer'],
};

export const AddTransactionScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { addTransaction, addInstallment } = useStore();

    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<any>({
        resolver: zodResolver(schema),
        defaultValues: {
            amount: '',
            description: '',
            category: '',
            isInstallment: false,
            installmentCount: '',
        }
    });

    const isInstallment = watch('isInstallment');

    const onSubmit = async (data: any) => {
        try {
            if (type === 'expense' && data.isInstallment && data.installmentCount) {
                // Handle Installment
                const monthlyAmount = data.amount / data.installmentCount;

                await addInstallment({
                    totalAmount: data.amount,
                    totalMonths: data.installmentCount,
                    remainingMonths: data.installmentCount,
                    startDate: date.toISOString(),
                    description: data.description || `${data.category} Taksiti`,
                });

                // Add first month transaction immediately
                await addTransaction({
                    type: 'expense',
                    amount: monthlyAmount,
                    category: data.category,
                    date: date.toISOString(),
                    description: `${data.description || 'Taksit'} (1/${data.installmentCount})`,
                });

            } else {
                // Normal Transaction
                await addTransaction({
                    type,
                    amount: data.amount,
                    category: data.category,
                    date: date.toISOString(),
                    description: data.description,
                });
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'İşlem kaydedilirken bir hata oluştu');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>

                    <SegmentedButtons
                        value={type}
                        onValueChange={(val: string) => {
                            if (val === 'debt') {
                                navigation.navigate('AddDebt' as never);
                            } else {
                                setType(val as any);
                            }
                        }}
                        buttons={[
                            { value: 'income', label: 'Gelir', style: { backgroundColor: type === 'income' ? (theme.colors as any).customIncome + '20' : undefined } },
                            { value: 'expense', label: 'Gider', style: { backgroundColor: type === 'expense' ? (theme.colors as any).customExpense + '20' : undefined } },
                            { value: 'debt', label: 'Borç', style: { backgroundColor: theme.colors.surfaceVariant } },
                        ]}
                        style={styles.input}
                    />

                    <Controller
                        control={control}
                        name="amount"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <TextInput
                                    label="Tutar"
                                    value={value?.toString()}
                                    onChangeText={onChange}
                                    keyboardType="decimal-pad"
                                    mode="outlined"
                                    style={styles.input}
                                    error={!!errors.amount}
                                    left={<TextInput.Icon icon="currency-try" />}
                                />
                                <HelperText type="error" visible={!!errors.amount}>
                                    {errors.amount?.message as string}
                                </HelperText>
                            </>
                        )}
                    />

                    {type === 'expense' && (
                        <Controller
                            control={control}
                            name="isInstallment"
                            render={({ field: { onChange, value } }) => (
                                <View style={styles.switchContainer}>
                                    <Text variant="bodyLarge">Taksitli İşlem</Text>
                                    <Switch value={value} onValueChange={onChange} color={theme.colors.primary} />
                                </View>
                            )}
                        />
                    )}

                    {isInstallment && type === 'expense' && (
                        <Controller
                            control={control}
                            name="installmentCount"
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <TextInput
                                        label="Taksit Sayısı"
                                        value={value?.toString()}
                                        onChangeText={onChange}
                                        keyboardType="number-pad"
                                        mode="outlined"
                                        style={styles.input}
                                        error={!!errors.installmentCount}
                                    />
                                    <HelperText type="error" visible={!!errors.installmentCount}>
                                        {errors.installmentCount?.message as string}
                                    </HelperText>
                                </>
                            )}
                        />
                    )}

                    <Controller
                        control={control}
                        name="category"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.input}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                                    {CATEGORIES[type].map((cat) => (
                                        <Button
                                            key={cat}
                                            mode={value === cat ? 'contained' : 'outlined'}
                                            onPress={() => onChange(cat)}
                                            style={styles.categoryButton}
                                            compact
                                        >
                                            {cat}
                                        </Button>
                                    ))}
                                </ScrollView>
                                <HelperText type="error" visible={!!errors.category}>
                                    {errors.category?.message as string}
                                </HelperText>
                            </View>
                        )}
                    />

                    <Button
                        mode="outlined"
                        onPress={() => setShowDatePicker(true)}
                        style={styles.input}
                        icon="calendar"
                    >
                        {formatShortDate(date.toISOString())}
                    </Button>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={(event: any, selectedDate?: Date) => {
                                setShowDatePicker(false);
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )}

                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Açıklama (Opsiyonel)"
                                value={value}
                                onChangeText={onChange}
                                mode="outlined"
                                style={styles.input}
                            />
                        )}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        loading={isSubmitting}
                        style={styles.button}
                    >
                        Kaydet
                    </Button>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flexGrow: 1,
    },
    input: {
        marginBottom: 8,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    categoryContainer: {
        paddingVertical: 8,
        gap: 8,
    },
    categoryButton: {
        marginRight: 8,
    },
    button: {
        marginTop: 20,
        paddingVertical: 6,
    }
});
