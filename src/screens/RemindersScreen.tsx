import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, useTheme, FAB, List, Button, Dialog, Portal, TextInput, Divider } from 'react-native-paper';
import { useStore } from '../store';
import { formatCurrency } from '../utils/format';
import { Reminder } from '../types';
import { scheduleReminderNotification, cancelAllNotifications } from '../utils/notifications';

export const RemindersScreen = () => {
    const theme = useTheme();
    const { reminders, fetchReminders, addReminder, deleteReminder } = useStore();
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [day, setDay] = useState('');

    useEffect(() => {
        fetchReminders();
    }, []);

    const showDialog = () => setVisible(true);
    const hideDialog = () => {
        setVisible(false);
        setTitle('');
        setAmount('');
        setDay('');
    };

    const handleAdd = async () => {
        if (!title || !amount || !day) return;

        try {
            await addReminder({
                title,
                amount: parseFloat(amount),
                dayOfMonth: parseInt(day),
                type: 'bill'
            });
            await scheduleReminderNotification(title, parseInt(day), parseFloat(amount));
            hideDialog();
            Alert.alert('Başarılı', 'Hatırlatıcı ve bildirim ayarlandı.');
        } catch (error) {
            Alert.alert('Hata', 'Hatırlatıcı eklenirken bir hata oluştu');
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert('Sil', 'Bu hatırlatıcıyı silmek istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', onPress: () => deleteReminder(id) }
        ]);
    };

    const sortedReminders = [...reminders].sort((a, b) => a.dayOfMonth - b.dayOfMonth);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                {sortedReminders.length === 0 ? (
                    <View style={styles.empty}>
                        <Text>Henüz hatırlatıcı eklenmemiş.</Text>
                        <Text variant="bodySmall">Her ayın belirli günlerinde ödemeniz gereken faturaları buraya ekleyin.</Text>
                    </View>
                ) : (
                    sortedReminders.map((item) => (
                        <List.Item
                            key={item.id}
                            title={item.title}
                            description={`Her ayın ${item.dayOfMonth}. günü`}
                            left={props => <List.Icon {...props} icon="calendar-clock" color={theme.colors.primary} />}
                            right={props => (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontWeight: 'bold', marginRight: 10 }}>{formatCurrency(item.amount)}</Text>
                                    <Button icon="delete" compact onPress={() => handleDelete(item.id)}>Sil</Button>
                                </View>
                            )}
                        />
                    ))
                )}
            </ScrollView>

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Yeni Hatırlatıcı</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Başlık (Örn: Su Faturası)"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                        />
                        <TextInput
                            label="Tutar (Tahmini)"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput
                            label="Gün (1-31)"
                            value={day}
                            onChangeText={setDay}
                            keyboardType="numeric"
                            maxLength={2}
                            style={styles.input}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>İptal</Button>
                        <Button onPress={handleAdd}>Ekle</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <FAB
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                icon="plus"
                color={theme.colors.onPrimary}
                onPress={showDialog}
                label="Yeni Hatırlatıcı"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 80,
    },
    empty: {
        alignItems: 'center',
        marginTop: 50,
        gap: 10,
    },
    input: {
        marginBottom: 10,
        backgroundColor: 'transparent',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
