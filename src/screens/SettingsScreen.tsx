
import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { List, Switch, useTheme, Divider, ActivityIndicator, Text, Button } from 'react-native-paper';
import { useStore } from '../store';
import { exportToExcel } from '../utils/export';
import i18n from '../i18n';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useToast } from '../context/ToastContext';
import { AdBanner } from '../components/AdBanner';
import { useInterstitialAd } from '../hooks/useInterstitialAd';

export const SettingsScreen = () => {
    const theme = useTheme();
    // FIX: Separate selectors to avoid re-render loop
    const transactions = useStore((state) => state.transactions);
    const debts = useStore((state) => state.debts);
    const fetchDebts = useStore((state) => state.fetchDebts);
    const fetchTransactions = useStore((state) => state.fetchTransactions);
    const themeMode = useStore((state) => state.theme);
    const setTheme = useStore((state) => state.setTheme);
    const [exporting, setExporting] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Check real notification permission on mount
    React.useEffect(() => {
        Notifications.getPermissionsAsync().then(({ status }) => {
            setNotificationsEnabled(status === 'granted');
        });
    }, []);

    const { showToast } = useToast();
    const { showAdIfReady } = useInterstitialAd();

    const handleExport = async () => {
        setExporting(true);
        try {
            // Ensure we have latest data for everything
            const state = useStore.getState();
            await Promise.all([
                state.fetchTransactions(),
                state.fetchDebts(),
                state.fetchReminders(),
                state.fetchInstallments()
            ]);

            // Get fresh data directly from store state to avoid closure staleness
            const latestState = useStore.getState();
            await exportToExcel(
                latestState.transactions,
                latestState.debts,
                latestState.reminders,
                latestState.installments
            );

            showToast(i18n.t('exportSuccessMessage'), 'success');
            showAdIfReady();
        } catch (error: any) {
            showToast(error.message || i18n.t('exportErrorMessage'), 'error');
        } finally {
            setExporting(false);
        }
    };

    const handleNotificationToggle = async (value: boolean) => {
        if (value) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                setNotificationsEnabled(true);
                showToast(i18n.t('notificationsEnabled', { defaultValue: 'Bildirimler açıldı' }), 'success');
            } else {
                setNotificationsEnabled(false);
                showToast(i18n.t('notificationPermissionDenied', { defaultValue: 'Bildirim izni reddedildi' }), 'error');
            }
        } else {
            await Notifications.cancelAllScheduledNotificationsAsync();
            setNotificationsEnabled(false);
            showToast(i18n.t('notificationsDisabled', { defaultValue: 'Bildirimler kapatıldı' }), 'info');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <List.Section>
                <List.Subheader>{i18n.t('dataManagement')}</List.Subheader>
                <View style={styles.sectionPadding}>
                    <Button
                        mode="contained"
                        accessibilityLabel="Excel Olarak İndir"
                        onPress={handleExport}
                        loading={exporting}
                        icon="microsoft-excel"
                        style={styles.buttonSpacing}
                    >
                        {i18n.t('exportExcel')}
                    </Button>
                    <Text variant="bodySmall" style={[styles.description, { color: theme.colors.outline }]}>
                        {i18n.t('exportExcelDesc')}
                    </Text>

                    <Divider style={{ marginVertical: 12 }} />

                    <Button
                        mode="contained"
                        onPress={async () => {
                            try {
                                const state = useStore.getState();
                                // Ensure we have installments loaded
                                await state.fetchInstallments();
                                const latestState = useStore.getState(); // Re-get state after fetch

                                await import('../utils/export').then(m => m.exportBackup(
                                    latestState.transactions,
                                    latestState.debts,
                                    latestState.reminders,
                                    latestState.installments
                                ));
                                showToast(i18n.t('backupSuccess'), 'success');
                                showAdIfReady();
                            } catch (error: any) {
                                showToast(error.message || i18n.t('backupError'), 'error');
                            }
                        }}
                        icon="database-export"
                        style={styles.buttonSpacing}
                    >
                        {i18n.t('createBackup')}
                    </Button>

                    <Button
                        mode="contained"
                        onPress={async () => {
                            try {
                                const m = await import('../utils/export');
                                const data = await m.importBackup();
                                if (data) {
                                    Alert.alert(
                                        i18n.t('restoreBackup'),
                                        i18n.t('restoreConfirm'),
                                        [
                                            { text: i18n.t('cancel'), style: 'cancel' },
                                            {
                                                text: i18n.t('yes'),
                                                onPress: async () => {
                                                    try {
                                                        const { Repository } = await import('../database/repository');

                                                        if (!Repository) {
                                                            throw new Error('Repository module not found');
                                                        }

                                                        await Repository.clearAllData();
                                                        if (data.installments && data.installments.length > 0) {
                                                            await Repository.bulkInsertInstallments(data.installments);
                                                        }
                                                        await Repository.bulkInsertTransactions(data.transactions);
                                                        await Repository.bulkInsertDebts(data.debts);
                                                        await Repository.bulkInsertReminders(data.reminders);

                                                        try {
                                                            useStore.getState().refreshDashboard();
                                                        } catch (refreshErr) {
                                                            console.warn("Refresh failed but import likely worked:", refreshErr);
                                                        }

                                                        showToast(i18n.t('restoreSuccess'), 'success');
                                                    } catch (dbError: any) {
                                                        console.error("Database Restore Error:", dbError);
                                                        showToast(i18n.t('dataLoadError') + ': ' + (dbError.message || dbError), 'error');
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }
                            } catch (error: any) {
                                console.error("Import Flow Error:", error);
                                Alert.alert(i18n.t('error'), error.message || i18n.t('restoreFailed'));
                            }
                        }}
                        icon="database-import"
                        style={styles.buttonSpacing}
                    >
                        {i18n.t('restoreBackup')}
                    </Button>
                </View>
            </List.Section >
            <Divider />

            <List.Section>
                <List.Subheader>{i18n.t('general')}</List.Subheader>
                <List.Item
                    title={i18n.t('darkMode')}
                    description={i18n.t('darkModeDesc')}
                    left={props => <List.Icon {...props} icon="theme-light-dark" />}
                    right={() => <Switch value={themeMode === 'dark'} onValueChange={(value) => setTheme(value ? 'dark' : 'light')} color={theme.colors.primary} />}
                />
                <List.Item
                    title={i18n.t('notifications')}
                    left={props => <List.Icon {...props} icon="bell" />}
                    right={() => <Switch value={notificationsEnabled} onValueChange={handleNotificationToggle} />}
                />
            </List.Section>

            <List.Section>
                <TouchableOpacity onPress={() => Linking.openURL('https://mediaconfig55-afk.github.io/Privacy-Policy/')}>
                    <List.Subheader style={{ color: theme.colors.primary }}>{i18n.t('aboutApp')}</List.Subheader>
                </TouchableOpacity>
                <List.Item
                    title={i18n.t('version')}
                    description={Constants.expoConfig?.version || '1.0.2'}
                    left={props => <List.Icon {...props} icon="information" />}
                />
                <List.Item
                    title={i18n.t('privacyPolicy')}
                    left={props => <List.Icon {...props} icon="shield-check" />}
                    onPress={() => import('react-native').then(rn => rn.Linking.openURL('https://mediaconfig55-afk.github.io/Privacy-Policy/'))}
                />
            </List.Section>

            <View style={[styles.footer, { paddingBottom: 20 + 50 }]}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {i18n.t('footerLove')}
                </Text>
            </View>

            {/* AdMob Banner */}
            <AdBanner />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 'auto',
    },
    sectionPadding: {
        padding: 16,
    },
    description: {
        marginTop: 8,
        marginBottom: 8,
    },
    buttonSpacing: {
        marginBottom: 8,
    }
});
