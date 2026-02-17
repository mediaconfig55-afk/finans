import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, useTheme, FAB, Button, Dialog, Portal, TextInput, Icon, Surface, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../store';
import { formatCurrency } from '../utils/format';
import { Reminder } from '../types';
import { scheduleReminderNotification, cancelReminderNotifications } from '../utils/notifications';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { useToast } from '../context/ToastContext';

export const RemindersScreen = () => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { reminders, fetchReminders, addReminder, deleteReminder } = useStore();
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [day, setDay] = useState('');

    // Saat/Tarih picker states
    const [reminderDate, setReminderDate] = useState(new Date());
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        fetchReminders();
    }, []);

    const showDialog = () => setVisible(true);
    const hideDialog = () => {
        setVisible(false);
        setTitle('');
        setAmount('');
        setDay('');
        setReminderDate(new Date());
        setReminderTime(new Date());
    };

    const handleAdd = async () => {
        if (!title || !amount || !day) {
            showToast(i18n.t('fillAllFields'), 'warning');
            return;
        }

        const dayNum = parseInt(day);
        if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
            showToast(i18n.t('invalidDay', { defaultValue: 'Gün 1-31 arasında olmalıdır' }), 'warning');
            return;
        }

        try {
            const newReminderId = await addReminder({
                title,
                amount: parseFloat(amount),
                dayOfMonth: dayNum,
                type: 'bill'
            });

            // Build notification date from picker values
            const notificationDate = new Date(reminderDate);
            notificationDate.setHours(reminderTime.getHours());
            notificationDate.setMinutes(reminderTime.getMinutes());
            notificationDate.setSeconds(0);

            await scheduleReminderNotification(
                newReminderId,
                title,
                parseFloat(amount),
                notificationDate
            );

            hideDialog();
            showToast(i18n.t('reminderAdded'), 'success');
        } catch (error) {
            console.error('Error adding reminder:', error);
            showToast(i18n.t('reminderAddError'), 'error');
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            i18n.t('deleteReminderTitle'),
            i18n.t('deleteReminderMessage'),
            [
                { text: i18n.t('cancel'), style: 'cancel' },
                {
                    text: i18n.t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await cancelReminderNotifications(id);
                        await deleteReminder(id);
                        fetchReminders();
                        showToast(i18n.t('reminderDeleted'), 'success');
                    }
                }
            ]
        );
    };

    const renderReminder = (item: Reminder) => {
        const color = theme.colors.primary;
        const daysUntil = item.dayOfMonth - new Date().getDate();
        const isUpcoming = daysUntil >= 0 && daysUntil <= 7;

        return (
            <Surface key={item.id} style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <TouchableOpacity style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                            <Icon source="bell-ring" size={24} color={color} />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                {item.title}
                            </Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {i18n.t('everyMonthDay', { day: item.dayOfMonth })}
                            </Text>
                            {isUpcoming && (
                                <Chip
                                    icon="clock-alert"
                                    style={{ marginTop: 4, alignSelf: 'flex-start' }}
                                    compact
                                    textStyle={styles.chipText}
                                >
                                    {daysUntil === 0 ? i18n.t('today') : i18n.t('daysLeft', { days: daysUntil })}
                                </Chip>
                            )}
                        </View>
                    </View>
                    <View style={styles.cardFooter}>
                        <Text variant="titleMedium" style={{ color: color, fontWeight: 'bold' }}>
                            {formatCurrency(item.amount)}
                        </Text>
                        <TouchableOpacity onPress={() => handleDelete(item.id)}>
                            <Icon source="delete" size={24} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Surface>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.headerTitle}>{i18n.t('remindersTitle')}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {i18n.t('remindersDesc')}
                </Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {reminders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon source="bell-off" size={64} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodyLarge" style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
                            {i18n.t('noReminders')}
                        </Text>
                        <Text variant="bodySmall" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                            {i18n.t('addReminderHint')}
                        </Text>
                    </View>
                ) : (
                    reminders.map(renderReminder)
                )}
            </ScrollView>

            <FAB
                icon="plus"
                label={i18n.t('newReminder')}
                style={[styles.fab, { bottom: insets.bottom + 16, backgroundColor: theme.colors.primary }]}
                color={theme.colors.onPrimary}
                onPress={showDialog}
            />

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>{i18n.t('newReminder')}</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label={i18n.t('reminderTitlePlaceholder')}
                            value={title}
                            onChangeText={setTitle}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label={i18n.t('amount')}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="currency-try" />}
                        />
                        <TextInput
                            label={i18n.t('dayOfMonthPlaceholder')}
                            value={day}
                            onChangeText={setDay}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                        />

                        {/* Tarih Seçici */}
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <TextInput
                                label={i18n.t('reminderDate')}
                                value={reminderDate.toLocaleDateString('tr-TR')}
                                mode="outlined"
                                style={styles.input}
                                editable={false}
                                right={<TextInput.Icon icon="calendar" />}
                            />
                        </TouchableOpacity>

                        {/* Saat Seçici */}
                        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                            <TextInput
                                label={i18n.t('reminderTime')}
                                value={reminderTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                mode="outlined"
                                style={styles.input}
                                editable={false}
                                right={<TextInput.Icon icon="clock-outline" />}
                            />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={reminderDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        setReminderDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                value={reminderTime}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedTime) => {
                                    setShowTimePicker(Platform.OS === 'ios');
                                    if (selectedTime) {
                                        setReminderTime(selectedTime);
                                    }
                                }}
                            />
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>{i18n.t('cancel')}</Button>
                        <Button onPress={handleAdd} mode="contained">{i18n.t('add')}</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 12,
        borderRadius: 10,
        overflow: 'hidden',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
    },
    input: {
        marginBottom: 12,
    },
    headerTitle: {
        fontWeight: 'bold',
    },
    chipText: {
        fontSize: 11,
    },
    emptyTitle: {
        marginTop: 16,
    },
    emptySubtitle: {
        marginTop: 8,
    },
});
