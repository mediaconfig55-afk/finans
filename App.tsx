import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppLightTheme, AppDarkTheme } from './src/theme';
import { initDatabase } from './src/database/db';
import Navigation from './src/navigation';
import { registerForPushNotificationsAsync } from './src/utils/notifications';

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? AppDarkTheme : AppLightTheme;

  useEffect(() => {
    initDatabase();
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer theme={theme as any}>
          <Navigation />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
