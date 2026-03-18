import { Transaction } from '../types';
import i18n from '../i18n';

export const groupTransactionsByDate = (transactions: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayLabel = i18n.t('dateGroupToday', { defaultValue: 'Bugün' });
    const yesterdayLabel = i18n.t('dateGroupYesterday', { defaultValue: 'Dün' });
    const thisWeekLabel = i18n.t('dateGroupThisWeek', { defaultValue: 'Bu Hafta' });
    const thisMonthLabel = i18n.t('dateGroupThisMonth', { defaultValue: 'Bu Ay' });
    const olderLabel = i18n.t('dateGroupOlder', { defaultValue: 'Önceki' });

    const groups: { [key: string]: Transaction[] } = {
        [todayLabel]: [],
        [yesterdayLabel]: [],
        [thisWeekLabel]: [],
        [thisMonthLabel]: [],
        [olderLabel]: []
    };

    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionDay = new Date(
            transactionDate.getFullYear(),
            transactionDate.getMonth(),
            transactionDate.getDate()
        );

        if (transactionDay.getTime() === today.getTime()) {
            groups[todayLabel].push(transaction);
        } else if (transactionDay.getTime() === yesterday.getTime()) {
            groups[yesterdayLabel].push(transaction);
        } else if (transactionDay >= thisWeekStart && transactionDay < today) {
            groups[thisWeekLabel].push(transaction);
        } else if (transactionDay >= thisMonthStart && transactionDay < thisWeekStart) {
            groups[thisMonthLabel].push(transaction);
        } else {
            groups[olderLabel].push(transaction);
        }
    });

    // Filter out empty groups and return as array
    return Object.entries(groups)
        .filter(([_, transactions]) => transactions.length > 0)
        .map(([title, data]) => ({ title, data }));
};

