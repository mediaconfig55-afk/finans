import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { Transaction, Debt } from '../types';
import { formatShortDate } from './format';

export const exportToExcel = async (transactions: Transaction[], debts: Debt[]) => {
    try {
        const wb = XLSX.utils.book_new();

        // Transactions Sheet
        const transactionData = transactions.map(t => ({
            ID: t.id,
            Tarih: formatShortDate(t.date),
            Tip: t.type === 'income' ? 'Gelir' : 'Gider',
            Kategori: t.category,
            Tutar: t.amount,
            Aciklama: t.description || '',
        }));
        const wsTransactions = XLSX.utils.json_to_sheet(transactionData);
        XLSX.utils.book_append_sheet(wb, wsTransactions, "İşlemler");

        // Debts Sheet
        const debtData = debts.map(d => ({
            ID: d.id,
            Tip: d.type === 'receivable' ? 'Alacak' : 'Borç',
            Kisi: d.personName,
            Tutar: d.amount,
            Vade: d.dueDate ? formatShortDate(d.dueDate) : '',
            Durum: d.isPaid ? 'Ödendi' : 'Ödenmedi',
        }));
        const wsDebts = XLSX.utils.json_to_sheet(debtData);
        XLSX.utils.book_append_sheet(wb, wsDebts, "Borçlar");

        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const uri = ((FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory) + 'finans_verileri.xlsx';


        await FileSystem.writeAsStringAsync(uri, wbout, {
            encoding: (FileSystem as any).EncodingType.Base64
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
        } else {
            alert('Paylaşım özelliği bu cihazda kullanılamıyor.');
        }

    } catch (error) {
        console.error("Excel Export Error:", error);
        alert('Dosya oluşturulurken bir hata oluştu.');
    }
};
