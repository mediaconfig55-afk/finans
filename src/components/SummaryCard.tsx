import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, useTheme, Icon } from 'react-native-paper';
import { GlassyCard } from './GlassyCard';
import { formatCurrency } from '../utils/format';

interface SummaryCardProps {
    title: string;
    amount: number;
    type: 'income' | 'expense' | 'balance';
    icon: string;
    onPress?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type, icon, onPress }) => {
    const theme = useTheme();

    const getColor = () => {
        if (type === 'income') return (theme.colors as any).customIncome;
        if (type === 'expense') return (theme.colors as any).customExpense;
        return amount >= 0 ? (theme.colors as any).customIncome : (theme.colors as any).customExpense;
    };

    const color = getColor();

    // Responsive font size based on amount length
    const formattedAmount = formatCurrency(amount);
    const getFontSize = () => {
        if (formattedAmount.length > 15) return 16; // Very long
        if (formattedAmount.length > 12) return 18; // Long
        if (formattedAmount.length > 9) return 20;  // Medium
        return 22; // Normal
    };

    const content = (
        <GlassyCard style={styles.card} intensity={0.08}>
            <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                    <Icon source={icon} size={20} color={color} />
                </View>
            </View>
            <Text variant="bodyMedium" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
                {title}
            </Text>
            <Text
                style={[styles.amount, { color, fontSize: getFontSize() }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
            >
                {formattedAmount}
            </Text>
        </GlassyCard>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 4,
        minHeight: 120,
        justifyContent: 'space-between',
    },
    iconContainer: {
        marginBottom: 8,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: 4,
        fontSize: 13,
    },
    amount: {
        fontWeight: 'bold',
        flexShrink: 1,
    },
});
