/**
 * Tutar girişlerinde otomatik binlik noktalama (Türk formatı)
 * Nokta (.) = binlik ayracı, Virgül (,) = ondalık ayracı
 * Örnek: 15000 → 15.000 | 1500,50 → 1.500,50
 */

/**
 * Kullanıcı yazarken formatlar: 15000 → 15.000
 * Ondalık virgülü destekler: 1500,50 → 1.500,50
 */
export const formatAmountInput = (text: string): string => {
    if (!text) return '';

    // Sadece rakam ve virgüle izin ver
    let cleaned = text.replace(/[^0-9,]/g, '');

    // Birden fazla virgül engelle
    const parts = cleaned.split(',');
    if (parts.length > 2) {
        cleaned = parts[0] + ',' + parts.slice(1).join('');
    }

    // Tamsayı ve ondalık kısımlarını ayır
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1].slice(0, 2) : undefined; // Maks 2 ondalık

    // Başındaki sıfırları kaldır (tek sıfır hariç)
    let cleanInteger = integerPart.replace(/^0+/, '') || '';
    if (cleanInteger === '' && integerPart.length > 0) cleanInteger = '0';

    // Binlik noktalama uygula
    const formatted = cleanInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Ondalık kısmı varsa ekle
    if (decimalPart !== undefined) {
        return `${formatted},${decimalPart}`;
    }

    // Virgül yazıldıysa (ama ondalık yok ise) virgülü göster
    if (text.endsWith(',')) {
        return `${formatted},`;
    }

    return formatted;
};

/**
 * Formatlanmış metni sayıya çevirir: "1.500,50" → 1500.50
 */
export const parseFormattedAmount = (formatted: string): number => {
    if (!formatted) return 0;

    // Binlik noktalarını kaldır, virgülü noktaya çevir
    const cleaned = formatted
        .replace(/\./g, '')  // Binlik noktalarını kaldır
        .replace(',', '.');  // Virgülü ondalık noktaya çevir

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};
