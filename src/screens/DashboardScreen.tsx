import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, useTheme, FAB, List, Divider, IconButton, Surface, Avatar, Button, Icon } from 'react-native-paper';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionCard } from '../components/TransactionCard';
import { PremiumBalanceCard } from '../components/PremiumBalanceCard';
import { GlassyCard } from '../components/GlassyCard';
import { useStore } from '../store';
import { formatCurrency, formatShortDate } from '../utils/format';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation';

export const DashboardScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { kpi, transactions, refreshDashboard, loading, dailySpending, reminders, fetchReminders, userName } = useStore();
    const insets = useSafeAreaInsets();

    const totalBalance = kpi.totalIncome - kpi.totalExpense;
    const today = new Date().toISOString().split('T')[0];
    const todaysSpendingAmount = dailySpending.find(d => d.date === today)?.total || 0;

    useFocusEffect(
        useCallback(() => {
            refreshDashboard();
            fetchReminders();
        }, [])
    );

    return (
        <View style={[styles.container, { backgroundColor: '#000000', paddingTop: insets.top }]}>
            <LinearGradient
                colors={['#000000', '#121212']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} // Increased padding for floating dock
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refreshDashboard} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTextContainer}>
                            <Text variant="headlineSmall" style={styles.brandText}>{i18n.t('welcome')} {userName}</Text>
                        </View>
                    </View>
                    <IconButton
                        icon="cog"
                        iconColor={theme.colors.onSurface}
                        size={28}
                        onPress={() => navigation.navigate('Settings')}
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

                {/* Reminders Widget - Glassmorphism */}
                {reminders.length > 0 && (
                    <GlassyCard
                        style={styles.widgetGradient}
                        intensity={0.1}
                        gradientColors={['rgba(101, 31, 255, 0.15)', 'rgba(101, 31, 255, 0.05)']}
                    >
                        <View style={styles.widgetHeader}>
                            <View style={styles.widgetTitleContainer}>
                                <Icon source="bell-ring" size={24} color={theme.colors.secondary} />
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{i18n.t('upcomingPayments')}</Text>
                            </View>
                            <Button mode="text" textColor={theme.colors.secondary} onPress={() => navigation.navigate('Reminders')}>{i18n.t('viewAll')}</Button>
                        </View>

                        {reminders.slice(0, 2).map((item) => (
                            <View key={item.id} style={styles.reminderItem}>
                                <View style={styles.reminderDate}>
                                    <Text style={styles.reminderDayText}>{item.dayOfMonth}</Text>
                                    <Text style={styles.reminderLabelText}>{i18n.t('day')}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{item.title}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{i18n.t('everyMonthDay', { day: item.dayOfMonth })}</Text>
                                </View>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>{formatCurrency(item.amount)}</Text>
                            </View>
                        ))}
                    </GlassyCard>
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
                    <Text variant="titleLarge">{i18n.t('recentTransactions')}</Text>
                    <Text
                        variant="labelLarge"
                        style={{ color: theme.colors.primary }}
                        onPress={() => navigation.navigate('TransactionsTab' as never)}
                    >
                        {i18n.t('seeAll')}
                    </Text>
                </View>

                {/* List Container */}
                <View style={styles.listContainer}>
                    {transactions.slice(0, 5).map((item, index) => (
                        <React.Fragment key={item.id}>
                            <TransactionCard
                                item={item}
                                onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
                            />
                        </React.Fragment>
                    ))}
                    {transactions.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{i18n.t('noTransactionsYet')}</Text>
                        </View>
                    )}
                </View>

            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, {
                    backgroundColor: theme.colors.primary,
                    bottom: (insets.bottom || 16) + 85 // Sit just above the floating oval tab bar (approx 20 + 60 + 5)
                }]}
                color={theme.colors.onPrimary}
                onPress={() => navigation.navigate('AddTransaction' as never)}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 140, // Enough space for Floating Tab Bar
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
        backgroundColor: '#651FFF', // Secondary/Purple
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
});
