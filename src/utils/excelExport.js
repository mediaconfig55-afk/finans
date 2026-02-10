import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const exportToExcel = async (transactions) => {
    try {
        if (!transactions || transactions.length === 0) {
            Alert.alert('Uyarı', 'Dışa aktarılacak veri bulunamadı.');
            return;
        }

        // Format data for Excel
        const data = transactions.map(item => ({
            Tarih: new Date(item.date).toLocaleDateString('tr-TR'),
            Tip: item.type === 'income' ? 'Gelir' : item.type === 'expense' ? 'Gider' : 'Borç',
            Kategori: item.category,
            Açıklama: item.description || '-',
            Tutar: item.amount,
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Islemler");

        // Write to file
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const uri = FileSystem.documentDirectory + 'finans_raporu.xlsx';

        await FileSystem.writeAsStringAsync(uri, wbout, {
            encoding: FileSystem.EncodingType.Base64
        });

        // Share file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
        } else {
            Alert.alert('Hata', 'Paylaşım özelliği bu cihazda desteklenmiyor.');
        }

    } catch (error) {
        console.error('Excel export error:', error);
        Alert.alert('Hata', 'Excel dosyası oluşturulurken bir hata oluştu.');
    }
};
