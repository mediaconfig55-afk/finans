import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, useTheme, SegmentedButtons, Surface, ProgressBar, Icon, IconButton } from 'react-native-paper';
import { PieChart } from "react-native-gifted-charts";
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useStore } from '../store';
import { formatCurrency } from '../utils/format';
import { Transaction } from '../types';
import i18n from '../i18n';
import { startOfMonth, endOfMonth, format, isSameMonth, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale/tr';


interface CategoryData {
    name: string;
    amount: number;
    color: string;
    percentage: number;
    icon: string;
}

export const StatsScreen = () => {
    const theme = useTheme();
    const { transactions, fetchTransactions } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterType, setFilterType] = useState<'income' | 'expense'>('expense');

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return isSameMonth(tDate, selectedDate) && t.type === filterType;
        });
    }, [transactions, selectedDate, filterType]);

    const totalAmount = useMemo(() => {
        return filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);
    }, [filteredTransactions]);

    const categoryData = useMemo(() => {
        const grouped: Record<string, number> = {};

        filteredTransactions.forEach(t => {
            const cat = t.category;
            grouped[cat] = (grouped[cat] || 0) + t.amount;
        });

        const data: CategoryData[] = Object.keys(grouped).map(cat => {
            const amount = grouped[cat];
            return {
                name: cat,
                amount: amount,
                color: getCategoryColor(cat, theme),
                percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
                icon: getCategoryIcon(cat)
            };
        });

        return data.sort((a, b) => b.amount - a.amount);
    }, [filteredTransactions, totalAmount, theme]);

    const pieData = categoryData.map(d => ({
        value: d.amount,
        color: d.color,
        text: d.percentage > 5 ? `${Math.round(d.percentage)}%` : ''
    }));

    const nextMonth = () => setSelectedDate(addMonths(selectedDate, 1));
    const prevMonth = () => setSelectedDate(subMonths(selectedDate, 1));

    return (
        <ScreenWrapper
            children={
                <View style={styles.content}>
                    <View style={styles.header}>
                        <IconButton icon="chevron-left" onPress={prevMonth} />
                        <Text variant="titleLarge" style={{ fontWeight: 'bold' }} children={format(selectedDate, 'MMMM yyyy', { locale: tr })} />
                        <IconButton icon="chevron-right" onPress={nextMonth} />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                        <Surface
                            style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}
                            elevation={1}
                            children={
                                <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                        <Icon source="scale-balance" size={20} color={theme.colors.primary} />
                                        <Text variant="labelSmall" style={{ marginLeft: 6, color: theme.colors.onSurfaceVariant }} children={`${i18n.t('income')}/${i18n.t('expense')}`} />
                                    </View>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }} children={totalAmount > 0 ? (filterType === 'expense' ? `%${((totalAmount / (transactions.filter(t => isSameMonth(new Date(t.date), selectedDate) && t.type === 'income').reduce((a, c) => a + c.amount, 0) || 1)) * 100).toFixed(0)}` : '-') : '-'} />
                                    <Text variant="bodySmall" style={{ color: theme.colors.outline }} children={i18n.t('ratio')} />
                                </>
                            }
                        />

                        <Surface
                            style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}
                            elevation={1}
                            children={
                                <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                        <Icon source="calendar-clock" size={20} color={theme.colors.secondary} />
                                        <Text variant="labelSmall" style={{ marginLeft: 6, color: theme.colors.onSurfaceVariant }} children={i18n.t('dailyAverage')} />
                                    </View>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }} children={formatCurrency(totalAmount / new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate())} />
                                    <Text variant="bodySmall" style={{ color: theme.colors.outline }} children={i18n.t('spending')} />
                                </>
                            }
                        />
                    </View>

                    <SegmentedButtons
                        value={filterType}
                        onValueChange={(val: string) => setFilterType(val as 'income' | 'expense')}
                        buttons={[
                            { value: 'expense', label: i18n.t('expense'), icon: 'arrow-down' },
                            { value: 'income', label: i18n.t('income'), icon: 'arrow-up' },
                        ]}
                        style={styles.segmentedButton}
                    />

                    {categoryData.length > 0 ? (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
                            <View style={styles.chartContainer}>
                                <PieChart
                                    data={pieData}
                                    donut
                                    showGradient
                                    sectionAutoFocus
                                    radius={90}
                                    innerRadius={60}
                                    innerCircleColor={theme.colors.background}
                                    centerLabelComponent={() => {
                                        return (
                                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Text variant="titleMedium" style={{ fontSize: 20, fontWeight: 'bold' }} children={formatCurrency(totalAmount)} />
                                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} children={`${i18n.t('totalShort')} ${filterType === 'expense' ? i18n.t('expense') : i18n.t('income')}`} />
                                            </View>
                                        );
                                    }}
                                />
                            </View>

                            <View style={styles.listContainer}>
                                {categoryData.map((item, index) => (
                                    <Surface key={index} style={[styles.listItem, { backgroundColor: theme.colors.surface }]} elevation={0}
                                        children={
                                            <>
                                                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                                                    <Icon source={item.icon} size={24} color={item.color} />
                                                </View>
                                                <View style={styles.itemContent}>
                                                    <View style={styles.itemRow}>
                                                        <Text variant="titleMedium" style={{ flex: 1, fontWeight: '600' }} children={i18n.t(item.name, { defaultValue: item.name })} />
                                                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: item.color }} children={formatCurrency(item.amount)} />
                                                    </View>
                                                    <View style={styles.progressContainer}>
                                                        <ProgressBar progress={item.percentage / 100} color={item.color} style={styles.progressBar} />
                                                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8, minWidth: 35 }} children={`%${item.percentage.toFixed(1)}`} />
                                                    </View>
                                                </View>
                                            </>
                                        }
                                    />
                                ))}
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon source="chart-pie" size={64} color={theme.colors.outline} />
                            <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }} children={i18n.t('noData')} />
                        </View>
                    )}

                </View>
            }
        />
    );
};

// Helper functions for colors and icons
const getCategoryColor = (category: string, theme: any) => {
    // Map categories to new vibrant theme colors
    const colors: Record<string, string> = {
        market: '#FB923C', // Orange 400
        food: '#F472B6', // Pink 400
        transport: '#38BDF8', // Sky 400
        bill: '#EF4444', // Red 500
        rent: '#A78BFA', // Violet 400
        health: '#F87171', // Red 400
        clothing: '#22D3EE', // Cyan 400
        technology: '#94A3B8', // Slate 400
        entertainment: '#E879F9', // Fuchsia 400
        education: '#818CF8', // Indigo 400
        salary: '#34D399', // Emerald 400
        extraIncome: '#A3E635', // Lime 400
        investment: '#FACC15', // Yellow 400
        other: '#9CA3AF' // Gray 400
    };
    return colors[category] || theme.colors.primary;
};

const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
        market: 'cart',
        food: 'food',
        transport: 'bus',
        bill: 'file-document',
        rent: 'home',
        health: 'medical-bag',
        clothing: 'hanger',
        technology: 'laptop',
        entertainment: 'gamepad-variant',
        education: 'school',
        salary: 'cash-multiple',
        extraIncome: 'cash-plus',
        investment: 'chart-line',
        other: 'dots-horizontal'
    };
    return icons[category] || 'shape';
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    segmentedButton: {
        marginBottom: 24,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    listContainer: {
        gap: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        padding: 8,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    metricCard: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
    }
});
