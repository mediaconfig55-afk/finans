import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface IntroAnimationProps {
    onFinish: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onFinish }) => {
    const logoScale = useSharedValue(0);
    const logoRotate = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(50);
    const circleScale = useSharedValue(0);
    const gradientOpacity = useSharedValue(0);

    useEffect(() => {
        // Gradient fade in
        gradientOpacity.value = withTiming(1, { duration: 800 });

        // Circle background animation
        circleScale.value = withDelay(
            200,
            withSpring(1, {
                damping: 8,
                stiffness: 100,
            })
        );

        // Logo animation with rotation and scale
        logoOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
        logoScale.value = withDelay(
            400,
            withSequence(
                withSpring(1.2, { damping: 6, stiffness: 100 }),
                withSpring(1, { damping: 8, stiffness: 100 })
            )
        );
        logoRotate.value = withDelay(
            400,
            withTiming(360, {
                duration: 1000,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            })
        );

        // Text animation
        textOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
        textTranslateY.value = withDelay(
            1000,
            withSpring(0, {
                damping: 10,
                stiffness: 100,
            })
        );

        // Finish animation
        const timer = setTimeout(() => {
            runOnJS(onFinish)();
        }, 2800);

        return () => clearTimeout(timer);
    }, []);

    const animatedGradientStyle = useAnimatedStyle(() => ({
        opacity: gradientOpacity.value,
    }));

    const animatedCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale.value }],
    }));

    const animatedLogoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [
            { scale: logoScale.value },
            { rotate: `${logoRotate.value}deg` },
        ],
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedGradientStyle]}>
                <LinearGradient
                    colors={['#000000', '#1C1C1E', '#331B00']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            <Animated.View style={[styles.circle, animatedCircleStyle]}>
                <View style={styles.circleInner} />
            </Animated.View>

            <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
                <View style={styles.logo}>
                    <Text style={styles.logoText}>₺</Text>
                </View>
            </Animated.View>

            <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                <Text style={styles.appName}>FİNANSIM</Text>
                <Text style={styles.tagline}>Premium Finans Takibi</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    circle: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: (width * 1.5) / 2,
        backgroundColor: 'rgba(255, 107, 0, 0.05)', // Orange faint glow
    },
    circleInner: {
        width: '100%',
        height: '100%',
        borderRadius: (width * 1.5) / 2,
        borderWidth: 2,
        borderColor: 'rgba(255, 107, 0, 0.1)',
    },
    logoContainer: {
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1C1C1E', // Matte Dark
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF6B00', // Orange border
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 25,
        elevation: 10,
    },
    logoText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#FF6B00', // Orange text
    },
    textContainer: {
        alignItems: 'center',
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 14,
        color: '#FF6B00',
        letterSpacing: 1,
        opacity: 0.8,
        textTransform: 'uppercase',
    },
});
