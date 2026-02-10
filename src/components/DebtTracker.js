import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { COLORS, SIZES } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const DebtTracker = () => {
    const [debts, setDebts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDebts();
    }, []);

    const loadDebts = async () => {
        try {
            // In a real scenario, you'd filter by 'debt' type and status 'unpaid'
            // For now, we simulate with mock data or fetch hypothetical debts
            // const q = query(collection(db, "transactions"), where("type", "==", "debt"), where("status", "==", "unpaid"));

            // Mock Data
            setDebts([
                { id: '1', title: 'Kredi Kartı', amount: 5000, dueDate: '2026-02-15', status: 'unpaid' },
                { id: '2', title: 'Ahmet Borç', amount: 1500, dueDate: '2026-02-20', status: 'unpaid' },
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsPaid = (item) => {
        Alert.alert('Borç Ödeme', `${item.title} tutarındaki borcu ödendi olarak işaretlemek istiyor musunuz?`, [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Evet, Ödendi', onPress: () => {
                    // Update logic here
                    setDebts(prev => prev.filter(d => d.id !== item.id));
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>Son Ödeme: {new Date(item.dueDate).toLocaleDateString('tr-TR')}</Text>
            </View>
            <View style={styles.actions}>
                <Text style={styles.amount}>{item.amount} ₺</Text>
                <TouchableOpacity style={styles.payButton} onPress={() => handleMarkAsPaid(item)}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (debts.length === 0 && !isLoading) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Yaklaşan Borçlar</Text>
            <FlatList
                data={debts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    headerTitle: {
        color: COLORS.textPrimary,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: SIZES.padding,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: 15,
        borderRadius: SIZES.radius,
        marginLeft: SIZES.padding,
        width: 250,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning,
    },
    info: {
        marginBottom: 10,
    },
    title: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    date: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        color: COLORS.warning,
        fontWeight: 'bold',
        fontSize: 18,
    },
    payButton: {
        marginLeft: 10,
    },
});

export default DebtTracker;
