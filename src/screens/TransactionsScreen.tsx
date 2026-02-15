import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, useTheme, Searchbar, Chip, Icon, Surface } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { useStore } from '../store';
import { formatCurrency, formatShortDate } from '../utils/format';
import { Transaction } from '../types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { TransactionCard } from '../components/TransactionCard';
import { groupTransactionsByDate } from '../utils/dateGrouping';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import i18n from '../i18n';

export const TransactionsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { transactions, debts, fetchTransactions, fetchDebts, deleteTransaction } = useStore();
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

    // Group all filtered data (transactions + debts)
    const groupedData = groupTransactionsByDate(filteredData);

    const handleDelete = (item: any) => {
        hapticLight();
        Alert.alert(
            i18n.t('delete'),
            i18n.t('deleteTransactionMessage'),
            [
                { text: i18n.t('cancel'), style: 'cancel' },
                {
                    text: i18n.t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        if (item.type !== 'debt') {
                            await deleteTransaction(item.id);
                            hapticSuccess();
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (item: any) => {
        hapticLight();
        if (item.type !== 'debt') {
            (navigation as any).navigate('TransactionDetail', { transaction: item });
        }
    };

    const renderRightActions = (item: any) => (
        <View style={styles.swipeActions}>
            <TouchableOpacity
                style={[styles.swipeButton, { backgroundColor: theme.colors.error }]}
                onPress={() => handleDelete(item)}
            >
                <Icon source="delete" size={24} color="#FFF" />
                <Text style={styles.swipeText}>Sil</Text>
            </TouchableOpacity>
        </View>
    );

    const renderLeftActions = (item: any) => (
        <View style={styles.swipeActions}>
            <TouchableOpacity
                style={[styles.swipeButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleEdit(item)}
            >
                <Icon source="pencil" size={24} color="#FFF" />
                <Text style={styles.swipeText}>Düzenle</Text>
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => {
        const isIncome = item.type === 'income';
        const isExpense = item.type === 'expense';
        const isDebt = item.type === 'debt';
        const color = isIncome ? (theme.colors as any).customIncome : isExpense ? (theme.colors as any).customExpense : theme.colors.error;
        const icon = isIncome ? 'arrow-up' : isExpense ? 'arrow-down' : 'alert-circle';

        return (
            <TransactionCard
                item={item}
                onPress={() => {
                    hapticLight();
                    item.type !== 'debt' && (navigation as any).navigate('TransactionDetail', { transaction: item });
                }}
                renderRightActions={() => renderRightActions(item)}
                renderLeftActions={() => renderLeftActions(item)}
            />
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
                        onPress={() => { hapticLight(); setFilterType('all'); }}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        {i18n.t('all')}
                    </Chip>
                    <Chip
                        selected={filterType === 'income'}
                        onPress={() => { hapticLight(); setFilterType('income'); }}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        {i18n.t('income')}
                    </Chip>
                    <Chip
                        selected={filterType === 'expense'}
                        onPress={() => { hapticLight(); setFilterType('expense'); }}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        {i18n.t('expense')}
                    </Chip>
                    <Chip
                        selected={filterType === 'debt'}
                        onPress={() => { hapticLight(); setFilterType('debt'); }}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        {i18n.t('debt')}
                    </Chip>
                </View>
            </View>

            <SectionList
                sections={groupedData}
                keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
                        <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            {title}
                        </Text>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={true}
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
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    listContent: {
        padding: 16,
        paddingBottom: 140, // Increased for Floating Tab Bar
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    swipeActions: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    swipeButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        paddingHorizontal: 12,
    },
    swipeText: {
        color: '#FFF',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
    },
});
