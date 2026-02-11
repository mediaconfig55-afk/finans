import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import {
    DashboardScreen,
    TransactionsScreen,
    AddTransactionScreen,
    DebtsScreen,
    AddDebtScreen,
    StatsScreen,
    SettingsScreen,
    TransactionDetailScreen,
    RemindersScreen
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.elevation.level2,
                    borderTopColor: theme.colors.outlineVariant,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            }}
        >
            <Tab.Screen
                name="DashboardTab"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Özet',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
                        <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="TransactionsTab"
                component={TransactionsScreen}
                options={{
                    tabBarLabel: 'İşlemler',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
                        <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="StatsTab"
                component={StatsScreen}
                options={{
                    tabBarLabel: 'Analiz',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
                        <MaterialCommunityIcons name="chart-pie" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="DebtsTab"
                component={DebtsScreen}
                options={{
                    tabBarLabel: 'Borçlar',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
                        <MaterialCommunityIcons name="handshake" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default function Navigation() {
    const theme = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.onBackground,
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="Root"
                component={TabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddTransaction"
                component={AddTransactionScreen}
                options={{ title: 'Yeni İşlem', presentation: 'modal' }}
            />
            <Stack.Screen
                name="AddDebt"
                component={AddDebtScreen}
                options={{ title: 'Borç/Alacak Ekle', presentation: 'modal' }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Ayarlar' }}
            />
            <Stack.Screen
                name="TransactionDetail"
                component={TransactionDetailScreen}
                options={{ title: 'İşlem Detayı' }}
            />
            <Stack.Screen
                name="Reminders"
                component={RemindersScreen}
                options={{ title: 'Fatura Hatırlatıcı' }}
            />
        </Stack.Navigator>
    );
}
