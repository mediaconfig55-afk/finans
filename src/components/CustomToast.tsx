import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface, Icon, useTheme } from 'react-native-paper';
import Animated, { FadeInUp, FadeOutUp, SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    visible: boolean;
    message: string;
    type: ToastType;
    onHide: () => void;
    duration?: number;
}

const { width } = Dimensions.get('window');

export const CustomToast: React.FC<ToastProps> = ({ visible, message, type, onHide, duration = 3000 }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (visible) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                onHide();
            }, duration);
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [visible, duration, onHide]);

    if (!visible) return null;

    let backgroundColor;
    let icon;
    let textColor = '#FFFFFF';

    switch (type) {
        case 'success':
            backgroundColor = '#4CAF50';
            icon = 'check-circle';
            break;
        case 'error':
            backgroundColor = '#F44336';
            icon = 'alert-circle';
            break;
        case 'warning':
            backgroundColor = '#FF9800';
            icon = 'alert';
            break;
        case 'info':
        default:
            backgroundColor = '#2196F3';
            icon = 'information';
            break;
    }

    return (
        <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOutUp.duration(200)}
            style={[styles.container, { top: insets.top + 10 }]}
        >
            <Surface style={[styles.surface, { backgroundColor }]} elevation={4}>
                <TouchableOpacity style={styles.content} onPress={onHide} activeOpacity={0.9}>
                    <Icon source={icon} size={24} color={textColor} />
                    <Text variant="bodyMedium" style={[styles.message, { color: textColor }]}>
                        {message}
                    </Text>
                </TouchableOpacity>
            </Surface>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 9999,
        alignItems: 'center',
    },
    surface: {
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    message: {
        marginLeft: 12,
        fontWeight: '600',
        flex: 1,
    },
});
