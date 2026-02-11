import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Text, useTheme, Divider, FAB, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store';
import { formatCurrency, formatShortDate } from '../utils/format';
import { Debt } from '../types';

export const DebtsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { debts, fetchDebts, toggleDebtStatus, deleteDebt } = useStore();

    useEffect(() => {
        fetchDebts();
    }, []);

    const renderItem = ({ item }: { item: Debt }) => {
        const isPaid = item.isPaid === 1;
        const color = item.type === 'receivable' ? (theme.colors as any).customIncome : (theme.colors as any).customExpense;

        return (
            <List.Item
                title={item.personName}
                description={`Vade: ${formatShortDate(item.dueDate || '')} ${item.description ? '- ' + item.description : ''}`}
                left={props => <List.Icon {...props} icon={item.type === 'receivable' ? 'arrow-top-right' : 'arrow-bottom-left'} color={color} />}
                right={props => (
                    <View style={styles.rightContainer}>
                        <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                            <Text style={{ color: color, fontWeight: 'bold', textDecorationLine: isPaid ? 'line-through' : 'none' }}>
                                {formatCurrency(item.amount)}
                            </Text>
                            <Text variant="labelSmall" style={{ color: isPaid ? theme.colors.primary : theme.colors.error }}>
                                {isPaid ? 'Ödendi' : 'Bekliyor'}
                            </Text>
                        </View>
                        <IconButton
                            icon={isPaid ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                            iconColor={isPaid ? theme.colors.primary : theme.colors.onSurfaceVariant}
                            onPress={() => toggleDebtStatus(item.id, item.isPaid)}
                        />
                        <IconButton
                            icon="delete"
                            iconColor={theme.colors.error}
                            onPress={() => deleteDebt(item.id)}
                        />
                    </View>
                )}
            />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={debts}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                ItemSeparatorComponent={Divider}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text>Kayıtlı borç/alacak bulunamadı.</Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
                color={theme.colors.onTertiary}
                label="Borç/Alacak Ekle"
                onPress={() => navigation.navigate('AddDebt' as never)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 80,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
