
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { List, Switch, useTheme, Divider, ActivityIndicator, Text, Button } from 'react-native-paper';
import { useStore } from '../store';
import { exportToExcel } from '../utils/export';
import i18n from '../i18n';

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

    const handleExport = async () => {
        setExporting(true);
        try {
            // Ensure we have latest data
            await fetchTransactions();
            await fetchDebts();

            // Get fresh data directly from store state to avoid closure staleness
            const state = useStore.getState();
            await exportToExcel(state.transactions, state.debts);

            Alert.alert(i18n.t('exportSuccessTitle'), i18n.t('exportSuccessMessage'));
        } catch (error) {
            Alert.alert(i18n.t('exportErrorTitle'), i18n.t('exportErrorMessage'));
        } finally {
            setExporting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <List.Section>
                <List.Subheader>{i18n.t('dataManagement')}</List.Subheader>
                <View style={styles.sectionPadding}>
                    <Button
                        mode="contained"
                        onPress={handleExport}
                        loading={exporting}
                        icon="microsoft-excel"
                    >
                        {i18n.t('exportExcel')}
                    </Button>
                    <Text variant="bodySmall" style={[styles.description, { color: theme.colors.outline }]}>
                        {i18n.t('exportExcelDesc')}
                    </Text>
                </View>
            </List.Section>
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
                    right={() => <Switch value={true} onValueChange={() => { }} disabled />}
                />
            </List.Section>

            <List.Section>
                <List.Subheader>{i18n.t('aboutApp')}</List.Subheader>
                <List.Item
                    title={i18n.t('version')}
                    description="1.0.0"
                    left={props => <List.Icon {...props} icon="information" />}
                />
            </List.Section>

            <View style={styles.footer}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {i18n.t('footerLove')}
                </Text>
            </View>
        </View>
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
    }
});
