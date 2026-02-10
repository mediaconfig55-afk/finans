import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { COLORS, SIZES } from '../constants/colors';

const BalanceCard = ({ totalBalance, totalIncome, totalExpense }) => {
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        let subscription;
        const subscribe = () => {
            subscription = Accelerometer.addListener(({ x, y, z }) => {
                const acceleration = Math.sqrt(x * x + y * y + z * z);
                if (acceleration > 2.5) { // Shake threshold
                    setIsHidden(prev => !prev);
                }
            });
            Accelerometer.setUpdateInterval(500);
        };

        subscribe();
        return () => subscription && subscription.remove();
    }, []);

    const formatCurrency = (amount) => {
        if (isHidden) return '**** ₺';
        return `${amount.toFixed(2)} ₺`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Toplam Bakiye</Text>
                <TouchableOpacity onPress={() => setIsHidden(!isHidden)}>
                    <Ionicons name={isHidden ? "eye-off" : "eye"} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <Text style={styles.balance}>{formatCurrency(totalBalance)}</Text>

            <View style={styles.row}>
                <View style={styles.item}>
                    <View style={[styles.icon, { backgroundColor: `${COLORS.success}20` }]}>
                        <Ionicons name="arrow-down" size={16} color={COLORS.success} />
                    </View>
                    <View>
                        <Text style={styles.itemLabel}>Gelir</Text>
                        <Text style={[styles.itemAmount, { color: COLORS.success }]}>
                            {formatCurrency(totalIncome)}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.item}>
                    <View style={[styles.icon, { backgroundColor: `${COLORS.error}20` }]}>
                        <Ionicons name="arrow-up" size={16} color={COLORS.error} />
                    </View>
                    <View>
                        <Text style={styles.itemLabel}>Gider</Text>
                        <Text style={[styles.itemAmount, { color: COLORS.error }]}>
                            {formatCurrency(totalExpense)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surfaceLight,
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    balance: {
        color: COLORS.textPrimary,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    itemLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: COLORS.divider,
        marginHorizontal: 15,
    },
});

export default BalanceCard;
