import { create } from 'zustand';
import { Repository } from '../database/repository';
import { Transaction, Installment, Debt, Reminder } from '../types';

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

    refreshDashboard: async () => {
        set({ loading: true });
        const [transactions, kpiData, dailySpending, reminders, totalDebt] = await Promise.all([
            Repository.getTransactions(),
            Repository.getKpiSummary(),
            Repository.getDailySpending(),
            Repository.getReminders(),
            Repository.getTotalDebt(),
        ]);
        const kpi = { ...kpiData, totalDebt };
        set({ transactions, kpi, dailySpending, reminders, loading: false });
    },

    fetchTransactions: async () => {
        set({ loading: true });
        try {
            const transactions = await Repository.getTransactions();
            set({ transactions });
        } catch (e) {
            console.error(e);
        } finally {
            set({ loading: false });
        }
    },

    addTransaction: async (t) => {
        await Repository.addTransaction(t);
        get().refreshDashboard();
    },

    deleteTransaction: async (id) => {
        await Repository.deleteTransaction(id);
        get().refreshDashboard();
    },

    fetchInstallments: async () => {
        const installments = await Repository.getInstallments();
        set({ installments });
    },

    addInstallment: async (i) => {
        await Repository.addInstallment(i);
        await get().fetchInstallments();
    },

    fetchDebts: async () => {
        const debts = await Repository.getDebts();
        set({ debts });
    },

    addDebt: async (d) => {
        await Repository.addDebt(d);
        await get().fetchDebts();
        get().refreshDashboard();
    },

    toggleDebtStatus: async (id, currentStatus) => {
        await Repository.toggleDebtStatus(id, currentStatus);
        await get().fetchDebts();
        get().refreshDashboard();
    },

    deleteDebt: async (id) => {
        await Repository.deleteDebt(id);
        await get().fetchDebts();
        get().refreshDashboard();
    },

    updateDebt: async (debt) => {
        await Repository.updateDebt(debt);
        await get().fetchDebts();
        get().refreshDashboard();
    },

    updateTransaction: async (t) => {
        await Repository.updateTransaction(t);
        get().refreshDashboard();
    },

    fetchReminders: async () => {
        const reminders = await Repository.getReminders();
        set({ reminders });
    },

    addReminder: async (r) => {
        const id = await Repository.addReminder(r);
        await get().fetchReminders();
        get().refreshDashboard();
        return id;
    },

    deleteReminder: async (id) => {
        await Repository.deleteReminder(id);
        await get().fetchReminders();
        get().refreshDashboard();
    },

    setTheme: (theme) => set({ theme }),

    setUserName: (name) => set({ userName: name }),

    setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
}));
