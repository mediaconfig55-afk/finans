import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { List, Text, useTheme, Divider, Searchbar, Chip } from 'react-native-paper';
import { useStore } from '../store';
import { formatCurrency, formatShortDate } from '../utils/format';
import { Transaction } from '../types';

export const TransactionsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { transactions, fetchTransactions } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filteredData = transactions.filter(t => {
        const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    const renderItem = ({ item }: { item: Transaction }) => (
        <List.Item
            title={item.category}
            description={item.description || formatShortDate(item.date)}
            onPress={() => (navigation as any).navigate('TransactionDetail', { transaction: item })}
            left={props => <List.Icon {...props} icon={item.type === 'income' ? 'arrow-up' : 'arrow-down'} color={item.type === 'income' ? (theme.colors as any).customIncome : (theme.colors as any).customExpense} />}
            right={() =>
                <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                    <Text style={{ color: item.type === 'income' ? (theme.colors as any).customIncome : (theme.colors as any).customExpense, fontWeight: 'bold' }}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatShortDate(item.date)}
                    </Text>
                </View>
            }
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Ara..."
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
                        Tümü
                    </Chip>
                    <Chip
                        selected={filterType === 'income'}
                        onPress={() => setFilterType('income')}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        Gelir
                    </Chip>
                    <Chip
                        selected={filterType === 'expense'}
                        onPress={() => setFilterType('expense')}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        Gider
                    </Chip>
                </View>
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                ItemSeparatorComponent={Divider}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text>İşlem bulunamadı.</Text>
                    </View>
                }
            />
        </View>
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
        paddingBottom: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    }
});
