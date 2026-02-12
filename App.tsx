import './src/i18n'; // Initialize i18n
import React, { useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLightTheme, AppDarkTheme } from './src/theme';
import { initDatabase } from './src/database/db';
import Navigation from './src/navigation';
import { registerForPushNotificationsAsync } from './src/utils/notifications';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useStore } from './src/store';
import { OnboardingScreen } from './src/screens';

export default function App() {
  const themeMode = useStore((state) => state.theme);
  const { setUserName, setOnboardingComplete } = useStore();
  const theme = themeMode === 'dark' ? AppDarkTheme : AppLightTheme;
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();

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
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    registerForPushNotificationsAsync();
  };

  if (!isReady) {
    return null; // Or a splash screen
  }

  if (showOnboarding) {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          </PaperProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer theme={theme as any}>
            <Navigation />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
