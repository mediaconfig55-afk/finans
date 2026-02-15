import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Icon } from 'react-native-paper';

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


import { TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

function CustomTabBar({ state, descriptors, navigation }: any) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={{
            flexDirection: 'row',
            backgroundColor: '#1c1c1e',
            height: 70,
            position: 'absolute',
            bottom: Math.max(insets.bottom, 20) + 10, // Smart positioning: At least 20px, plus 10px buffer
            left: 20,
            right: 20,
            borderRadius: 35,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
            alignItems: 'center',
            justifyContent: 'space-around',
        }}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

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

                // Define icons and colors based on route name
                switch (route.name) {
                    case 'DashboardTab':
                        iconName = isFocused ? "view-dashboard" : "view-dashboard-outline";
                        activeColor = "#0A84FF"; // iOS Blue
                        break;
                    case 'TransactionsTab':
                        iconName = isFocused ? "swap-horizontal-bold" : "swap-horizontal";
                        activeColor = "#30D158"; // iOS Green
                        break;
                    case 'StatsTab':
                        iconName = isFocused ? "finance" : "chart-timeline-variant";
                        activeColor = "#BF5AF2"; // iOS Purple
                        break;
                    case 'DebtsTab':
                        iconName = isFocused ? "credit-card-plus" : "credit-card-outline";
                        activeColor = "#FF453A"; // iOS Red
                        break;
                    default:
                        iconName = "circle";
                        activeColor = theme.colors.primary;
                }

                return (
                    <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            paddingTop: 10,
                        }}
                    >
                        <View style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: isFocused ? `${activeColor}20` : 'transparent', // 20% opacity background
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Icon
                                source={iconName}
                                color={isFocused ? activeColor : '#8E8E93'}
                                size={28}
                            />
                        </View>
                    </TouchableOpacity>
                );
            })}
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
    const theme = useTheme();

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
                    title: 'Yeni İşlem',
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen
                name="AddDebt"
                component={AddDebtScreen}
                options={{
                    title: 'Borç/Alacak Ekle',
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
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
