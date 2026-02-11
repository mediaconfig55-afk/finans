import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
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

export async function scheduleReminderNotification(title: string, dayOfMonth: number, amount: number) {
    // Calculate next trigger date
    const now = new Date();
    let triggerDate = new Date();

    // Set to the specific day of month
    triggerDate.setDate(dayOfMonth);
    triggerDate.setHours(9, 0, 0, 0); // 9:00 AM

    // If the date is in the past (e.g. today is 15th, reminder is 10th), schedule for next month
    // OR if it's today but past 9 AM, schedule for next month
    if (triggerDate <= now) {
        triggerDate.setMonth(triggerDate.getMonth() + 1);
    }

    const trigger = triggerDate;

    // Schedule
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Fatura Hatırlatıcı 🔔",
            body: `${title} için ödeme zamanı! Tutar: ${amount}₺`,
            sound: true,
        },
        trigger: trigger as any,
    });

    return trigger;
}

export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
