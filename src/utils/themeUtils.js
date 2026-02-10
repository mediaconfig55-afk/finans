import { COLORS } from '../constants/colors';

export const getDynamicColor = (amount, type) => {
    const baseColor = type === 'income' ? COLORS.success : type === 'expense' ? COLORS.error : COLORS.warning;

    // Simple logic: 
    // < 100 : Base roughly (opacity 0.6)
    // 100 - 1000 : Medium (opacity 0.8)
    // > 1000 : Full brightness (opacity 1.0)

    // We can't easily change hex opacity in RN style directly without rgba, 
    // so we will return an object with opacity or a different shade if we had a palette.
    // Here we will return text shadow or glow props.

    let intensity = 0;
    if (amount < 100) intensity = 1; // Low
    else if (amount < 1000) intensity = 2; // Medium
    else intensity = 3; // High

    return {
        color: baseColor,
        textShadowColor: baseColor,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: intensity * 3, // 3, 6, or 9
        opacity: 1, // Always visible
    };
};
