import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/colors';
import { getDynamicColor } from '../utils/themeUtils';

const TransactionCard = ({ item, onPress }) => {
    const isIncome = item.type === 'income';
    const isDebt = item.type === 'debt';

    const getIconName = () => {
        if (isIncome) return 'arrow-up';
        if (isDebt) return 'time-outline';
        return 'arrow-down';
    };

    const getColor = () => {
        if (isIncome) return COLORS.success;
        if (isDebt) return COLORS.warning;
        return COLORS.error;
    };

    const dynamicStyle = getDynamicColor(Math.abs(item.amount), item.type);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: `${getColor()}20` }]}>
                <Ionicons name={getIconName()} size={24} color={getColor()} />
            </View>

            <View style={styles.details}>
                <Text style={styles.title}>{item.category || 'Genel'}</Text>
                <Text style={styles.subtitle}>{item.description}</Text>
            </View>

            <View style={styles.amountContainer}>
                <Text style={[styles.amount, {
                    color: dynamicStyle.color,
                    textShadowColor: dynamicStyle.textShadowColor,
                    textShadowRadius: dynamicStyle.textShadowRadius,
                }]}>
                    {isIncome ? '+' : '-'}{Math.abs(item.amount).toFixed(2)} ₺
                </Text>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString('tr-TR')}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 12,
        borderRadius: SIZES.radius,
        marginBottom: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    details: {
        flex: 1,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    date: {
        color: COLORS.textMuted,
        fontSize: 10,
        marginTop: 2,
    },
});

export default TransactionCard;
