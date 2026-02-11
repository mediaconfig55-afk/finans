import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, SegmentedButtons, HelperText, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../store';
import { formatShortDate } from '../utils/format';

const schema = z.object({
    personName: z.string().min(1, 'Kişi adı gereklidir'),
    amount: z.string().min(1, 'Tutar gereklidir').transform((val) => parseFloat(val.replace(',', '.'))).refine((val) => !isNaN(val) && val > 0, 'Geçerli bir tutar giriniz'),
    description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const AddDebtScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { addDebt } = useStore();

    const [type, setType] = useState<'debt' | 'receivable'>('receivable'); // receivable = Alacak, debt = Borç
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
        resolver: zodResolver(schema),
        defaultValues: {
            personName: '',
            amount: '',
            description: '',
        }
    });

    const onSubmit = async (data: any) => {
        try {
            await addDebt({
                type,
                personName: data.personName,
                amount: data.amount,
                dueDate: dueDate.toISOString(),
                isPaid: 0,
                description: data.description,
            });
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Kayıt eklenirken bir hata oluştu');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>

                <SegmentedButtons
                    value={type}
                    onValueChange={val => setType(val as any)}
                    buttons={[
                        { value: 'receivable', label: 'Alacak', style: { backgroundColor: type === 'receivable' ? (theme.colors as any).customIncome + '20' : undefined } },
                        { value: 'debt', label: 'Borç', style: { backgroundColor: type === 'debt' ? (theme.colors as any).customExpense + '20' : undefined } },
                    ]}
                    style={styles.input}
                />

                <Controller
                    control={control}
                    name="personName"
                    render={({ field: { onChange, value } }) => (
                        <>
                            <TextInput
                                label="Kişi Adı"
                                value={value}
                                onChangeText={onChange}
                                mode="outlined"
                                style={styles.input}
                                error={!!errors.personName}
                            />
                            <HelperText type="error" visible={!!errors.personName}>
                                {errors.personName?.message as string}
                            </HelperText>
                        </>
                    )}
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

                <Button
                    mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                    style={styles.input}
                    icon="calendar"
                >
                    Vade Tarihi: {formatShortDate(dueDate.toISOString())}
                </Button>

                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDueDate(selectedDate);
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
    button: {
        marginTop: 20,
        paddingVertical: 6,
    }
});
