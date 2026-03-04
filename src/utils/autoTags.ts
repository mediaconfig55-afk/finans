/**
 * Otomatik Etiket Sistemi
 * Açıklama ve kategoriye göre otomatik etiketler önerir.
 * Etiketler virgülle ayrılmış string olarak saklanır: "araba,yakıt,benzin"
 */

import i18n from '../i18n';

interface TagRule {
    keywords: string[];
    tags: string[];
}

/**
 * Gider etiket kuralları — açıklamadaki anahtar kelimelere göre
 */
const EXPENSE_TAG_RULES: TagRule[] = [
    // Yakıt & Araç
    {
        keywords: ['yakıt', 'benzin', 'mazot', 'lpg', 'akaryakıt', 'opet', 'bp', 'shell', 'petrol', 'total'],
        tags: ['araba', 'yakıt'],
    },
    {
        keywords: ['otopark', 'parking', 'garaj'],
        tags: ['araba', 'otopark'],
    },
    {
        keywords: ['sigorta', 'kasko', 'trafik sigortası'],
        tags: ['araba', 'sigorta'],
    },
    {
        keywords: ['bakım', 'servis', 'yağ değişim', 'lastik', 'tamirci', 'oto yıkama'],
        tags: ['araba', 'bakım'],
    },
    // Fatura & Abonelik
    {
        keywords: ['elektrik', 'elektrik faturası'],
        tags: ['fatura', 'elektrik'],
    },
    {
        keywords: ['su faturası', 'su fatura', 'iski'],
        tags: ['fatura', 'su'],
    },
    {
        keywords: ['doğalgaz', 'doğalgaz faturası', 'igdaş'],
        tags: ['fatura', 'doğalgaz'],
    },
    {
        keywords: ['internet', 'wifi', 'fiber'],
        tags: ['fatura', 'internet'],
    },
    {
        keywords: ['telefon faturası', 'hat faturası', 'turkcell', 'vodafone', 'türk telekom'],
        tags: ['fatura', 'telefon'],
    },
    {
        keywords: ['netflix', 'spotify', 'youtube', 'disney', 'amazon prime', 'apple', 'hbo'],
        tags: ['abonelik', 'dijital'],
    },
    // Market & Gıda
    {
        keywords: ['bim', 'a101', 'şok', 'migros', 'carrefour', 'metro', 'file'],
        tags: ['market', 'gıda'],
    },
    {
        keywords: ['ekmek', 'süt', 'yumurta', 'meyve', 'sebze', 'et', 'tavuk', 'balık'],
        tags: ['gıda', 'temel ihtiyaç'],
    },
    {
        keywords: ['restoran', 'cafe', 'kahve', 'starbucks', 'yemek', 'sipariş', 'getir', 'trendyol yemek', 'yemeksepeti'],
        tags: ['yemek', 'dışarıda'],
    },
    // Sağlık
    {
        keywords: ['ilaç', 'eczane'],
        tags: ['sağlık', 'ilaç'],
    },
    {
        keywords: ['hastane', 'doktor', 'muayene', 'klinik', 'poliklinik'],
        tags: ['sağlık', 'hastane'],
    },
    {
        keywords: ['diş', 'dişçi'],
        tags: ['sağlık', 'diş'],
    },
    // Ulaşım
    {
        keywords: ['otobüs', 'metro', 'metrobüs', 'tramvay', 'istanbulkart', 'akbil'],
        tags: ['ulaşım', 'toplu taşıma'],
    },
    {
        keywords: ['taksi', 'uber', 'bitaksi'],
        tags: ['ulaşım', 'taksi'],
    },
    // Giyim
    {
        keywords: ['kıyafet', 'giyim', 'ayakkabı', 'pantolon', 'gömlek', 'ceket', 'elbise'],
        tags: ['giyim'],
    },
    {
        keywords: ['lcw', 'defacto', 'h&m', 'zara', 'koton', 'mavi', 'boyner'],
        tags: ['giyim', 'alışveriş'],
    },
    // Eğlence
    {
        keywords: ['sinema', 'tiyatro', 'konser', 'bilet', 'etkinlik'],
        tags: ['eğlence', 'etkinlik'],
    },
    {
        keywords: ['oyun', 'playstation', 'xbox', 'steam', 'game'],
        tags: ['eğlence', 'oyun'],
    },
    // Eğitim
    {
        keywords: ['kurs', 'eğitim', 'kitap', 'udemy', 'okul', 'ders', 'özel ders'],
        tags: ['eğitim'],
    },
    // Teknoloji
    {
        keywords: ['telefon', 'bilgisayar', 'laptop', 'tablet', 'kulaklık', 'şarj', 'aksesuar'],
        tags: ['teknoloji'],
    },
    // Ev & Kira
    {
        keywords: ['kira'],
        tags: ['ev', 'kira'],
    },
    {
        keywords: ['aidat', 'apartman'],
        tags: ['ev', 'aidat'],
    },
    {
        keywords: ['mobilya', 'dekorasyon', 'ev eşyası', 'ikea'],
        tags: ['ev', 'mobilya'],
    },
];

/**
 * Gelir etiket kuralları
 */
const INCOME_TAG_RULES: TagRule[] = [
    {
        keywords: ['maaş', 'ücret'],
        tags: ['maaş', 'düzenli gelir'],
    },
    {
        keywords: ['avans'],
        tags: ['maaş', 'avans'],
    },
    {
        keywords: ['prim', 'bonus'],
        tags: ['maaş', 'prim'],
    },
    {
        keywords: ['kira geliri'],
        tags: ['yatırım', 'kira geliri'],
    },
    {
        keywords: ['faiz', 'temettü', 'kar payı'],
        tags: ['yatırım', 'faiz'],
    },
    {
        keywords: ['freelance', 'serbest'],
        tags: ['ek gelir', 'freelance'],
    },
    {
        keywords: ['satış', 'satılan'],
        tags: ['ek gelir', 'satış'],
    },
];

/**
 * Kategori bazlı varsayılan etiketler (açıklamada eşleşme yoksa)
 */
const CATEGORY_DEFAULT_TAGS: Record<string, string[]> = {
    market: ['market', 'gıda'],
    food: ['yemek'],
    transport: ['ulaşım'],
    bill: ['fatura'],
    entertainment: ['eğlence'],
    rent: ['ev', 'kira'],
    health: ['sağlık'],
    clothing: ['giyim'],
    technology: ['teknoloji'],
    education: ['eğitim'],
    salary: ['maaş', 'düzenli gelir'],
    extraIncome: ['ek gelir'],
    investment: ['yatırım'],
    other: [],
};

/**
 * Açıklama ve kategoriye göre otomatik etiket öner
 */
export function suggestTags(
    description: string | undefined,
    category: string,
    type: 'income' | 'expense'
): string[] {
    const tags = new Set<string>();

    if (description) {
        const lowerDesc = description.toLowerCase();
        const rules = type === 'expense' ? EXPENSE_TAG_RULES : INCOME_TAG_RULES;

        for (const rule of rules) {
            if (rule.keywords.some(kw => lowerDesc.includes(kw))) {
                rule.tags.forEach(tag => tags.add(tag));
            }
        }
    }

    // Eğer açıklamadan etiket bulunamadıysa, kategoriden varsayılan etiketleri al
    if (tags.size === 0) {
        const defaults = CATEGORY_DEFAULT_TAGS[category];
        if (defaults) {
            defaults.forEach(tag => tags.add(tag));
        }
    }

    return Array.from(tags);
}

/**
 * Etiket dizisini virgülle ayrılmış stringe çevir (DB için)
 */
export function tagsToString(tags: string[]): string {
    return tags.join(',');
}

/**
 * Virgülle ayrılmış stringi etiket dizisine çevir
 */
export function stringToTags(tagString: string | null | undefined): string[] {
    if (!tagString) return [];
    return tagString.split(',').map(t => t.trim()).filter(Boolean);
}
