import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, FAB, List, Divider, IconButton, Surface } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SummaryCard } from '../components/SummaryCard';
import { useStore } from '../store';
import { formatCurrency, formatShortDate } from '../utils/format';

export const DashboardScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
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
                    <View>
                        <Text variant="headlineMedium" style={styles.greeting}>Hoş Geldiniz 👋</Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            Finansal Durumunuz
                        </Text>
                    </View>
                    <IconButton
                        icon="cog"
                        size={28}
                        onPress={() => (navigation as any).navigate('Settings')}
                    />
                </View>

                {/* Reminders Widget */}
                <Surface style={[styles.reminderWidget, { backgroundColor: theme.colors.tertiaryContainer }]} elevation={2}>
                    <View style={styles.reminderHeader}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onTertiaryContainer }}>🔔 Yaklaşan Ödemeler</Text>
                        <IconButton
                            icon="arrow-right"
                            size={20}
                            iconColor={theme.colors.onTertiaryContainer}
                            onPress={() => (navigation as any).navigate('Reminders')}
                        />
                    </View>
                    {reminders.slice(0, 2).map(r => (
                        <View key={r.id} style={styles.reminderItem}>
                            <Text style={{ color: theme.colors.onTertiaryContainer }}>{r.title} ({r.dayOfMonth}. gün)</Text>
                            <Text style={{ fontWeight: 'bold', color: theme.colors.onTertiaryContainer }}>{formatCurrency(r.amount)}</Text>
                        </View>
                    ))}
                    {reminders.length === 0 && <Text style={{ color: theme.colors.onTertiaryContainer, opacity: 0.7 }}>Hatırlatıcı yok.</Text>}
                </Surface>

                {/* Summary Cards */}
                <View style={styles.summaryRow}>
                    <SummaryCard
                        title="Gelir"
                        amount={kpi.totalIncome}
                        type="income"
                        icon="arrow-up-circle"
                    />
                    <SummaryCard
                        title="Gider"
                        amount={kpi.totalExpense}
                        type="expense"
                        icon="arrow-down-circle"
                    />
                </View>
                <View style={styles.balanceRow}>
                    <SummaryCard
                        title="Net Bakiye"
                        amount={balance}
                        type="balance"
                        icon="wallet"
                    />
                </View>

                {/* Daily Spending Widget */}
                <View style={styles.summaryRow}>
                    <SummaryCard
                        title="Bugünkü Harcama"
                        amount={todaysSpending}
                        type="expense"
                        icon="calendar-today"
                    />
                </View>

                {/* Recent Transactions */}
                <View style={styles.sectionHeader}>
                    <Text variant="titleLarge">Son İşlemler</Text>
                    <Text
                        variant="labelLarge"
                        style={{ color: theme.colors.primary }}
                        onPress={() => navigation.navigate('TransactionsTab' as never)}
                    >
                        Tümünü Gör
                    </Text>
                </View>

                <View style={[styles.listContainer, { backgroundColor: theme.colors.elevation.level1 }]}>
                    {transactions.slice(0, 5).map((item, index) => (
                        <React.Fragment key={item.id}>
                            <List.Item
                                title={item.category}
                                description={item.description || formatShortDate(item.date)}
                                onPress={() => (navigation as any).navigate('TransactionDetail', { transaction: item })}
                                left={props => <List.Icon {...props} icon={item.type === 'income' ? 'arrow-up' : 'arrow-down'} color={item.type === 'income' ? (theme.colors as any).customIncome : (theme.colors as any).customExpense} />}
                                right={() => <Text style={{ alignSelf: 'center', color: item.type === 'income' ? (theme.colors as any).customIncome : (theme.colors as any).customExpense, fontWeight: 'bold' }}>{item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}</Text>}
                            />
                            {index < 4 && <Divider />}
                        </React.Fragment>
                    ))}
                    {transactions.length === 0 && (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Henüz işlem yok.</Text>
                        </View>
                    )}
                </View>

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
    reminderWidget: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    reminderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reminderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
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
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
