import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { TextInput, Button, SegmentedButtons, HelperText, Switch, Text, Icon } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../store';
import { formatShortDate } from '../utils/format';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation';
import { useToast } from '../context/ToastContext';
import { useAppTheme } from '../hooks/useAppTheme';

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
    expense: ['market', 'food', 'transport', 'bill', 'entertainment', 'rent', 'health', 'clothing', 'technology', 'education', 'other'] as const,
};

export const AddTransactionScreen = () => {
    const theme = useAppTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { addTransaction, addInstallment } = useStore();

    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Toast
    const { showToast } = useToast();

    const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
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
    const description = watch('description');

    // Auto-categorization Logic
    useEffect(() => {
        if (!description) return;

        const lowerDesc = description.toLowerCase();
        let suggestedCategory = '';

        const keywords: Record<string, string[]> = {
            market: ['ekmek', 'süt', 'yumurta', 'market', 'bim', 'a101', 'şok', 'migros', 'gıda', 'alışveriş'],
            transport: ['yakıt', 'benzin', 'mazot', 'lpg', 'otobüs', 'metro', 'taksi', 'dolmuş', 'ulaşım', 'araba'],
            bill: ['fatura', 'elektrik', 'su', 'doğalgaz', 'internet', 'telefon', 'turkcell', 'vodafone', 'türk telekom'],
            rent: ['kira', 'aidat'],
            health: ['ilaç', 'eczane', 'hastane', 'doktor', 'muayene', 'diş'],
            clothing: ['kıyafet', 'giyim', 'ayakkabı', 'pantolon', 'gömlek', 'lcw', 'defacto'],
            technology: ['telefon', 'bilgisayar', 'kulaklık', 'teknoloji', 'şarj'],
            entertainment: ['sinema', 'bilet', 'netflix', 'spotify', 'oyun', 'eğlence'],
            salary: ['maaş', 'avans', 'prim']
        };

        for (const [cat, words] of Object.entries(keywords)) {
            if (words.some(w => lowerDesc.includes(w))) {
                suggestedCategory = cat;
                break;
            }
        }

        // Only set if category matches current type (expense/income) and is found
        if (suggestedCategory && (CATEGORIES[type] as readonly string[]).includes(suggestedCategory)) {
            const currentCat = watch('category');
            if (currentCat !== suggestedCategory) {
                setValue('category', suggestedCategory);
            }
        }
    }, [description, type]);

    const [isReminder, setIsReminder] = useState(false);
    const [reminderDate, setReminderDate] = useState(new Date());
    const [showReminderPicker, setShowReminderPicker] = useState(false);

    // ... (rest of logic) ...

    const onSubmit = async (data: FormData) => {
        try {
            let transactionId;
            // ... (existing logic for saving) except we capture the ID or just process reminders after
            // NOTE: The current store implementation of addTransaction doesn't return ID directly in all cases or properly awaits. 
            // We will modify the store to return ID or just handle it here. 
            // Actually, for now, let's just save the transaction. The notification needs an ID to be cancelable later.
            // If the store doesn't return ID, we might need a workaround or update the store.
            // Checking store... Repository.addTransaction returns Promise<void> but underlying SQlite returns ID.
            // For now, let's generate a random ID for notification reference or improvements.
            // WAITING: I'll assume for this step we just trigger it. 
            // BETTER: Let's assume we can functionality add reminder without linking strict ID first, or just use a timestamp-based ID for notification tag.

            const notificationId = Math.floor(Date.now() / 1000);

            if (type === 'expense' && data.isInstallment && data.installmentCount) {
                // ... existing installment logic ...
                // We won't add reminders for installments in this request specifically unless asked, 
                // but user said "reminder system". Let's stick to simple transaction reminder for now.

                const amountVal = parseFloat(data.amount.replace(',', '.'));
                const countVal = parseInt(data.installmentCount);
                const monthlyAmount = amountVal / countVal;

                // Use local date for consistency
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const localDate = `${year}-${month}-${day}`;

                await addInstallment({
                    totalAmount: amountVal,
                    totalMonths: countVal,
                    remainingMonths: countVal,
                    startDate: localDate,
                    description: data.description || `${i18n.t(data.category)} ${i18n.t('installment')}`,
                });

                await addTransaction({
                    type: 'expense',
                    amount: monthlyAmount,
                    category: data.category,
                    date: localDate,
                    description: `${data.description || i18n.t('installment')} (1/${countVal})`,
                });
            } else {
                // Normal Transaction
                const amountVal = parseFloat(data.amount.replace(',', '.'));
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const localDate = `${year}-${month}-${day}`;

                await addTransaction({
                    type,
                    amount: amountVal,
                    category: data.category,
                    description: data.description,
                    date: localDate,
                });

                // REMINDER LOGIC
                if (isReminder) {
                    const { useStore } = await import('../store');

                    // Add to store first to get the persistent DB ID
                    const reminderId = await useStore.getState().addReminder({
                        title: data.description || i18n.t(data.category),
                        amount: amountVal,
                        dayOfMonth: reminderDate.getDate(),
                        type: 'expense'
                    });

                    // Use the returned DB ID for the notification identifier
                    const { scheduleReminderNotification } = await import('../utils/notifications');
                    await scheduleReminderNotification(
                        reminderId,
                        data.description || i18n.t(data.category),
                        amountVal,
                        reminderDate
                    );
                }
            }
            showToast(i18n.t('saveSuccess', { type: i18n.t(type) }) + ' ✓', 'success');
            setTimeout(() => {
                navigation.goBack();
            }, 500);
        } catch (error) {
            console.error(error);
            showToast(i18n.t('saveError'), 'error');
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
                                setType(val as 'income' | 'expense');
                            }
                        }}
                        buttons={[
                            { value: 'income', label: i18n.t('income'), style: { backgroundColor: type === 'income' ? theme.colors.customIncome + '20' : undefined } },
                            { value: 'expense', label: i18n.t('expense'), style: { backgroundColor: type === 'expense' ? theme.colors.customExpense + '20' : undefined } },
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

                    <View style={styles.switchContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon source="alarm" size={24} color={theme.colors.primary} />
                            <Text variant="bodyLarge" style={{ marginLeft: 8 }}>{i18n.t('setReminder', { defaultValue: 'Hatırlatıcı Kur' })}</Text>
                        </View>
                        <Switch value={isReminder} onValueChange={setIsReminder} color={theme.colors.primary} />
                    </View>

                    {isReminder && (
                        <Button
                            mode="outlined"
                            onPress={() => setShowReminderPicker(true)}
                            style={styles.input}
                            icon="clock-outline"
                        >
                            {reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Button>
                    )}

                    {showReminderPicker && (
                        <DateTimePicker
                            value={reminderDate}
                            mode="time"
                            display="default"
                            onChange={(event: any, selectedDate?: Date) => {
                                setShowReminderPicker(false);
                                if (selectedDate) setReminderDate(selectedDate);
                            }}
                        />
                    )}

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
