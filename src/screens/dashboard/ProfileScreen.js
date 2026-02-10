import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { COLORS, SIZES } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { exportToExcel } from '../../utils/excelExport';

// Mock transactions for export demo
const MOCK_TRANSACTIONS = [
    { id: '1', type: 'expense', category: 'Market', description: 'Haftalık alışveriş', amount: 1250, date: '2026-02-10' },
    { id: '2', type: 'income', category: 'Maaş', description: 'Şubat Ayı Maaşı', amount: 45000, date: '2026-02-01' },
    { id: '3', type: 'expense', category: 'Fatura', description: 'Elektrik Faturası', amount: 450, date: '2026-02-05' },
];

const ProfileScreen = () => {
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

    const handleLogout = async () => {
        Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış Yap', onPress: async () => await signOut(auth), style: 'destructive' }
        ]);
    };

    const handleExport = async () => {
        // In real app, fetch all transactions from Firestore here
        await exportToExcel(MOCK_TRANSACTIONS);
    };

    const toggleBiometric = () => {
        // Logic to persist setting would go here
        setIsBiometricEnabled(!isBiometricEnabled);
    };

    const SettingItem = ({ icon, title, value, onToggle, isSwitch = true }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={22} color={COLORS.textPrimary} />
                </View>
                <Text style={styles.settingTitle}>{title}</Text>
            </View>
            {isSwitch && (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.email}>{auth.currentUser?.email}</Text>
                    <Text style={styles.plan}>Pro Üyelik</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Uygulama Ayarları</Text>
                    <SettingItem
                        icon="finger-print"
                        title="Biyometrik Giriş"
                        value={isBiometricEnabled}
                        onToggle={toggleBiometric}
                    />
                    <SettingItem
                        icon="notifications"
                        title="Bildirimler"
                        value={isNotificationsEnabled}
                        onToggle={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
                    <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.success }]}>
                                <Ionicons name="document-text" size={22} color={COLORS.background} />
                            </View>
                            <Text style={styles.settingTitle}>Excel Olarak İndir (.xlsx)</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <Button
                    title="Çıkış Yap"
                    onPress={handleLogout}
                    variant="secondary"
                    style={{ marginTop: 20 }}
                />

                <Text style={styles.version}>v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SIZES.padding,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    email: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 5,
    },
    plan: {
        color: COLORS.gold,
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        overflow: 'hidden',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 10,
        marginLeft: 10,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 10,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 10,
    },
    version: {
        textAlign: 'center',
        color: COLORS.textMuted,
        marginTop: 10,
        fontSize: 12,
    }
});

export default ProfileScreen;
