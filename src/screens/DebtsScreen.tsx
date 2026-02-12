import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, FAB, IconButton, Icon, Surface } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useStore } from '../store';
import { formatCurrency, formatShortDate } from '../utils/format';
import { Debt } from '../types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation';
import i18n from '../i18n';
import { Portal, Dialog, Button, TextInput, ProgressBar } from 'react-native-paper';
import { useState } from 'react';

export const DebtsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { debts, fetchDebts, toggleDebtStatus, deleteDebt, updateDebt } = useStore();
    const [visible, setVisible] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        fetchDebts();
    }, []);

    const showPaymentDialog = (debt: Debt) => {
        setSelectedDebt(debt);
        setPaymentAmount('');
        setVisible(true);
    };

    const hideDialog = () => setVisible(false);

    const handlePayment = async () => {
        if (!selectedDebt || !paymentAmount) return;
        const amount = parseFloat(paymentAmount.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
            alert(i18n.t('validAmountRequired'));
            return;
        }

        const newPaidAmount = (selectedDebt.paidAmount || 0) + amount;
        const isFullyPaid = newPaidAmount >= selectedDebt.amount;

        await updateDebt({
            ...selectedDebt,
            paidAmount: newPaidAmount,
            isPaid: isFullyPaid ? 1 : 0
        });

        hideDialog();
    };

    // Sadece borçları göster (type === 'debt')
    const debtItems = debts.filter(d => d.type === 'debt');

    const renderItem = ({ item }: { item: Debt }) => {
        const isPaid = item.isPaid === 1;
        const color = (theme.colors as any).customExpense;
        const progress = item.amount > 0 ? (item.paidAmount || 0) / item.amount : 0;

        return (
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <TouchableOpacity style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                            <Icon source="alert-circle" size={24} color={color} />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, textDecorationLine: isPaid ? 'line-through' : 'none' }}>
                                {item.personName}
                            </Text>
                            {item.description && (
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {item.description}
                                </Text>
                            )}
                            {item.dueDate && (
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {i18n.t('dueDate', { date: formatShortDate(item.dueDate) })}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.cardFooter}>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={{ color: color, fontWeight: 'bold', textDecorationLine: isPaid ? 'line-through' : 'none' }}>
                                {formatCurrency(item.amount)}
                            </Text>
                            <Text variant="labelSmall" style={{ color: isPaid ? theme.colors.primary : theme.colors.error, marginBottom: 4 }}>
                                {isPaid ? i18n.t('paid') : `${i18n.t('waiting')} (${formatCurrency(item.amount - (item.paidAmount || 0))} ${i18n.t('remaining')})`}
                            </Text>
                            <ProgressBar progress={Math.min(progress, 1)} color={isPaid ? theme.colors.primary : color} style={{ height: 6, borderRadius: 3, marginRight: 16 }} />
                        </View>
                        <View style={styles.actions}>
                            <IconButton
                                icon={isPaid ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                                iconColor={isPaid ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                onPress={() => toggleDebtStatus(item.id, item.isPaid)}
                            />
                            {!isPaid && (
                                <IconButton
                                    icon="cash-plus"
                                    iconColor={theme.colors.primary}
                                    onPress={() => showPaymentDialog(item)}
                                />
                            )}
                            <IconButton
                                icon="delete"
                                iconColor={theme.colors.error}
                                onPress={() => deleteDebt(item.id)}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Surface>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.headerTitle}>{i18n.t('myDebts')}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {i18n.t('debtsDesc')}
                </Text>
            </View>

            <FlatList
                data={debtItems}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon source="check-circle" size={64} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodyLarge" style={styles.emptyTitle}>
                            {i18n.t('noDebts')}
                        </Text>
                        <Text variant="bodySmall" style={styles.emptySubtitle}>
                            {i18n.t('addDebtHint')}
                        </Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                label={i18n.t('addDebtAction')}
                style={[styles.fab, { bottom: insets.bottom + 16, backgroundColor: theme.colors.primary }]}
                color={theme.colors.onPrimary}
                onPress={() => navigation.navigate('AddDebt')}
            />

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog} style={{ backgroundColor: theme.colors.surface }}>
                    <Dialog.Title>{i18n.t('addPayment')}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
                            {i18n.t('currentDebt')}: {selectedDebt ? formatCurrency(selectedDebt.amount - (selectedDebt.paidAmount || 0)) : ''}
                        </Text>
                        <TextInput
                            label={i18n.t('paymentAmount')}
                            value={paymentAmount}
                            onChangeText={setPaymentAmount}
                            keyboardType="decimal-pad"
                            mode="outlined"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>{i18n.t('cancel')}</Button>
                        <Button onPress={handlePayment}>{i18n.t('save')}</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
    },
    headerTitle: {
        fontWeight: 'bold',
    },
    emptyTitle: {
        marginTop: 16,
        color: 'rgba(0,0,0,0.6)', // defaulting to avoid theme issue here or use inline
    },
    emptySubtitle: {
        marginTop: 8,
        color: 'rgba(0,0,0,0.6)',
    },
});
