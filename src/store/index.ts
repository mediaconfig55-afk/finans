import { create } from 'zustand';
import { Repository } from '../database/repository';
import { Transaction, Installment, Debt } from '../types';

interface AppState {
    transactions: Transaction[];
    installments: Installment[];
    debts: Debt[];
    kpi: { totalIncome: number; totalExpense: number };
    loading: boolean;

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

    refreshDashboard: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    transactions: [],
    installments: [],
    debts: [],
    dailySpending: [],
    kpi: { totalIncome: 0, totalExpense: 0 },
    loading: false,

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
    },

    toggleDebtStatus: async (id, status) => {
        await Repository.toggleDebtStatus(id, status);
        await get().fetchDebts();
    },

    deleteDebt: async (id) => {
        await Repository.deleteDebt(id);
        await get().fetchDebts();
    },

    updateDebt: async (d) => {
        await Repository.updateDebt(d);
        await get().fetchDebts();
    },

    updateTransaction: async (t) => {
        await Repository.updateTransaction(t);
        get().refreshDashboard();
    },

    refreshDashboard: async () => {
        await get().fetchTransactions();
        const kpi = await Repository.getKpiSummary();
        const dailySpending = await Repository.getDailySpending();
        set({ kpi, dailySpending });
    }
}));
