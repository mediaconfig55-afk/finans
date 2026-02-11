import { getDB } from './db';
import { Transaction, Installment, Debt } from '../types';

export const Repository = {
    async addTransaction(transaction: Omit<Transaction, 'id'>) {
        const db = await getDB();
        await db.runAsync(
            'INSERT INTO transactions (type, amount, category, date, description, installmentId) VALUES (?, ?, ?, ?, ?, ?)',
            [
                transaction.type,
                transaction.amount,
                transaction.category,
                transaction.date,
                transaction.description ?? null,
                transaction.installmentId ?? null,
            ]
        );
    },

    async getTransactions() {
        const db = await getDB();
        return await db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY date DESC');
    },

    async deleteTransaction(id: number) {
        const db = await getDB();
        await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
    },

    async updateTransaction(transaction: Transaction) {
        const db = await getDB();
        await db.runAsync(
            'UPDATE transactions SET type = ?, amount = ?, category = ?, date = ?, description = ? WHERE id = ?',
            [
                transaction.type,
                transaction.amount,
                transaction.category,
                transaction.date,
                transaction.description ?? null,
                transaction.id
            ]
        );
    },

    async addInstallment(installment: Omit<Installment, 'id'>) {
        const db = await getDB();
        const result = await db.runAsync(
            'INSERT INTO installments (totalAmount, totalMonths, remainingMonths, startDate, description) VALUES (?, ?, ?, ?, ?)',
            [
                installment.totalAmount,
                installment.totalMonths,
                installment.remainingMonths,
                installment.startDate,
                installment.description,
            ]
        );
        return result.lastInsertRowId;
    },

    async getInstallments() {
        const db = await getDB();
        return await db.getAllAsync<Installment>('SELECT * FROM installments');
    },

    async addDebt(debt: Omit<Debt, 'id'>) {
        const db = await getDB();
        await db.runAsync(
            'INSERT INTO debts (type, personName, amount, dueDate, isPaid, description) VALUES (?, ?, ?, ?, ?, ?)',
            [
                debt.type,
                debt.personName,
                debt.amount,
                debt.dueDate ?? null,
                debt.isPaid,
                debt.description ?? null,
            ]
        );
    },

    async getDebts() {
        const db = await getDB();
        return await db.getAllAsync<Debt>('SELECT * FROM debts');
    },

    async toggleDebtStatus(id: number, currentStatus: number) {
        const db = await getDB();
        const newStatus = currentStatus === 1 ? 0 : 1;
        await db.runAsync('UPDATE debts SET isPaid = ? WHERE id = ?', [newStatus, id]);
    },

    async deleteDebt(id: number) {
        const db = await getDB();
        await db.runAsync('DELETE FROM debts WHERE id = ?', [id]);
    },

    async updateDebt(debt: Debt) {
        const db = await getDB();
        await db.runAsync(
            'UPDATE debts SET type = ?, personName = ?, amount = ?, dueDate = ?, isPaid = ?, description = ? WHERE id = ?',
            [
                debt.type,
                debt.personName,
                debt.amount,
                debt.dueDate ?? null,
                debt.isPaid,
                debt.description ?? null,
                debt.id
            ]
        );
    },

    async getKpiSummary() {
        const db = await getDB();
        // Calculate total income and expense for the current month
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

        const incomeResult = await db.getFirstAsync<{ total: number }>(
            `SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND date BETWEEN ? AND ?`,
            [startOfMonth, endOfMonth]
        );

        const expenseResult = await db.getFirstAsync<{ total: number }>(
            `SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ?`,
            [startOfMonth, endOfMonth]
        );

        return {
            totalIncome: incomeResult?.total ?? 0,
            totalExpense: expenseResult?.total ?? 0,
        };
    },

    async getDailySpending() {
        const db = await getDB();
        // Group expenses by date for the last 30 days
        const result = await db.getAllAsync<{ date: string, total: number }>(
            `SELECT date(date) as date, SUM(amount) as total 
             FROM transactions 
             WHERE type = 'expense' 
             GROUP BY date(date) 
             ORDER BY date DESC 
             LIMIT 30`
        );
        return result;
    }
};
