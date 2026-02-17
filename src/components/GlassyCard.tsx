import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    intensity?: number;
    gradientColors?: string[];
}

export const GlassyCard = ({ children, style, intensity = 0.05, gradientColors }: Props) => {
    const theme = useTheme();

    // Default glass effect: very subtle white/light overlay on dark theme, or dark on light
    const baseColor = theme.dark ? '255, 255, 255' : '0, 0, 0';
    const colors = gradientColors || [
        `rgba(${baseColor}, ${intensity})`,
        `rgba(${baseColor}, ${intensity * 0.5})`
    ];

    return (
        <LinearGradient
            colors={colors as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.card,
                {
                    borderColor: `rgba(${baseColor}, ${intensity * 2})`,
                    shadowColor: theme.colors.shadow || '#000',
                },
                style
            ]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        // Subtle shadow for minimal depth
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        overflow: 'hidden',
    },
});
