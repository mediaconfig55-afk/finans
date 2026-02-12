import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, useTheme, Text, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../store';
import { formatShortDate } from '../utils/format';
import { ScreenWrapper } from '../components/ScreenWrapper';
import i18n from '../i18n';

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
    const { addDebt } = useStore();

    const [type, setType] = useState<'debt' | 'receivable'>('debt');
    const [dueDate, setDueDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const showToast = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

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
                dueDate: dueDate.toISOString().split('T')[0],
                isPaid: 0,
                description: data.description,
            });
            showToast(i18n.t('saveSuccess', { type: type === 'debt' ? i18n.t('debt') : i18n.t('receivable') }) + ' ✓');
            setTimeout(() => {
                navigation.goBack();
            }, 1000);
        } catch (error) {
            console.error(error);
            Alert.alert(i18n.t('error'), i18n.t('debtAddError'));
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text variant="headlineSmall" style={styles.title}>{i18n.t('addDebtAction')}</Text>

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

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
                action={{
                    label: 'Tamam',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
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
