import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { COLORS, SIZES } from '../constants/colors';
import Button from './Button';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const MOCK_BUDGETS = [
    { id: '1', category: 'Market', limit: 5000, spent: 3200 },
    { id: '2', category: 'Fatura', limit: 2000, spent: 1850 },
    { id: '3', category: 'Eğlence', limit: 3000, spent: 500 },
];

const BudgetPlanner = () => {
    const [budgets, setBudgets] = useState(MOCK_BUDGETS);
    const [modalVisible, setModalVisible] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newLimit, setNewLimit] = useState('');

    const calculateProgress = (spent, limit) => {
        return Math.min(spent / limit, 1);
    };

    const getProgressColor = (progress) => {
        if (progress >= 0.9) return COLORS.error; // Red
        if (progress >= 0.7) return COLORS.warning; // Yellow
        return COLORS.success; // Green
    };

    const handleAddBudget = () => {
        if (!newCategory || !newLimit) return;

        const newBudget = {
            id: Date.now().toString(),
            category: newCategory,
            limit: parseFloat(newLimit),
            spent: 0
        };

        setBudgets([...budgets, newBudget]);
        setModalVisible(false);
        setNewCategory('');
        setNewLimit('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const renderItem = ({ item }) => {
        const progress = calculateProgress(item.spent, item.limit);
        const color = getProgressColor(progress);

        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.category}>{item.category}</Text>
                    <Text style={[styles.status, { color }]}>
                        %{Math.round(progress * 100)}
                    </Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: color }]} />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.spent}>{item.spent} ₺ harcandı</Text>
                    <Text style={styles.limit}>Limit: {item.limit} ₺</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.title}>Bütçe Hedefleri</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={budgets}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Yeni Bütçe Hedefi</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Kategori (Örn: Giyim)"
                        placeholderTextColor={COLORS.textMuted}
                        value={newCategory}
                        onChangeText={setNewCategory}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Limit (Örn: 2000)"
                        placeholderTextColor={COLORS.textMuted}
                        value={newLimit}
                        onChangeText={setNewLimit}
                        keyboardType="numeric"
                    />

                    <Button title="Ekle" onPress={handleAddBudget} />
                    <Button title="İptal" onPress={() => setModalVisible(false)} variant="outline" />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SIZES.padding,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    category: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    status: {
        fontWeight: 'bold',
    },
    progressContainer: {
        height: 8,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    spent: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    limit: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        marginTop: 100,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: COLORS.surfaceLight,
        padding: 15,
        borderRadius: SIZES.radius,
        color: COLORS.textPrimary,
        marginBottom: 15,
    },
});

export default BudgetPlanner;
