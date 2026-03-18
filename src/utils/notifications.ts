import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import i18n from '../i18n';

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
                    title: i18n.t('notificationTitle', { defaultValue: 'Fatura Hatırlatıcı 🔔' }),
                    body: i18n.t('notificationBody', { title, amount, defaultValue: `${title} için ödeme zamanı! Tutar: ${amount}₺` }),
                    sound: true,
                    data: { reminderId, index: i },
                },
                trigger: Platform.OS === 'ios' ? {
                    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                    repeats: false,
                    year: triggerDate.getFullYear(),
                    month: triggerDate.getMonth() + 1,
                    day: triggerDate.getDate(),
                    hour: triggerDate.getHours(),
                    minute: triggerDate.getMinutes(),
                } : {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: triggerDate,
                },
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

/**
 * Günlük 3 bildirim planla:
 * - 08:00 → Sabah motivasyon
 * - 13:00 → Öğle harcama uyarısı
 * - 20:00 → Akşam özet
 */
export async function scheduleDailyNotifications() {
    // Önce mevcut günlük bildirimleri iptal et
    await cancelDailyNotifications();

    const dailyNotifications = [
        {
            id: 'daily_morning',
            hour: 8,
            minute: 0,
            title: i18n.t('dailyMorningTitle', { defaultValue: 'Günaydın! ☀️' }),
            body: i18n.t('dailyMorningBody', { defaultValue: 'Bugün harcamalarına dikkat et! Bütçeni kontrol altında tut. 💰' }),
        },
        {
            id: 'daily_noon',
            hour: 13,
            minute: 0,
            title: i18n.t('dailyNoonTitle', { defaultValue: 'Öğle Hatırlatması 📊' }),
            body: i18n.t('dailyNoonBody', { defaultValue: 'Bugünkü harcamalarını kontrol etmeyi unutma! Uygulamayı aç ve durumunu gör.' }),
        },
        {
            id: 'daily_evening',
            hour: 20,
            minute: 0,
            title: i18n.t('dailyEveningTitle', { defaultValue: 'Günlük Özet 🎯' }),
            body: i18n.t('dailyEveningBody', { defaultValue: 'Bugünkü harcamalarını gözden geçir ve yarın için plan yap! 📈' }),
        },
    ];

    for (const notif of dailyNotifications) {
        try {
            await Notifications.scheduleNotificationAsync({
                identifier: notif.id,
                content: {
                    title: notif.title,
                    body: notif.body,
                    sound: true,
                    data: { type: 'daily_reminder' },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: notif.hour,
                    minute: notif.minute,
                },
            });
        } catch (error) {
            console.error(`Error scheduling ${notif.id}:`, error);
        }
    }
}

/**
 * Günlük bildirimleri iptal et
 */
export async function cancelDailyNotifications() {
    const ids = ['daily_morning', 'daily_noon', 'daily_evening'];
    for (const id of ids) {
        try {
            await Notifications.cancelScheduledNotificationAsync(id);
        } catch (e) {
            // Ignore if doesn't exist
        }
    }
}
