import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme, Icon } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '../utils/format';
import i18n from '../i18n';

interface Props {
    balance: number;
    income: number;
    expense: number;
    userName?: string | null;
    onAddPress?: () => void;
}

export const PremiumBalanceCard = ({ balance, income, expense, userName, onAddPress }: Props) => {
    const theme = useTheme() as any;
    const isDark = theme.dark;

    // Theme-aware colors
    const primaryColor = theme.colors.primary;
    const incomeColor = theme.colors.customIncome || '#34C759';
    const expenseColor = theme.colors.customExpense || '#FF3B30';
    const textPrimary = isDark ? '#FFFFFF' : theme.colors.onSurface;
    const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceVariant;
    const dividerColor = isDark ? 'rgba(255,255,255,0.15)' : theme.colors.outline;
    const gradientStart = theme.colors.cardGradientStart;
    const gradientEnd = theme.colors.cardGradientEnd;
    const borderColor = isDark ? '#2C2C2E' : theme.colors.outline;

    return (
        <LinearGradient
            colors={[gradientStart, gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, { borderColor }]}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`${i18n.t('netBalance')}: ${formatCurrency(balance)}`}
        >
            {isDark && (
                <View style={styles.patternOverlay}>
                    <View style={[styles.circle, { top: -40, right: -40, width: 140, height: 140, backgroundColor: `${primaryColor}14` }]} />
                    <View style={[styles.circle, { bottom: -20, left: -20, width: 100, height: 100, backgroundColor: 'rgba(255, 255, 255, 0.03)' }]} />
                </View>
            )}

            <View style={styles.header}>
                <View>
                    <Text variant="labelMedium" style={[styles.label, { color: textSecondary }]}>{i18n.t('netBalance')}</Text>
                    <Text variant="displaySmall" style={[styles.balance, { color: textPrimary }]}>{formatCurrency(balance)}</Text>
                </View>
                <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}26` }]}>
                    <Icon source="wallet" size={24} color={primaryColor} />
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            <View style={styles.footer}>
                <View style={styles.stat}>
                    <View style={[styles.iconBox, { backgroundColor: `${incomeColor}26` }]}>
                        <Icon source="arrow-up" size={18} color={incomeColor} />
                    </View>
                    <View accessible={true} accessibilityLabel={`${i18n.t('income')}: ${formatCurrency(income)}`}>
                        <Text variant="labelSmall" style={[styles.subLabel, { color: textSecondary }]}>{i18n.t('income')}</Text>
                        <Text variant="titleMedium" style={[styles.subValue, { color: textPrimary }]}>{formatCurrency(income)}</Text>
                    </View>
                </View>

                <View style={[styles.verticalDivider, { backgroundColor: dividerColor }]} />

                <View style={styles.stat}>
                    <View style={[styles.iconBox, { backgroundColor: `${expenseColor}26` }]}>
                        <Icon source="arrow-down" size={18} color={expenseColor} />
                    </View>
                    <View accessible={true} accessibilityLabel={`${i18n.t('expense')}: ${formatCurrency(expense)}`}>
                        <Text variant="labelSmall" style={[styles.subLabel, { color: textSecondary }]}>{i18n.t('expense')}</Text>
                        <Text variant="titleMedium" style={[styles.subValue, { color: textPrimary }]}>{formatCurrency(expense)}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 24,
        width: '100%',
        minHeight: height < 700 ? 160 : 190,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
    },
    patternOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 1,
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    label: {
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    balance: {
        fontWeight: 'bold',
    },
    iconContainer: {
        padding: 10,
        borderRadius: 12,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    subLabel: {
        fontSize: 11,
    },
    subValue: {
        fontWeight: 'bold',
    },
    verticalDivider: {
        width: 1,
        height: 30,
        marginHorizontal: 16,
    }
});
