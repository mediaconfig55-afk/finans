import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const customColors = {
    primary: '#006D77', // Teal-ish
    secondary: '#83C5BE',
    tertiary: '#E29578',
    error: '#BA1A1A',
    income: '#2E7D32',
    expense: '#C62828',
    white: '#FFFFFF',
    text: '#121212',
};

export const AppLightTheme = {
    ...MD3LightTheme,
    roundness: 12,
    colors: {
        ...MD3LightTheme.colors,
        primary: customColors.primary,
        secondary: customColors.secondary,
        tertiary: customColors.tertiary,
        error: customColors.error,
        // Skill: Light mode text #0F172A (slate-900), muted #475569 (slate-600)
        onSurface: '#0F172A',
        onSurfaceVariant: '#475569',
        outline: '#E2E8F0', // slate-200 for borders
        customIncome: customColors.income,
        customExpense: customColors.expense,
        accent: customColors.primary,
        cardGradientStart: '#F8FAFC',
        cardGradientEnd: '#F1F5F9',
        incomeIcon: '#2E7D32',
        expenseIcon: '#C62828',
        tabBarBg: 'rgba(255, 255, 255, 0.95)',
        tabBarBorder: 'rgba(0,0,0,0.08)',
        tabBarInactive: '#64748B',
        tabDashboard: '#0A84FF',
        tabTransactions: '#30D158',
        tabStats: '#BF5AF2',
        tabDebts: '#FF453A',
    },
};

export const AppDarkTheme = {
    ...MD3DarkTheme,
    roundness: 12, // Flat, modern roundness for buttons/cards
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#FF6B00', // Vibrant Orange (Fitness Style)
        onPrimary: '#FFFFFF',
        primaryContainer: '#331B00',
        onPrimaryContainer: '#FFD1B3',
        secondary: '#FFFFFF', // High contrast white for headers
        onSecondary: '#000000',
        tertiary: '#FF6B00', // Warning/Action
        background: '#000000', // Pure Black
        surface: '#1C1C1E', // Matte Dark Grey (Card Background)
        surfaceVariant: '#2C2C2E', // Slightly lighter for inputs/borders
        error: '#CF6679',
        onSurface: '#FFFFFF',
        onSurfaceVariant: '#8E8E93', // Subtext Grey
        outline: '#2C2C2E',
        customIncome: '#34C759', // Apple Green
        customExpense: '#FF3B30', // Apple Red
        accent: '#651FFF', // Deep Purple CTA
        cardGradientStart: '#1C1C1E',
        cardGradientEnd: '#2C2C2E',
        incomeIcon: '#34C759',
        expenseIcon: '#FF3B30',
        tabBarBg: 'rgba(28, 28, 30, 0.95)',
        tabBarBorder: 'rgba(255,255,255,0.08)',
        tabBarInactive: '#8E8E93',
        tabDashboard: '#0A84FF',
        tabTransactions: '#30D158',
        tabStats: '#BF5AF2',
        tabDebts: '#FF453A',
        elevation: {
            level0: 'transparent',
            level1: '#1C1C1E',
            level2: '#2C2C2E',
            level3: '#3A3A3C',
            level4: '#48484A',
            level5: '#636366',
        }
    },
    animation: {
        scale: 1.0,
    },
};

