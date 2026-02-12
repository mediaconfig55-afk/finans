import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            // alert('Failed to get push token for push notification!');
            return;
        }
    } else {
        // alert('Must use physical device for Push Notifications');
    }
}

export async function scheduleReminderNotification(reminderId: number, title: string, dayOfMonth: number, amount: number, hour: number, minute: number) {
    // Cancel existing notifications for this reminder
    try {
        await Notifications.cancelScheduledNotificationAsync(`reminder_${reminderId}`);
    } catch (e) {
        // Ignore if doesn't exist
    }

    // Schedule for next 12 months
    const now = new Date();
    const scheduledCount = 0;

    for (let i = 0; i < 12; i++) {
        const triggerDate = new Date();
        triggerDate.setMonth(now.getMonth() + i);
        triggerDate.setDate(dayOfMonth);
        triggerDate.setHours(hour, minute, 0, 0);

        // Skip if in the past
        if (triggerDate <= now) continue;

        try {
            await Notifications.scheduleNotificationAsync({
                identifier: `reminder_${reminderId}_${i}`,
                content: {
                    title: "Fatura Hatırlatıcı 🔔",
                    body: `${title} için ödeme zamanı! Tutar: ${amount}₺`,
                    sound: true,
                    data: { reminderId, month: i },
                },
                trigger: { type: 'date', date: triggerDate } as any,
            });
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    }

    return now;
}

export async function cancelReminderNotifications(reminderId: number) {
    // Cancel all notifications for this reminder
    for (let i = 0; i < 12; i++) {
        try {
            await Notifications.cancelScheduledNotificationAsync(`reminder_${reminderId}_${i}`);
        } catch (e) {
            // Ignore if doesn't exist
        }
    }
}
