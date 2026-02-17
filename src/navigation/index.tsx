import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../i18n';
import { useAppTheme } from '../hooks/useAppTheme';

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
import { Transaction } from '../types';

export type RootStackParamList = {
    Root: undefined;
    AddTransaction: undefined;
    AddDebt: undefined;
    Settings: undefined;
    TransactionDetail: { transaction: Transaction };
    Reminders: undefined;
    TransactionsTab: undefined; // Accessible via Tab but also via Stack as a screen inside Root
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


import { TouchableOpacity, Text } from 'react-native';

function CustomTabBar({ state, descriptors, navigation }: any) {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const isDark = theme.dark;

    // Gradient colors for the bar background
    const gradientColors = isDark
        ? ['#1A1035', '#0D1B2A', '#1A1035'] as const
        : ['#F0EAFF', '#E8F4FD', '#F0EAFF'] as const;

    return (
        <View style={{
            position: 'absolute',
            bottom: Math.max(insets.bottom, 12),
            left: 12,
            right: 12,
            shadowColor: isDark ? '#7C3AED' : '#6366F1',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.4 : 0.15,
            shadowRadius: 24,
            elevation: 12,
        }}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    height: 68,
                    borderRadius: 22,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    borderWidth: 1.5,
                    borderColor: isDark ? 'rgba(124, 58, 237, 0.25)' : 'rgba(99, 102, 241, 0.12)',
                    paddingHorizontal: 8,
                }}
            >
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    let iconName = "";
                    let activeColor = "";
                    let tabLabel = "";

                    switch (route.name) {
                        case 'DashboardTab':
                            iconName = isFocused ? "view-dashboard" : "view-dashboard-outline";
                            activeColor = '#0A84FF';
                            tabLabel = i18n.t('dashboard', { defaultValue: 'Ana Sayfa' });
                            break;
                        case 'TransactionsTab':
                            iconName = isFocused ? "swap-horizontal-bold" : "swap-horizontal";
                            activeColor = '#30D158';
                            tabLabel = i18n.t('transactions', { defaultValue: 'İşlemler' });
                            break;
                        case 'StatsTab':
                            iconName = isFocused ? "finance" : "chart-timeline-variant";
                            activeColor = '#BF5AF2';
                            tabLabel = i18n.t('statistics', { defaultValue: 'İstatistik' });
                            break;
                        case 'DebtsTab':
                            iconName = isFocused ? "credit-card-plus" : "credit-card-outline";
                            activeColor = '#FF453A';
                            tabLabel = i18n.t('debts', { defaultValue: 'Borçlar' });
                            break;
                        default:
                            iconName = "circle";
                            activeColor = theme.colors.primary;
                            tabLabel = '';
                    }

                    const inactiveColor = isDark ? '#6B7280' : '#94A3B8';

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            activeOpacity={0.7}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            {/* Active tab: glowing pill indicator */}
                            <View style={{
                                paddingHorizontal: isFocused ? 14 : 0,
                                paddingVertical: isFocused ? 6 : 0,
                                borderRadius: 14,
                                backgroundColor: isFocused ? `${activeColor}20` : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                gap: isFocused ? 6 : 0,
                                transform: [{ scale: isFocused ? 1.08 : 1 }],
                            }}>
                                <Icon
                                    source={iconName}
                                    color={isFocused ? activeColor : inactiveColor}
                                    size={isFocused ? 24 : 22}
                                />
                                {isFocused && (
                                    <Text style={{
                                        fontSize: 11,
                                        fontWeight: '700',
                                        color: activeColor,
                                        letterSpacing: 0.3,
                                    }}>{tabLabel}</Text>
                                )}
                            </View>
                            {/* Colored dot below inactive tabs */}
                            {!isFocused && (
                                <View style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: activeColor,
                                    opacity: 0.4,
                                    marginTop: 4,
                                }} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </LinearGradient>
        </View>
    );
}

function TabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="DashboardTab" component={DashboardScreen} />
            <Tab.Screen name="TransactionsTab" component={TransactionsScreen} />
            <Tab.Screen name="StatsTab" component={StatsScreen} />
            <Tab.Screen name="DebtsTab" component={DebtsScreen} />
        </Tab.Navigator>
    );
}

export default function Navigation() {
    const theme = useAppTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.onBackground,
                headerTitleStyle: { fontWeight: 'bold' },
                animation: 'slide_from_right', // Default animation
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
                options={{
                    title: i18n.t('addTransaction'),
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen
                name="AddDebt"
                component={AddDebtScreen}
                options={{
                    title: i18n.t('addDebt'),
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: i18n.t('settings') }}
            />
            <Stack.Screen
                name="TransactionDetail"
                component={TransactionDetailScreen}
                options={{ title: i18n.t('transactionDetail') }}
            />
            <Stack.Screen
                name="Reminders"
                component={RemindersScreen}
                options={{ title: i18n.t('reminders') }}
            />
        </Stack.Navigator>
    );
}
