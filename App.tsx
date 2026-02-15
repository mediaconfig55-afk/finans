import './src/i18n'; // Initialize i18n
import React, { useEffect, useState, useCallback } from 'react';
import { View, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { AppLightTheme, AppDarkTheme } from './src/theme';
import { initDatabase } from './src/database/db';
import Navigation from './src/navigation';
import { registerForPushNotificationsAsync } from './src/utils/notifications';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useStore } from './src/store';
import { OnboardingScreen } from './src/screens';
import { IntroAnimation } from './src/components/IntroAnimation';
import { ToastProvider } from './src/context/ToastContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const themeMode = useStore((state) => state.theme);
  const { setUserName, setOnboardingComplete } = useStore();
  const theme = themeMode === 'dark' ? AppDarkTheme : AppLightTheme;
  const [appIsReady, setAppIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(false); // Show intro after splash
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();

        if (Platform.OS === 'android') {
          await NavigationBar.setPositionAsync('absolute');
          await NavigationBar.setBackgroundColorAsync('transparent');
        }

        // Check if onboarding is completed
        const [onboardingComplete, userName] = await Promise.all([
          AsyncStorage.getItem('onboardingComplete'),
          AsyncStorage.getItem('userName')
        ]);

        if (onboardingComplete === 'true') {
          setOnboardingComplete();
          if (userName) {
            setUserName(userName);
          }
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        setShowIntro(true); // Start showing intro animation
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial navigation state.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleIntroFinish = () => {
    setShowIntro(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    registerForPushNotificationsAsync();
  };

  if (!appIsReady) {
    return null;
  }

  // Show Intro Animation after Splash Screen hides
  if (showIntro) {
    return (
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <PaperProvider theme={theme}>
          <IntroAnimation onFinish={handleIntroFinish} />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  if (showOnboarding) {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <ToastProvider>
              <OnboardingScreen onComplete={handleOnboardingComplete} />
            </ToastProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <ToastProvider>
            <NavigationContainer theme={theme as any}>
              <Navigation />
            </NavigationContainer>
          </ToastProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
