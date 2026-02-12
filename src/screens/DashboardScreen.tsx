import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, useTheme, FAB, List, Divider, IconButton, Surface, Avatar, Button, Icon } from 'react-native-paper';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SummaryCard } from '../components/SummaryCard';
import { useStore } from '../store';
import { formatCurrency, formatShortDate } from '../utils/format';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation';

export const DashboardScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { kpi, transactions, refreshDashboard, loading, dailySpending, reminders, fetchReminders } = useStore();

    useFocusEffect(
        useCallback(() => {
            refreshDashboard();
            fetchReminders();
        }, [])
    );

    const balance = kpi.totalIncome - kpi.totalExpense;

    // Calculate today's spending
    const today = new Date().toISOString().split('T')[0];
    const todaysSpending = dailySpending.find(d => d.date === today)?.total || 0;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refreshDashboard} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Avatar.Image size={48} source={require('../../assets/icon.png')} style={styles.avatar} />
                        <View style={styles.headerTextContainer}>
                            <Text variant="titleMedium" style={styles.welcomeText}>{i18n.t('welcome')}</Text>
                            <Text variant="headlineSmall" style={styles.brandText}>FİNANSIM</Text>
                        </View>
                    </View>
                    <IconButton
                        icon="cog"
                        iconColor={theme.colors.onSurface}
                        size={28}
                        onPress={() => navigation.navigate('Settings')}
                    />
                </View>

                {/* Reminders Widget - Glassmorphism */}
                <LinearGradient
                    colors={['rgba(101, 31, 255, 0.15)', 'rgba(101, 31, 255, 0.05)']}
                    style={styles.widgetGradient}
                >
                    <View style={styles.widgetHeader}>
                        <View style={styles.widgetTitleContainer}>
                            <Icon source="bell-ring" size={24} color={theme.colors.secondary} />
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{i18n.t('upcomingPayments')}</Text>
                        </View>
                        <Button mode="text" textColor={theme.colors.secondary} onPress={() => navigation.navigate('Reminders')}>{i18n.t('viewAll')}</Button>
                    </View>

                    {reminders.slice(0, 2).length === 0 ? (
                        <Text style={styles.noRemindersText}>{i18n.t('noUpcomingPayments')}</Text>
                    ) : (
                        reminders.slice(0, 2).map((item) => (
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
                        ))
                    )}
                </LinearGradient>

                {/* Summary Cards */}
                <View style={styles.summaryRow}>
                    <SummaryCard
                        title={i18n.t('income')}
                        amount={kpi.totalIncome}
                        type="income"
                        icon="arrow-up-circle"
                    />
                    <SummaryCard
                        title={i18n.t('expense')}
                        amount={kpi.totalExpense}
                        type="expense"
                        icon="arrow-down-circle"
                    />
                </View>
                <View style={styles.balanceRow}>
                    <SummaryCard
                        title={i18n.t('netBalance')}
                        amount={balance}
                        type="balance"
                        icon="wallet"
                    />
                </View>

                {/* Daily Spending Widget */}
                <View style={styles.summaryRow}>
                    <SummaryCard
                        title={i18n.t('todaysSpending')}
                        amount={todaysSpending}
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

                <Surface style={[styles.listContainer, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
                    {transactions.slice(0, 5).map((item, index) => (
                        <React.Fragment key={item.id}>
                            <List.Item
                                title={i18n.t(item.category)}
                                description={item.description || formatShortDate(item.date)}
                                titleStyle={{ fontWeight: 'bold', color: theme.colors.onSurface }}
                                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                                onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
                                left={props => <View style={{ justifyContent: 'center', marginLeft: 10 }}><Icon source={item.type === 'income' ? 'arrow-up' : 'arrow-down'} size={24} color={item.type === 'income' ? (theme.colors as any).customIncome : (theme.colors as any).customExpense} /></View>}
                                right={() => <Text style={{ alignSelf: 'center', color: item.type === 'income' ? (theme.colors as any).customIncome : (theme.colors as any).customExpense, fontWeight: 'bold', marginRight: 10 }}>{item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}</Text>}
                            />
                            {index < 4 && <Divider />}
                        </React.Fragment>
                    ))}
                    {transactions.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{i18n.t('noTransactionsYet')}</Text>
                        </View>
                    )}
                </Surface>

            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
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
        paddingBottom: 80,
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
