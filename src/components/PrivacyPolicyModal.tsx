import React from 'react';
import { View, ScrollView, StyleSheet, Modal, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Text, Icon, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '../i18n';

interface PrivacyPolicyModalProps {
    visible: boolean;
    onDismiss: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ visible, onDismiss }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const isDark = theme.dark;

    const bg = isDark ? '#0D1117' : '#FFFFFF';
    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const accent = isDark ? '#00ff88' : '#10B981';
    const textPrimary = isDark ? '#F0F6FC' : '#1F2937';
    const textSecondary = isDark ? '#8B949E' : '#6B7280';

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
            <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
            {children}
        </View>
    );

    const BulletPoint = ({ text, bold }: { text: string; bold?: string }) => (
        <View style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: accent }]} />
            <Text style={[styles.bodyText, { color: textSecondary }]}>
                {bold && <Text style={{ fontWeight: '700', color: textPrimary }}>{bold} </Text>}
                {text}
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onDismiss}
        >
            <View style={[styles.container, { backgroundColor: bg, paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0 }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                    <View style={styles.headerLeft}>
                        <Icon source="shield-check" size={24} color={accent} />
                        <Text style={[styles.headerTitle, { color: textPrimary }]}>
                            {i18n.t('privacyPolicy', { defaultValue: 'Gizlilik Politikası' })}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onDismiss} style={[styles.closeButton, { backgroundColor: cardBg }]}>
                        <Icon source="close" size={20} color={textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[styles.lastUpdated, { color: textSecondary }]}>
                        Son güncelleme: 19 Mart 2026
                    </Text>

                    <Section title="1. Giriş">
                        <Text style={[styles.bodyText, { color: textSecondary }]}>
                            Finans uygulaması ("Uygulama") olarak kullanıcılarımızın gizliliğine büyük önem veriyoruz. Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
                        </Text>
                    </Section>

                    <Section title="2. Toplanan Veriler">
                        <Text style={[styles.bodyText, { color: textSecondary, marginBottom: 12 }]}>
                            Uygulamamız aşağıdaki verileri toplar ve işler:
                        </Text>
                        <BulletPoint bold="Kullanıcı Adı:" text="Uygulama kurulumu sırasında girdiğiniz isim, yalnızca uygulamada size kişiselleştirilmiş mesajlar göstermek için kullanılır." />
                        <BulletPoint bold="Finansal Veriler:" text="Gelir, gider, borç ve hatırlatıcı bilgileri tamamen cihazınızda (yerel depolama) saklanır ve herhangi bir sunucuya gönderilmez." />
                        <BulletPoint bold="Bildirim Tercihleri:" text="Hatırlatıcı alarmları için bildirim izni talep edilir." />
                    </Section>

                    <Section title="3. Veri Depolama">
                        <Text style={[styles.bodyText, { color: textSecondary }]}>
                            Tüm finansal verileriniz (gelir, gider, borçlar, hatırlatıcılar) yalnızca cihazınızda yerel olarak saklanır. Verileriniz hiçbir dış sunucuya, bulut hizmetine veya üçüncü tarafa aktarılmaz. Uygulamayı sildiğinizde tüm verileriniz cihazınızdan kalıcı olarak silinir.
                        </Text>
                    </Section>

                    <Section title="4. Reklam Hizmetleri">
                        <Text style={[styles.bodyText, { color: textSecondary }]}>
                            Uygulamamız Google AdMob reklam hizmeti kullanmaktadır. AdMob, kişiselleştirilmiş veya kişiselleştirilmemiş reklamlar göstermek için cihaz tanımlayıcıları ve kullanım verileri toplayabilir. Bu veri toplama işlemi Google'ın gizlilik politikasına tabidir.
                        </Text>
                    </Section>

                    <Section title="5. Üçüncü Taraf Hizmetleri">
                        <BulletPoint bold="Google AdMob:" text="Reklam gösterimi için kullanılır." />
                        <BulletPoint bold="Expo Notifications:" text="Yerel bildirimler için kullanılır; veriler cihaz dışına gönderilmez." />
                    </Section>

                    <Section title="6. Çocukların Gizliliği">
                        <Text style={[styles.bodyText, { color: textSecondary }]}>
                            Uygulamamız 13 yaşın altındaki çocuklara yönelik değildir. Bilinçli olarak 13 yaşın altındaki kişilerden kişisel bilgi toplamayız.
                        </Text>
                    </Section>

                    <Section title="7. Kullanıcı Hakları">
                        <Text style={[styles.bodyText, { color: textSecondary, marginBottom: 12 }]}>
                            Kullanıcılar olarak aşağıdaki haklara sahipsiniz:
                        </Text>
                        <BulletPoint text="Uygulamadaki tüm verilerinizi dışa aktarma (Excel/Yedek dosyası)" />
                        <BulletPoint text="Uygulamayı silerek tüm verilerinizi kalıcı olarak kaldırma" />
                        <BulletPoint text="Bildirimleri istediğiniz zaman kapatma" />
                        <BulletPoint text="Kişiselleştirilmemiş reklam tercih etme" />
                    </Section>

                    <Section title="8. Veri Güvenliği">
                        <Text style={[styles.bodyText, { color: textSecondary }]}>
                            Verileriniz cihazınızda yerel SQLite veritabanında saklanır. Ancak hiçbir güvenlik yönteminin %100 güvenli olmadığını unutmayınız.
                        </Text>
                    </Section>

                    <Section title="9. Politika Değişiklikleri">
                        <Text style={[styles.bodyText, { color: textSecondary }]}>
                            Bu Gizlilik Politikası zaman zaman güncellenebilir. Değişiklikler uygulama içinde ve web sitemizde yayınlanacaktır.
                        </Text>
                    </Section>

                    <Section title="10. İletişim">
                        <BulletPoint bold="Geliştirici:" text="Finans App" />
                        <BulletPoint bold="Web:" text="mediaconfig55-afk.github.io/finanswebsite" />
                    </Section>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    lastUpdated: {
        fontSize: 13,
        marginBottom: 20,
    },
    section: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 10,
    },
    bodyText: {
        fontSize: 14,
        lineHeight: 22,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingRight: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
        marginRight: 10,
    },
});
