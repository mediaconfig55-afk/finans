import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { TextInput, Button, SegmentedButtons, HelperText, useTheme, Switch, Text, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../store';
import { formatShortDate } from '../utils/format';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation';

const schema = z.object({
    amount: z.string()
        .min(1, i18n.t('amountRequired'))
        .refine((val) => !isNaN(parseFloat(val.replace(',', '.'))) && parseFloat(val.replace(',', '.')) > 0, i18n.t('validAmountRequired')),
    description: z.string().optional(),
    category: z.string().min(1, i18n.t('categoryRequired')),
    isInstallment: z.boolean().optional(),
    installmentCount: z.string().optional(),
}).refine((data) => {
    if (data.isInstallment && (!data.installmentCount || parseInt(data.installmentCount) < 2)) {
        return false;
    }
    return true;
}, {
    message: i18n.t('minInstallment'),
    path: ["installmentCount"]
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = {
    income: ['salary', 'extraIncome', 'investment', 'other'] as const,
    expense: ['food', 'transport', 'bill', 'entertainment', 'rent', 'health', 'clothing', 'technology', 'other'] as const,
};

export const AddTransactionScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { addTransaction, addInstallment } = useStore();

    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const showToast = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
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

    const onSubmit = async (data: FormData) => {
        try {
            if (type === 'expense' && data.isInstallment && data.installmentCount) {
                // Handle Installment
                const amountVal = parseFloat(data.amount.replace(',', '.'));
                const countVal = parseInt(data.installmentCount);
                const monthlyAmount = amountVal / countVal;

                await addInstallment({
                    totalAmount: amountVal,
                    totalMonths: countVal,
                    remainingMonths: countVal,
                    startDate: date.toISOString(),
                    description: data.description || `${i18n.t(data.category)} ${i18n.t('installment')}`,
                });

                // Add first month transaction immediately
                await addTransaction({
                    type: 'expense',
                    amount: monthlyAmount,
                    category: data.category,
                    date: date.toISOString(),
                    description: `${data.description || i18n.t('installment')} (1/${countVal})`,
                });
                showToast(i18n.t('saveSuccess', { type: i18n.t('installment') + ' ' + i18n.t('transactionDetail') })); // Adjusted for simplicity
                setTimeout(() => {
                    navigation.goBack();
                }, 1000);

            } else {
                // Normal Transaction
                const amountVal = parseFloat(data.amount.replace(',', '.'));
                await addTransaction({
                    type,
                    amount: amountVal,
                    category: data.category,
                    description: data.description,
                    date: date.toISOString().split('T')[0],
                });
                showToast(i18n.t('saveSuccess', { type: i18n.t(type) }));
                setTimeout(() => {
                    navigation.goBack();
                }, 1000);
            }
        } catch (error) {
            console.error(error);
            Alert.alert(i18n.t('error'), i18n.t('saveError'));
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>

                    <SegmentedButtons
                        value={type}
                        onValueChange={(val: string) => {
                            if (val === 'debt') {
                                navigation.navigate('AddDebt');
                            } else {
                                setType(val as any);
                            }
                        }}
                        buttons={[
                            { value: 'income', label: i18n.t('income'), style: { backgroundColor: type === 'income' ? (theme.colors as any).customIncome + '20' : undefined } },
                            { value: 'expense', label: i18n.t('expense'), style: { backgroundColor: type === 'expense' ? (theme.colors as any).customExpense + '20' : undefined } },
                            { value: 'debt', label: i18n.t('debt'), style: { backgroundColor: theme.colors.surfaceVariant } },
                        ]}
                        style={styles.input}
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

                    {type === 'expense' && (
                        <Controller
                            control={control}
                            name="isInstallment"
                            render={({ field: { onChange, value } }) => (
                                <View style={styles.switchContainer}>
                                    <Text variant="bodyLarge">{i18n.t('installment')}</Text>
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
                                        label={i18n.t('installmentCount')}
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
                                            {i18n.t(cat)}
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
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
