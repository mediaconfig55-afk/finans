import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { List, Text, useTheme, Divider, Searchbar, Chip, Icon, Surface } from 'react-native-paper';
import { useStore } from '../store';
import { formatCurrency, formatShortDate } from '../utils/format';
import { Transaction } from '../types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import i18n from '../i18n';

export const TransactionsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { transactions, debts, fetchTransactions, fetchDebts } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'debt'>('all');

    useEffect(() => {
        fetchTransactions();
        fetchDebts();
    }, []);

    // Borçları da işlem listesine dahil et
    const allItems = [
        ...transactions,
        ...debts.map(d => ({
            id: d.id,
            type: 'debt' as const,
            amount: d.amount,
            category: d.personName,
            description: d.description,
            date: d.dueDate || new Date().toISOString(),
        }))
    ];

    const filteredData = allItems.filter(t => {
        const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    const renderItem = ({ item }: { item: any }) => {
        const isIncome = item.type === 'income';
        const isExpense = item.type === 'expense';
        const isDebt = item.type === 'debt';
        const color = isIncome ? (theme.colors as any).customIncome : isExpense ? (theme.colors as any).customExpense : theme.colors.error;
        const icon = isIncome ? 'arrow-up' : isExpense ? 'arrow-down' : 'alert-circle';

        return (
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <TouchableOpacity
                    onPress={() => item.type !== 'debt' && (navigation as any).navigate('TransactionDetail', { transaction: item })}
                    style={styles.cardContent}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                            <Icon source={icon} size={24} color={color} />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text variant="titleMedium" style={styles.categoryText}>
                                {i18n.t(item.category, { defaultValue: item.category })}
                            </Text>
                            {item.description && (
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {item.description}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.cardFooter}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {formatShortDate(item.date)}
                        </Text>
                        <Text variant="titleMedium" style={{ color: color, fontWeight: 'bold' }}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Surface>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Searchbar
                    placeholder={i18n.t('search')}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />
                <View style={styles.chips}>
                    <Chip
                        selected={filterType === 'all'}
                        onPress={() => setFilterType('all')}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        {i18n.t('all')}
                    </Chip>
                    <Chip
                        selected={filterType === 'income'}
                        onPress={() => setFilterType('income')}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        {i18n.t('income')}
                    </Chip>
                    <Chip
                        selected={filterType === 'expense'}
                        onPress={() => setFilterType('expense')}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        {i18n.t('expense')}
                    </Chip>
                    <Chip
                        selected={filterType === 'debt'}
                        onPress={() => setFilterType('debt')}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        {i18n.t('debt')}
                    </Chip>
                </View>
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={item => `${item.type}-${item.id}`}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text>{i18n.t('noTransactionsFound')}</Text>
                    </View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    searchBar: {
        marginBottom: 12,
    },
    chips: {
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        marginRight: 8,
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    categoryText: {
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    }
});
