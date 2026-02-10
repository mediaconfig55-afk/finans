import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { PieChart } from "react-native-gifted-charts";
import { COLORS, SIZES } from '../../constants/colors';
import BudgetPlanner from '../../components/BudgetPlanner';

const StatisticsScreen = () => {
    // Mock Data for Charts
    const pieData = [
        { value: 3200, color: '#FF0A0A', text: 'Market' },
        { value: 1850, color: '#FF5500', text: 'Fatura' },
        { value: 500, color: '#FFAA00', text: 'Eğlence' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>İstatistikler & Bütçe</Text>

                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Gider Dağılımı</Text>
                    <PieChart
                        data={pieData}
                        donut
                        showText
                        textColor="white"
                        radius={120}
                        innerRadius={60}
                        textSize={12}
                        backgroundColor={COLORS.background}
                        centerLabelComponent={() => {
                            return (
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>5550₺</Text>
                                    <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>Toplam</Text>
                                </View>
                            );
                        }}
                    />
                </View>

                {/* Legend - temporary manual legend */}
                <View style={styles.legendContainer}>
                    {pieData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                            <Text style={styles.legendText}>{item.text}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />

                <BudgetPlanner />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginLeft: SIZES.padding,
        marginBottom: 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.h3,
        marginBottom: 15,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 15,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    divider: {
        height: 8,
        backgroundColor: COLORS.surfaceLight,
        marginVertical: 10,
    },
});

export default StatisticsScreen;
