import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface, Icon } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { GlassyCard } from './GlassyCard';
import { formatCurrency, formatShortDate } from '../utils/format';
import i18n from '../i18n';
import { Transaction } from '../types';

interface Props {
    item: Transaction | any;
    onPress?: () => void;
    renderRightActions?: () => React.ReactNode;
    renderLeftActions?: () => React.ReactNode;
}

export const TransactionCard = ({ item, onPress, renderRightActions, renderLeftActions }: Props) => {
    const theme = useTheme();
    const isIncome = item.type === 'income';
    const isExpense = item.type === 'expense';
    const isDebt = item.type === 'debt';

    // Determine colors and icons based on type
    let color = theme.colors.primary;
    let icon = 'circle';
    let bgColor = theme.colors.primaryContainer;

    if (isIncome) {
        color = (theme.colors as any).customIncome || '#4CAF50';
        icon = 'arrow-up';
        bgColor = color + '20';
    } else if (isExpense) {
        color = (theme.colors as any).customExpense || '#F44336';
        icon = 'arrow-down';
        bgColor = color + '20';
    } else if (isDebt) {
        color = theme.colors.error;
        icon = 'alert-circle';
        bgColor = color + '20';
    }

    // Category Icon Mapping (Basic)
    const getCategoryIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('market') || cat.includes('food')) return 'cart';
        if (cat.includes('bill') || cat.includes('fatura')) return 'file-document';
        if (cat.includes('transport') || cat.includes('ulasim')) return 'bus';
        if (cat.includes('rent') || cat.includes('kira')) return 'home';
        if (cat.includes('health') || cat.includes('saglik')) return 'medical-bag';
        if (cat.includes('salary') || cat.includes('maas')) return 'cash-multiple';
        return icon; // Fallback to type icon if no specific category match
    };

    const displayIcon = getCategoryIcon(item.category);

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            renderLeftActions={renderLeftActions}
            overshootRight={false}
            overshootLeft={false}
        >
            <GlassyCard style={styles.card} intensity={0.08}>
                <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
                    <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                        <Icon source={displayIcon} size={24} color={color} />
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.topRow}>
                            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                                {i18n.t(item.category, { defaultValue: item.category })}
                            </Text>
                            <Text variant="titleMedium" style={[styles.amount, { color: color }]}>
                                {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                            </Text>
                        </View>

                        <View style={styles.bottomRow}>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                                {item.description || i18n.t('noDescription')}
                            </Text>
                            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                                {formatShortDate(item.date)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </GlassyCard>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginVertical: 6,
        marginHorizontal: 2,
        overflow: 'hidden',
    },
    touchable: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    amount: {
        fontWeight: 'bold',
    },
});
