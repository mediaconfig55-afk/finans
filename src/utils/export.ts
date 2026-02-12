import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import XLSX from 'xlsx';
import { Transaction, Debt, Reminder } from '../types';
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

        if (Platform.OS === 'android') {
            const permissions = await (FileSystem as any).StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
                const base64Data = await FileSystem.readAsStringAsync(uri, { encoding: (FileSystem as any).EncodingType.Base64 });
                await (FileSystem as any).StorageAccessFramework.createFileAsync(permissions.directoryUri, 'finans_verileri.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                    .then(async (createdUri: string) => {
                        await FileSystem.writeAsStringAsync(createdUri, base64Data, { encoding: (FileSystem as any).EncodingType.Base64 });
                        alert('Dosya başarıyla kaydedildi: ' + createdUri);
                    })
                    .catch((e: any) => {
                        console.log(e);
                        alert('Dosya kaydedilemedi.');
                    });
            } else {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri);
                } else {
                    alert('Paylaşım özelliği bu cihazda kullanılamıyor.');
                }
            }
        } else {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                alert('Paylaşım özelliği bu cihazda kullanılamıyor.');
            }
        }

    } catch (error) {
        console.error("Excel Export Error:", error);
        alert('Dosya oluşturulurken bir hata oluştu.');
    }
};

// Backup: Tüm verileri JSON olarak dışa aktar
export const exportBackup = async (transactions: Transaction[], debts: Debt[], reminders: Reminder[]) => {
    try {
        const backupData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            data: {
                transactions,
                debts,
                reminders
            }
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const uri = ((FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory) + `finans_yedek_${Date.now()}.json`;

        await FileSystem.writeAsStringAsync(uri, jsonString, {
            encoding: 'utf8' as any
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/json',
                dialogTitle: 'Yedek Dosyasını Kaydet'
            });
            return true;
        } else {
            alert('Paylaşım özelliği bu cihazda kullanılamıyor.');
            return false;
        }
    } catch (error) {
        console.error("Backup Error:", error);
        throw new Error('Yedek oluşturulurken bir hata oluştu.');
    }
};

// Restore: JSON dosyasından verileri içe aktar
export const importBackup = async (): Promise<{ transactions: Transaction[], debts: Debt[], reminders: Reminder[] } | null> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true
        });

        if (result.canceled) {
            return null;
        }

        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'utf8' as any
        });

        const backupData = JSON.parse(fileContent);

        // Validate backup data structure
        if (!backupData.data || !backupData.data.transactions || !backupData.data.debts || !backupData.data.reminders) {
            throw new Error('Geçersiz yedek dosyası formatı.');
        }

        return {
            transactions: backupData.data.transactions,
            debts: backupData.data.debts,
            reminders: backupData.data.reminders
        };
    } catch (error) {
        console.error("Restore Error:", error);
        throw new Error('Yedek dosyası okunurken bir hata oluştu.');
    }
};
