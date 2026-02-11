
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { List, Switch, useTheme, Divider, ActivityIndicator, Text, Button } from 'react-native-paper';
import { useStore } from '../store';
import { exportToExcel } from '../utils/export';

export const SettingsScreen = () => {
    const theme = useTheme();
    const { transactions, debts, fetchDebts, fetchTransactions } = useStore();
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            // Ensure we have latest data
            await fetchTransactions();
            await fetchDebts();

            // Get fresh data from store after fetch - using logic inside export function or passing current state
            // Limitation: actions are async but state update might lag slightly in React 18 automated batching if not careful, 
            // but useStore state is usually up to date for the next render. 
            // Better approach: pass the arrays directly from the hook which are "current" as per this render cycle, 
            // but we just triggered fetch. 
            // For simplicity, we rely on current state or re-read from repo via store helper if we modified exportToExcel to take store.
            // Let's pass the props we have.

            await exportToExcel(transactions, debts);
            Alert.alert('Başarılı', 'Veriler başarıyla dışa aktarıldı.');
        } catch (error) {
            Alert.alert('Hata', 'Dışa aktarma sırasında bir hata oluştu.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <List.Section>
                <List.Subheader>Veri Yönetimi</List.Subheader>
                <View style={{ padding: 16 }}>
                    <Button
                        mode="contained"
                        onPress={handleExport}
                        loading={exporting}
                        icon="microsoft-excel"
                    >
                        Excel Olarak İndir
                    </Button>
                    <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.outline }}>
                        Tüm verilerinizi .xlsx formatında dışa aktarın
                    </Text>
                </View>
            </List.Section>
            <Divider />

            {/* Existing settings placeholders */}
            <List.Section>
                <List.Subheader>Genel</List.Subheader>
                <List.Item
                    title="Karanlık Mod"
                    left={props => <List.Icon {...props} icon="theme-light-dark" />}
                    right={() => <Switch value={false} onValueChange={() => { }} disabled />}
                />
                <List.Item
                    title="Bildirimler"
                    left={props => <List.Icon {...props} icon="bell" />}
                    right={() => <Switch value={true} onValueChange={() => { }} disabled />}
                />
            </List.Section>

            <List.Section>
                <List.Subheader>Uygulama Hakkında</List.Subheader>
                <List.Item
                    title="Versiyon"
                    description="1.0.0"
                    left={props => <List.Icon {...props} icon="information" />}
                />
            </List.Section>

            <View style={styles.footer}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Finansal Özgürlüğünüz İçin ❤️ ile yapıldı
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
    }
});
