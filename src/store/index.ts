import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Repository } from '../database/repository';
import { Transaction, Installment, Debt, Reminder } from '../types';
import i18n from '../i18n';

interface AppState {
    transactions: Transaction[];
    installments: Installment[];
    debts: Debt[];
    kpi: {
        totalIncome: number;
        totalExpense: number;
        totalDebt: number;
        grandTotalIncome: number;
        grandTotalExpense: number;
    };
    loading: boolean;
    theme: 'light' | 'dark';
    userName: string | null;
    hasCompletedOnboarding: boolean;
    error: string | null;
    setError: (error: string | null) => void;

    // AdMob Frequency Capping
    transactionsSinceLastAd: number;
    incrementTransactionsSinceLastAd: () => void;
    resetTransactionsSinceLastAd: () => void;

    fetchTransactions: () => Promise<void>;
    addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: number) => Promise<void>;

    fetchInstallments: () => Promise<void>;
    addInstallment: (i: Omit<Installment, 'id'>) => Promise<void>;

    fetchDebts: () => Promise<void>;
    addDebt: (d: Omit<Debt, 'id'>) => Promise<void>;
    toggleDebtStatus: (id: number, currentStatus: number) => Promise<void>;
    deleteDebt: (id: number) => Promise<void>;
    updateDebt: (debt: Debt) => Promise<void>;

    dailySpending: { date: string; total: number }[];
    updateTransaction: (t: Transaction) => Promise<void>;

    reminders: Reminder[];
    fetchReminders: () => Promise<void>;
    addReminder: (r: Omit<Reminder, 'id'>) => Promise<number>;
    deleteReminder: (id: number) => Promise<void>;
    updateReminder: (reminder: Reminder) => Promise<void>;

    deleteInstallment: (id: number) => Promise<void>;

    setTheme: (theme: 'light' | 'dark') => void;
    refreshDashboard: () => Promise<void>;
    setUserName: (name: string) => void;
    setOnboardingComplete: () => void;
}

export const useStore = create<AppState>((set, get) => ({
    transactions: [],
    installments: [],
    debts: [],

    dailySpending: [],
    reminders: [],
    kpi: {
        totalIncome: 0,
        totalExpense: 0,
        totalDebt: 0,
        grandTotalIncome: 0,
        grandTotalExpense: 0
    },
    loading: false,
    theme: 'dark', // Default dark theme
    userName: null,
    hasCompletedOnboarding: false,
    error: null,
    setError: (error) => set({ error }),

    // AdMob Counters
    transactionsSinceLastAd: 0,
    incrementTransactionsSinceLastAd: () => set((state) => ({ transactionsSinceLastAd: state.transactionsSinceLastAd + 1 })),
    resetTransactionsSinceLastAd: () => set({ transactionsSinceLastAd: 0 }),

    refreshDashboard: async () => {
        if (get().loading) return; // Prevent multiple calls
        set({ loading: true, error: null });
        try {
            const [transactions, kpiData, dailySpending, reminders, totalDebt] = await Promise.all([
                Repository.getTransactions(),
                Repository.getKpiSummary(),
                Repository.getDailySpending(),
                Repository.getReminders(),
                Repository.getTotalDebt(),
            ]);
            const kpi = { ...kpiData, totalDebt };
            set({ transactions, kpi, dailySpending, reminders, loading: false });
        } catch (e: any) {
            set({ error: e.message || i18n.t('error'), loading: false });
            console.error(e);
        }
    },

    fetchTransactions: async () => {
        set({ loading: true, error: null });
        try {
            const transactions = await Repository.getTransactions();
            set({ transactions, loading: false });
        } catch (e: any) {
            set({ error: e.message, loading: false });
        }
    },

    addTransaction: async (t) => {
        try {
            await Repository.addTransaction(t);
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('saveError') + ': ' + e.message });
        }
    },

    deleteTransaction: async (id) => {
        try {
            await Repository.deleteTransaction(id);
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('error') + ': ' + e.message });
        }
    },

    fetchInstallments: async () => {
        try {
            const installments = await Repository.getInstallments();
            set({ installments });
        } catch (e: any) {
            console.error(e);
        }
    },

    addInstallment: async (i) => {
        try {
            await Repository.addInstallment(i);
            await get().fetchInstallments();
        } catch (e: any) {
            set({ error: i18n.t('error') + ': ' + e.message });
        }
    },

    fetchDebts: async () => {
        try {
            const debts = await Repository.getDebts();
            set({ debts });
        } catch (e: any) {
            console.error(e);
        }
    },

    addDebt: async (d) => {
        try {
            await Repository.addDebt(d);
            await get().fetchDebts();
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('debtAddError') + ': ' + e.message });
        }
    },

    toggleDebtStatus: async (id, currentStatus) => {
        try {
            await Repository.toggleDebtStatus(id, currentStatus);
            await get().fetchDebts();
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('updateError') });
        }
    },

    deleteDebt: async (id) => {
        try {
            await Repository.deleteDebt(id);
            await get().fetchDebts();
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('error') });
        }
    },

    updateDebt: async (debt) => {
        try {
            await Repository.updateDebt(debt);
            await get().fetchDebts();
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('updateError') });
        }
    },

    updateTransaction: async (t) => {
        try {
            await Repository.updateTransaction(t);
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('updateError') });
        }
    },

    fetchReminders: async () => {
        try {
            const reminders = await Repository.getReminders();
            set({ reminders });
        } catch (e: any) {
            console.error(e);
        }
    },

    addReminder: async (r) => {
        try {
            const id = await Repository.addReminder(r);
            await get().fetchReminders();
            await get().refreshDashboard();
            return id;
        } catch (e: any) {
            set({ error: i18n.t('reminderAddError') });
            throw e;
        }
    },

    deleteReminder: async (id) => {
        try {
            await Repository.deleteReminder(id);
            await get().fetchReminders();
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('error') });
        }
    },

    updateReminder: async (reminder) => {
        try {
            await Repository.updateReminder(reminder);
            await get().fetchReminders();
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('updateError') });
        }
    },

    deleteInstallment: async (id) => {
        try {
            await Repository.deleteInstallment(id);
            await get().fetchInstallments();
            await get().refreshDashboard();
        } catch (e: any) {
            set({ error: i18n.t('error') });
        }
    },

    setTheme: (theme) => {
        set({ theme });
        AsyncStorage.setItem('appTheme', theme).catch(console.error);
    },

    setUserName: (name) => set({ userName: name }),

    setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
}));
