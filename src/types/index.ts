export type TransactionType = 'income' | 'expense';
export type DebtType = 'debt' | 'receivable';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO 8601 format: YYYY-MM-DD
  description?: string;
  installmentId?: number;
}

export interface Installment {
  id: number;
  totalAmount: number;
  totalMonths: number;
  remainingMonths: number;
  startDate: string; // ISO 8601
  description: string;
}

export interface Debt {
  id: number;
  type: DebtType;
  personName: string;
  amount: number;
  dueDate?: string; // ISO 8601
  isPaid: number; // 0 or 1 for SQLite boolean
  description?: string;
}

export interface Reminder {
  id: number;
  title: string;
  amount: number;
  dayOfMonth: number;
  type: string;
}
