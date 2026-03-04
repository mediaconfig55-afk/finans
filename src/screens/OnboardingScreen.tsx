import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Text, Button, useTheme, Portal, Dialog, TextInput, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { useStore } from '../store';
import i18n from '../i18n';

const { width } = Dimensions.get('window');

interface Slide {
    id: number;
    title: string;
    description: string;
    icon: string;
    animation: any;
}

const getSlides = (): Slide[] => [
    {
        id: 1,
        title: i18n.t('onboardingTitle1'),
        description: i18n.t('onboardingDesc1'),
        icon: "wallet",
        animation: "bounceIn"
    },
    {
        id: 2,
        title: i18n.t('onboardingTitle2'),
        description: i18n.t('onboardingDesc2'),
        icon: "chart-line",
        animation: "fadeInUp"
    },
    {
        id: 3,
        title: i18n.t('onboardingTitle3'),
        description: i18n.t('onboardingDesc3'),
        icon: "bell-ring",
        animation: "pulse"
    }
];

interface OnboardingScreenProps {
    onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const theme = useTheme();
    const slides = getSlides();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [showNameDialog, setShowNameDialog] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [name, setName] = useState('');
    const { setUserName, setOnboardingComplete } = useStore();

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            // Son slide'dayız, bildirim izni iste
            setShowPermissionDialog(true);
        }
    };

    const handleSkip = () => {
        setShowPermissionDialog(true);
    };

    const handlePermissionGrant = async () => {
        try {
            const granted = await registerForPushNotificationsAsync();
            if (granted) {
                setShowPermissionDialog(false);
                // Teşekkür mesajı göster
                setShowThankYou(true);
                setTimeout(() => {
                    setShowThankYou(false);
                    setShowNameDialog(true);
                }, 2000);
            } else {
                // İzin verilmedi, uyarı göster
                Alert.alert(
                    i18n.t('permissionDeniedTitle'),
                    i18n.t('permissionDeniedMessage'),
                    [
                        { text: i18n.t('goToSettings'), onPress: () => Linking.openSettings() },
                        { text: i18n.t('tryAgain'), onPress: () => handlePermissionGrant() }
                    ]
                );
            }
        } catch (error) {
            Alert.alert(i18n.t('error'), i18n.t('genericError'));
        }
    };

    const handleStartApp = async () => {
        if (name.trim().length < 2) {
            return;
        }

        setShowNameDialog(false);

        // Kullanıcı adını kaydet
        setUserName(name.trim());
        await AsyncStorage.setItem('userName', name.trim());

        // Hoş geldin mesajı göster
        setShowWelcome(true);
        setTimeout(async () => {
            setShowWelcome(false);
            // Onboarding tamamlandı olarak işaretle
            setOnboardingComplete();
            await AsyncStorage.setItem('onboardingComplete', 'true');
            onComplete();
        }, 2000);
    };

    const renderSlide = ({ item }: { item: Slide }) => (
        <View style={[styles.slide, { width }]}>
            <View style={styles.iconContainer}>
                <Icon
                    source={item.icon}
                    size={120}
                    color={theme.colors.primary}
                />
            </View>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
                {item.title}
            </Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                {item.description}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Skip Button */}
            {currentIndex < slides.length - 1 && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={{ color: theme.colors.primary }}>{i18n.t('skip')}</Text>
                </TouchableOpacity>
            )}

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id.toString()}
            />

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: index === currentIndex
                                    ? theme.colors.primary
                                    : theme.colors.surfaceVariant,
                                width: index === currentIndex ? 24 : 8,
                            }
                        ]}
                    />
                ))}
            </View>

            {/* Next Button */}
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={handleNext}
                    style={styles.button}
                    contentStyle={{ paddingVertical: 8 }}
                >
                    {currentIndex < slides.length - 1 ? i18n.t('next') : i18n.t('start')}
                </Button>
            </View>

            {/* Permission Dialog */}
            <Portal>
                <Dialog visible={showPermissionDialog} dismissable={false}>
                    <Dialog.Icon icon="bell-ring" size={60} />
                    <Dialog.Title style={{ textAlign: 'center' }}>{i18n.t('permissionRequired')}</Dialog.Title>
                    <Dialog.Content>
                        <Text style={{ textAlign: 'center' }}>
                            {i18n.t('permissionDesc')}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button mode="contained" onPress={handlePermissionGrant}>{i18n.t('grantPermission')}</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Thank You Dialog */}
            <Portal>
                <Dialog visible={showThankYou} dismissable={false}>
                    <View style={{ alignItems: 'center', padding: 20 }}>
                        <Icon source="check-circle" size={80} color={theme.colors.primary} />
                        <Text variant="headlineSmall" style={{ marginTop: 16, fontWeight: 'bold' }}>
                            {i18n.t('thankYou')}
                        </Text>
                    </View>
                </Dialog>
            </Portal>

            {/* Name Input Dialog */}
            <Portal>
                <Dialog visible={showNameDialog} dismissable={false}>
                    <Dialog.Icon icon="account" size={60} />
                    <Dialog.Title style={{ textAlign: 'center' }}>{i18n.t('letsKnowYou')}</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label={i18n.t('yourName')}
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            autoFocus
                            placeholder={i18n.t('enterYourName')}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            mode="contained"
                            onPress={handleStartApp}
                            disabled={name.trim().length < 2}
                        >
                            {i18n.t('start')}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Welcome Dialog */}
            <Portal>
                <Dialog visible={showWelcome} dismissable={false}>
                    <View style={{ alignItems: 'center', padding: 20 }}>
                        <Icon source="hand-wave" size={80} color={theme.colors.primary} />
                        <Text variant="headlineSmall" style={{ marginTop: 16, fontWeight: 'bold', textAlign: 'center' }}>
                            {i18n.t('welcomeUser', { name })}
                        </Text>
                    </View>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 36,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        paddingHorizontal: 40,
        marginBottom: 40,
    },
    button: {
        borderRadius: 10,
    },
});
