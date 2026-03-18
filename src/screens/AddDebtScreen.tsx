import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, useTheme, Text, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../store';
import { formatShortDate } from '../utils/format';
import { ScreenWrapper } from '../components/ScreenWrapper';
import i18n from '../i18n';
import { formatAmountInput, parseFormattedAmount } from '../utils/formatAmount';
import { useToast } from '../context/ToastContext';
import { useInterstitialAd } from '../hooks/useInterstitialAd';

const schema = z.object({
    personName: z.string().min(1, i18n.t('personNameRequired')),
    amount: z.string()
        .min(1, i18n.t('amountRequired'))
        .transform((val) => val.replace(',', '.'))
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, i18n.t('validAmountRequired')),
    description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const AddDebtScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { addDebt, fetchDebts } = useStore();

    const [type, setType] = useState<'debt' | 'receivable'>('debt');
    const [dueDate, setDueDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Toast
    const { showToast } = useToast();
    const { showAdIfReady } = useInterstitialAd();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            personName: '',
            amount: '',
            description: '',
        }
    });

    const onSubmit = async (data: FormData) => {
        try {
            await addDebt({
                type,
                personName: data.personName,
                amount: parseFloat(data.amount.toString().replace(',', '.')),
                dueDate: dueDate.toISOString().split('T')[0],
                paidAmount: 0,
                isPaid: 0,
                description: data.description,
            });
            await fetchDebts();
            showToast(i18n.t('saveSuccess', { type: type === 'debt' ? i18n.t('debt') : i18n.t('receivable') }) + ' ✓', 'success');
            showAdIfReady();
            setTimeout(() => {
                navigation.goBack();
            }, 500);
        } catch (error) {
            console.error(error);
            showToast(i18n.t('error'), 'error');
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text variant="headlineSmall" style={styles.title}>{i18n.t('addDebtAction')}</Text>

                    <SegmentedButtons
                        value={type}
                        onValueChange={val => setType(val as 'debt' | 'receivable')}
                        buttons={[
                            { value: 'debt', label: i18n.t('debt') },
                            { value: 'receivable', label: i18n.t('receivable') },
                        ]}
                        style={styles.input}
                    />

                    <Controller
                        control={control}
                        name="personName"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <TextInput
                                    label={i18n.t('personNameLabel')}
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
                                    label={i18n.t('amount')}
                                    value={value?.toString()}
                                    onChangeText={(text) => onChange(formatAmountInput(text))}
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
                        {i18n.t('dueDateLabel', { date: formatShortDate(dueDate.toISOString()) })}
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
                                label={i18n.t('descriptionOptional')}
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
                        {i18n.t('save')}
                    </Button>

                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flexGrow: 1,
    },
    title: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 8,
    },
    button: {
        marginTop: 20,
        paddingVertical: 6,
    }
});
