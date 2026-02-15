import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme, Icon, IconButton } from 'react-native-paper';
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
    const theme = useTheme();

    return (
        <LinearGradient
            // Matte Dark Gradient with Orange Glow
            colors={['#1C1C1E', '#2C2C2E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.patternOverlay}>
                <View style={[styles.circle, { top: -40, right: -40, width: 140, height: 140, backgroundColor: 'rgba(255, 107, 0, 0.08)' }]} />
                <View style={[styles.circle, { bottom: -20, left: -20, width: 100, height: 100, backgroundColor: 'rgba(255, 255, 255, 0.03)' }]} />
            </View>

            <View style={styles.header}>
                <View>
                    <Text variant="labelMedium" style={styles.label}>{i18n.t('netBalance')}</Text>
                    <Text variant="displaySmall" style={styles.balance}>{formatCurrency(balance)}</Text>
                </View>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 107, 0, 0.15)' }]}>
                    <Icon source="wallet" size={24} color="#FF6B00" />
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
                <View style={styles.stat}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                        <Icon source="arrow-up" size={18} color="#34C759" />
                    </View>
                    <View>
                        <Text variant="labelSmall" style={styles.subLabel}>{i18n.t('income')}</Text>
                        <Text variant="titleMedium" style={styles.subValue}>{formatCurrency(income)}</Text>
                    </View>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.stat}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                        <Icon source="arrow-down" size={18} color="#FF3B30" />
                    </View>
                    <View>
                        <Text variant="labelSmall" style={styles.subLabel}>{i18n.t('expense')}</Text>
                        <Text variant="titleMedium" style={styles.subValue}>{formatCurrency(expense)}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        borderRadius: 32,
        padding: 24,
        width: '100%',
        minHeight: height < 700 ? 160 : 190, // Responsive height for smaller screens
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2C2C2E',
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
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    balance: {
        color: '#FFF',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    iconContainer: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 10,
        borderRadius: 16,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
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
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    subLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
    },
    subValue: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    verticalDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 16,
    }
});
