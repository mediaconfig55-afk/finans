import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme, Icon } from 'react-native-paper';
import { formatCurrency } from '../utils/format';

interface SummaryCardProps {
    title: string;
    amount: number;
    type: 'income' | 'expense' | 'balance';
    icon: string;
}

export const SummaryCard = ({ title, amount, type, icon }: SummaryCardProps) => {
    const theme = useTheme();

    const getColor = () => {
        switch (type) {
            case 'income': return (theme.colors as any).customIncome;
            case 'expense': return (theme.colors as any).customExpense;
            case 'balance': return theme.colors.primary;
            default: return theme.colors.primary;
        }
    };

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
            <Card.Content style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: getColor() + '20' }]}>
                    <Icon source={icon} size={24} color={getColor()} />
                </View>
                <View>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{title}</Text>
                    <Text variant="titleMedium" style={{ color: getColor(), fontWeight: 'bold' }}>
                        {formatCurrency(amount)}
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 4,
        borderRadius: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 8,
    }
});
