import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons'; // Assuming we use Ionicons for password toggle

const Input = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    error,
    keyboardType = 'default',
    icon
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                {
                    borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.border,
                    backgroundColor: COLORS.surfaceLight
                }
            ]}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                />

                {secureTextEntry && (
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <Ionicons
                            name={isPasswordVisible ? "eye-off" : "eye"}
                            size={20}
                            color={COLORS.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        paddingHorizontal: SIZES.padding,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 16,
    },
    errorText: {
        color: COLORS.error,
        fontSize: SIZES.caption,
        marginTop: 4,
    },
});

export default Input;
