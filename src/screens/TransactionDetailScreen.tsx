import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, SegmentedButtons, HelperText, useTheme, Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../store';
import { formatShortDate } from '../utils/format';
import { Transaction } from '../types';
import i18n from '../i18n';
import { useToast } from '../context/ToastContext';

const schema = z.object({
    amount: z.string().min(1, i18n.t('amountRequired')).transform((val) => parseFloat(val.replace(',', '.'))).refine((val) => !isNaN(val) && val > 0, i18n.t('validAmountRequired')),
    description: z.string().optional(),
    category: z.string().min(1, i18n.t('categoryRequired')),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = {
    income: ['salary', 'extraIncome', 'investment', 'other'] as const,
    expense: ['market', 'food', 'transport', 'bill', 'entertainment', 'rent', 'health', 'clothing', 'technology', 'other'] as const,
};

export const TransactionDetailScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { updateTransaction, deleteTransaction } = useStore();
    const { transaction } = route.params as { transaction: Transaction };

    const [isEditing, setIsEditing] = useState(false);
    const [type, setType] = useState<'income' | 'expense'>(transaction.type);
    const [date, setDate] = useState(new Date(transaction.date));
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<any>({
        resolver: zodResolver(schema),
        defaultValues: {
            amount: transaction.amount.toString(),
            description: transaction.description || '',
            category: transaction.category,
        }
    });

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                !isEditing ? (
                    <Button onPress={() => setIsEditing(true)}>{i18n.t('edit')}</Button>
                ) : null
            ),
            title: isEditing ? i18n.t('editTransaction') : i18n.t('transactionDetail')
        });
    }, [navigation, isEditing]);

    // Toast
    const { showToast } = useToast();

    const onSubmit = async (data: any) => {
        try {
            await updateTransaction({
                ...transaction,
                type,
                amount: parseFloat(data.amount), // Ensure amount is number if not already processed by zod
                category: data.category,
                date: date.toISOString().split('T')[0],
                description: data.description,
            });
            showToast(i18n.t('transactionUpdated'), 'success');
            setIsEditing(false);
            navigation.goBack();
        } catch (error) {
            console.error(error);
            showToast(i18n.t('updateError'), 'error');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            i18n.t('delete'),
            i18n.t('deleteTransactionMessage'),
            [
                { text: i18n.t('cancel'), style: 'cancel' },
                {
                    text: i18n.t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await deleteTransaction(transaction.id);
                        showToast(i18n.t('transactionDeleted'), 'success');
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    if (!isEditing) {
        return (
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="headlineMedium" style={{ color: type === 'income' ? (theme.colors as any).customIncome : (theme.colors as any).customExpense, fontWeight: 'bold', marginBottom: 8 }}>
                        {type === 'income' ? '+' : '-'}{transaction.amount} ₺
                    </Text>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>{i18n.t(transaction.category)}</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>{formatShortDate(transaction.date)}</Text>

                    <Text variant="bodyLarge">{transaction.description || i18n.t('noDescription')}</Text>
                </View>

                <Button mode="contained-tonal" icon="delete" onPress={handleDelete} style={{ marginTop: 24 }} textColor={theme.colors.error}>
                    {i18n.t('deleteTransaction')}
                </Button>
            </ScrollView>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>

                <SegmentedButtons
                    value={type}
                    onValueChange={val => setType(val as any)}
                    buttons={[
                        { value: 'income', label: i18n.t('income'), style: { backgroundColor: type === 'income' ? (theme.colors as any).customIncome + '20' : undefined } },
                        { value: 'expense', label: i18n.t('expense'), style: { backgroundColor: type === 'expense' ? (theme.colors as any).customExpense + '20' : undefined } },
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
                        onChange={(event, selectedDate) => {
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
                            label={i18n.t('description')}
                            value={value}
                            onChangeText={onChange}
                            mode="outlined"
                            style={styles.input}
                        />
                    )}
                />

                <View style={styles.buttonRow}>
                    <Button mode="outlined" onPress={() => setIsEditing(false)} style={{ flex: 1, marginRight: 8 }}>
                        {i18n.t('cancel')}
                    </Button>
                    <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={{ flex: 1 }}>
                        {i18n.t('save')}
                    </Button>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flexGrow: 1,
    },
    card: {
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    input: {
        marginBottom: 8,
    },
    categoryContainer: {
        paddingVertical: 8,
        gap: 8,
    },
    categoryButton: {
        marginRight: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 20,
    }
});
