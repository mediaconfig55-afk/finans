import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, StatusBar } from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { COLORS, SIZES } from '../../constants/colors';
import BalanceCard from '../../components/BalanceCard';
import TransactionCard from '../../components/TransactionCard';
import DebtTracker from '../../components/DebtTracker';
import Button from '../../components/Button';

// Mock Data for initial testing
const MOCK_TRANSACTIONS = [
    { id: '1', type: 'expense', category: 'Market', description: 'Haftalık alışveriş', amount: 1250, date: '2026-02-10' },
    { id: '2', type: 'income', category: 'Maaş', description: 'Şubat Ayı Maaşı', amount: 45000, date: '2026-02-01' },
    { id: '3', type: 'expense', category: 'Fatura', description: 'Elektrik Faturası', amount: 450, date: '2026-02-05' },
    { id: '4', type: 'debt', category: 'Borç', description: 'Arkadaştan alınan', amount: 2000, date: '2026-02-08' },
];

const DashboardScreen = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
    const [summary, setSummary] = useState({
        totalBalance: 41300,
        totalIncome: 45000,
        totalExpense: 1700, // 1250 + 450
    });

    const loadData = async () => {
        // TODO: Connect to Firestore here
        // const q = query(collection(db, "transactions"), where("userId", "==", auth.currentUser.uid), orderBy("date", "desc"));
        // ...
        setRefreshing(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Merhaba,</Text>
                    <Text style={styles.username}>{auth.currentUser?.email?.split('@')[0] || 'Kullanıcı'}</Text>
                </View>
                <Button
                    title="Çıkış"
                    onPress={handleLogout}
                    variant="outline"
                    style={{ height: 36, paddingHorizontal: 12, marginVertical: 0 }}
                />
            </View>

            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <TransactionCard item={item} />}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        <BalanceCard
                            totalBalance={summary.totalBalance}
                            totalIncome={summary.totalIncome}
                            totalExpense={summary.totalExpense}
                        />

                        <DebtTracker />

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Son İşlemler</Text>
                            <Text style={styles.seeAll}>Tümünü Gör</Text>
                        </View>
                    </>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 20,
    },
    greeting: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
    },
    username: {
        color: COLORS.textPrimary,
        fontSize: SIZES.h2,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 100, // Space for Bottom Tab
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    seeAll: {
        color: COLORS.primary,
        fontSize: SIZES.body,
    },
});

export default DashboardScreen;
