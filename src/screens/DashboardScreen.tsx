import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Text, IconButton, Surface, Button, Icon, Portal, Dialog, TextInput } from 'react-native-paper';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionCard } from '../components/TransactionCard';
import { PremiumBalanceCard } from '../components/PremiumBalanceCard';
import { GlassyCard } from '../components/GlassyCard';
import { useStore } from '../store';
import { formatCurrency, formatShortDate } from '../utils/format';
import { parseFormattedAmount } from '../utils/formatAmount';
import { formatAmountInput } from '../utils/formatAmount';
import { scheduleReminderNotification } from '../utils/notifications';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation';
import { useAppTheme } from '../hooks/useAppTheme';
import { useToast } from '../context/ToastContext';

import { useInterstitialAd } from '../hooks/useInterstitialAd';

export const DashboardScreen = () => {
    const theme = useAppTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { kpi, transactions, refreshDashboard, loading, dailySpending, reminders, fetchReminders, addReminder, userName } = useStore();
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const { showAdIfReady } = useInterstitialAd();

    const totalBalance = kpi.grandTotalIncome - kpi.grandTotalExpense;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todaysSpendingAmount = dailySpending.find(d => d.date === today)?.total || 0;

    // Quick Reminder States
    const [showReminderDialog, setShowReminderDialog] = useState(false);
    const [reminderTitle, setReminderTitle] = useState('');
    const [reminderAmount, setReminderAmount] = useState('');
    const [reminderDate, setReminderDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshDashboard();
            fetchReminders();
        }, [])
    );

    const handleOpenReminderDialog = () => {
        setReminderTitle('');
        setReminderAmount('');
        setReminderDate(new Date());
        setShowReminderDialog(true);
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const updated = new Date(reminderDate);
            updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setReminderDate(updated);
        }
    };

    const handleTimeChange = (_event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const updated = new Date(reminderDate);
            updated.setHours(selectedTime.getHours(), selectedTime.getMinutes());
            setReminderDate(updated);
        }
    };

    const handleSaveReminder = async () => {
        if (!reminderTitle.trim()) {
            showToast(i18n.t('titleRequired', { defaultValue: 'Başlık gerekli' }), 'error');
            return;
        }
        const amount = parseFormattedAmount(reminderAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast(i18n.t('validAmountRequired', { defaultValue: 'Geçerli bir tutar girin' }), 'error');
            return;
        }

        try {
            const newId = await addReminder({
                title: reminderTitle.trim(),
                amount,
                dayOfMonth: reminderDate.getDate(),
                type: 'bill',
            });

            await scheduleReminderNotification(newId, reminderTitle.trim(), amount, reminderDate);
            await fetchReminders();
            setShowReminderDialog(false);
            showToast(i18n.t('reminderSaved', { defaultValue: 'Hatırlatıcı kaydedildi! 🔔' }), 'success');
            showAdIfReady();
        } catch (e) {
            showToast(i18n.t('genericError', { defaultValue: 'Bir hata oluştu' }), 'error');
        }
    };

    const formatDateTR = (d: Date) => {
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    };
    const formatTimeTR = (d: Date) => {
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
            <LinearGradient
                colors={[theme.colors.background, theme.colors.cardGradientStart]}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 180 }]}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refreshDashboard} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTextContainer}>
                            <Text variant="headlineSmall" style={styles.brandText} children={`${i18n.t('welcome')} ${userName}`} />
                        </View>
                    </View>
                    <Surface
                        style={{
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            elevation: 0
                        }}
                        mode="flat"
                        children={
                            <IconButton
                                icon="cog"
                                iconColor={theme.colors.onSurface}
                                size={24}
                                onPress={() => navigation.navigate('Settings')}
                            />
                        }
                    />
                </View>

                {/* Premium Balance Card */}
                <View style={styles.balanceRow}>
                    <PremiumBalanceCard
                        balance={totalBalance}
                        income={kpi.totalIncome}
                        expense={kpi.totalExpense}
                        userName={userName}
                    />
                </View>

                {/* Quick Bill Reminder Card */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleOpenReminderDialog}
                    style={{ marginBottom: 12 }}
                >
                    <Surface
                        style={{
                            borderRadius: 14,
                            backgroundColor: theme.colors.surface,
                            elevation: 2,
                            overflow: 'hidden',
                        }}
                        children={
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {/* Left accent bar */}
                                <LinearGradient
                                    colors={['#FF9500', '#FF453A']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={{
                                        width: 5,
                                        height: '100%',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        borderTopLeftRadius: 14,
                                        borderBottomLeftRadius: 14,
                                    }}
                                />
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 14,
                                    paddingLeft: 18,
                                    paddingRight: 14,
                                }}>
                                <View style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        backgroundColor: '#FF950018',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                    }}>
                                        <Icon source="bell-plus" size={22} color="#FF9500" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="titleSmall" style={{ fontWeight: '700', color: theme.colors.onSurface }} children={i18n.t('quickReminder', { defaultValue: 'Fatura Hatırlatıcı Ekle' })} />
                                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 1 }} children={i18n.t('quickReminderDesc', { defaultValue: 'Son ödeme tarihi için alarm kur' })} />
                                    </View>
                                    <Icon source="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
                                </View>
                            </View>
                        }
                    />
                </TouchableOpacity>

                {/* Reminders Widget - Glassmorphism */}
                {reminders.length > 0 && (
                    <GlassyCard
                        style={styles.widgetGradient}
                        intensity={0.1}
                        gradientColors={['rgba(101, 31, 255, 0.15)', 'rgba(101, 31, 255, 0.05)']}
                        children={
                            <>
                                <View style={styles.widgetHeader}>
                                    <View style={styles.widgetTitleContainer}>
                                        <Icon source="bell-ring" size={24} color={theme.colors.secondary} />
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }} children={i18n.t('upcomingPayments')} />
                                    </View>
                                    <Button mode="text" textColor={theme.colors.secondary} onPress={() => navigation.navigate('Reminders')} children={i18n.t('viewAll')} />
                                </View>

                                {reminders.slice(0, 2).map((item) => (
                                    <View key={`reminder-${item.id}`} style={styles.reminderItem}>
                                        <View style={styles.reminderDate}>
                                            <Text style={styles.reminderDayText} children={String(item.dayOfMonth)} />
                                            <Text style={styles.reminderLabelText} children={i18n.t('day')} />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }} children={item.title} />
                                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} children={i18n.t('everyMonthDay', { day: item.dayOfMonth })} />
                                        </View>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }} children={formatCurrency(item.amount)} />
                                    </View>
                                ))}
                            </>
                        }
                    />
                )}

                {/* Daily Spending Widget */}
                <View style={styles.summaryRow}>
                    <SummaryCard
                        title={i18n.t('todaysSpending')}
                        amount={todaysSpendingAmount}
                        type="expense"
                        icon="calendar-today"
                    />
                </View>

                {/* Recent Transactions */}
                <View style={styles.sectionHeader}>
                    <Text variant="titleLarge" children={i18n.t('recentTransactions')} />
                    <Text
                        variant="labelLarge"
                        style={{ color: theme.colors.primary }}
                        onPress={() => navigation.navigate('TransactionsTab')}
                        children={i18n.t('seeAll')}
                    />
                </View>

                {/* List Container */}
                <View style={styles.listContainer}>
                    {transactions.slice(0, 5).map((item) => (
                        <View key={`transaction-${item.id}`}>
                            <TransactionCard
                                item={item}
                                onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
                            />
                        </View>
                    ))}
                    {transactions.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }} children={i18n.t('noTransactionsYet')} />
                        </View>
                    )}
                </View>

            </ScrollView>


            {/* Quick Reminder Dialog */}
            <Portal
                children={
                    <Dialog
                        visible={showReminderDialog}
                        onDismiss={() => setShowReminderDialog(false)}
                        style={{ borderRadius: 16, backgroundColor: theme.colors.surface }}
                        children={
                            <>
                                <Dialog.Title
                                    style={{ color: theme.colors.onSurface }}
                                    children={`🔔 ${i18n.t('quickReminder', { defaultValue: 'Fatura Hatırlatıcı' })}`}
                                />
                                <Dialog.Content
                                    children={
                                        <>
                                            <TextInput
                                                label={i18n.t('billName', { defaultValue: 'Fatura Adı' })}
                                                value={reminderTitle}
                                                onChangeText={setReminderTitle}
                                                mode="outlined"
                                                style={{ marginBottom: 12 }}
                                                placeholder="Elektrik, Su, Doğalgaz..."
                                            />
                                            <TextInput
                                                label={i18n.t('amount', { defaultValue: 'Tutar (₺)' })}
                                                value={reminderAmount}
                                                onChangeText={(text) => setReminderAmount(formatAmountInput(text))}
                                                mode="outlined"
                                                keyboardType="numeric"
                                                style={{ marginBottom: 16 }}
                                            />
                                            {/* Date Picker Button */}
                                            <TouchableOpacity
                                                onPress={() => setShowDatePicker(true)}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: theme.colors.surfaceVariant,
                                                    borderRadius: 10,
                                                    padding: 12,
                                                    marginBottom: 10,
                                                }}
                                            >
                                                <Icon source="calendar" size={22} color={theme.colors.primary} />
                                                <View style={{ flex: 1, marginLeft: 10 }}>
                                                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }} children={i18n.t('dueDate', { date: '', defaultValue: 'Son Ödeme Tarihi' })} />
                                                    <Text variant="bodyLarge" style={{ fontWeight: '700', color: theme.colors.onSurface }} children={formatDateTR(reminderDate)} />
                                                </View>
                                            </TouchableOpacity>
                                            {/* Time Picker Button */}
                                            <TouchableOpacity
                                                onPress={() => setShowTimePicker(true)}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: theme.colors.surfaceVariant,
                                                    borderRadius: 10,
                                                    padding: 12,
                                                }}
                                            >
                                                <Icon source="clock-outline" size={22} color="#FF9500" />
                                                <View style={{ flex: 1, marginLeft: 10 }}>
                                                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }} children={i18n.t('alarmTime', { defaultValue: 'Alarm Saati' })} />
                                                    <Text variant="bodyLarge" style={{ fontWeight: '700', color: theme.colors.onSurface }} children={formatTimeTR(reminderDate)} />
                                                </View>
                                            </TouchableOpacity>

                                            {showDatePicker && (
                                                <DateTimePicker
                                                    value={reminderDate}
                                                    mode="date"
                                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                    onChange={handleDateChange}
                                                    minimumDate={new Date()}
                                                />
                                            )}
                                            {showTimePicker && (
                                                <DateTimePicker
                                                    value={reminderDate}
                                                    mode="time"
                                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                    onChange={handleTimeChange}
                                                    is24Hour={true}
                                                />
                                            )}
                                        </>
                                    }
                                />
                                <Dialog.Actions
                                    children={
                                        <>
                                            <Button onPress={() => setShowReminderDialog(false)} textColor={theme.colors.onSurfaceVariant} children={i18n.t('cancel', { defaultValue: 'İptal' })} />
                                            <Button
                                                mode="contained"
                                                onPress={handleSaveReminder}
                                                style={{ borderRadius: 10, paddingHorizontal: 12 }}
                                                children={`${i18n.t('save', { defaultValue: 'Kaydet' })} 🔔`}
                                            />
                                        </>
                                    }
                                />
                            </>
                        }
                    />
                }
            />

            <TouchableOpacity
                style={[styles.fabContainer, { bottom: (insets.bottom || 20) + 150 }]}
                onPress={() => navigation.navigate('AddTransaction')}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={[theme.colors.accent, '#7C4DFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabGradient}
                >
                    <Icon source="plus" size={32} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 180, // Enough space for Banner + Tab Bar + System Nav
    },
    header: {
        marginBottom: 20,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontWeight: 'bold',
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    balanceRow: {
        marginBottom: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        borderRadius: 16,
    },
    widgetGradient: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(101, 31, 255, 0.2)',
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    reminderDate: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#651FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    listContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        backgroundColor: 'transparent',
    },
    headerTextContainer: {
        marginLeft: 12,
    },
    welcomeText: {

    },
    brandText: {
        fontWeight: 'bold',
    },
    widgetTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    noRemindersText: {
        fontStyle: 'italic',
    },
    reminderDayText: {
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    reminderLabelText: {
        fontSize: 10,
        color: '#FFF',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    fabContainer: {
        position: 'absolute',
        right: 20,
        // bottom sets dynamically in render
        width: 60,
        height: 60,
        borderRadius: 14,
        shadowColor: '#651FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 100,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});
