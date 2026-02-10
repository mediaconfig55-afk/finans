import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants/colors';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    isLoading = false,
    style
}) => {
    const getBackgroundColor = () => {
        switch (variant) {
            case 'primary': return COLORS.primary;
            case 'secondary': return COLORS.secondary;
            case 'outline': return 'transparent';
            default: return COLORS.primary;
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'primary': return COLORS.background; // Black text on neon green
            case 'secondary': return COLORS.background;
            case 'outline': return COLORS.primary;
            default: return COLORS.background;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: variant === 'outline' ? COLORS.primary : 'transparent',
                    borderWidth: variant === 'outline' ? 1 : 0,
                },
                style
            ]}
            onPress={onPress}
            disabled={isLoading}
            activeOpacity={0.7}
        >
            {isLoading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        borderRadius: SIZES.radius,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        marginVertical: 10,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});

export default Button;
