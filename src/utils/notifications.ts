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
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Hatırlatıcılar',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: true,
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync({
                ios: {
                    allowAlert: true,
                    allowBadge: true,
                    allowSound: true,
                },
            });
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Failed to get push token for push notification!');
            return false;
        }
        return true;
    } else {
        console.log('Must use physical device for Push Notifications');
        return false;
    }
}

export async function scheduleReminderNotification(reminderId: number, title: string, amount: number, notificationDate: Date) {
    // Cancel existing notifications for this reminder
    try {
        await cancelReminderNotifications(reminderId);
    } catch (e) {
        // Ignore if doesn't exist
    }

    // Schedule for next 12 months starting from selected date
    const startMonth = notificationDate.getMonth();
    const startYear = notificationDate.getFullYear();
    const dayOfMonth = notificationDate.getDate();
    const hour = notificationDate.getHours();
    const minute = notificationDate.getMinutes();

    for (let i = 0; i < 12; i++) {
        const triggerDate = new Date(startYear, startMonth + i, dayOfMonth, hour, minute, 0, 0);

        // Skip if in the past
        if (triggerDate.getTime() <= Date.now()) continue;

        try {
            await Notifications.scheduleNotificationAsync({
                identifier: `reminder_${reminderId}_${i}`,
                content: {
                    title: "Fatura Hatırlatıcı 🔔",
                    body: `${title} için ödeme zamanı! Tutar: ${amount}₺`,
                    sound: true,
                    data: { reminderId, index: i },
                },
                trigger: {
                    type: 'date',
                    date: triggerDate
                } as any,
            });
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return false;
        }
    }

    return true;
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
