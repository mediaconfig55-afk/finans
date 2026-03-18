import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import i18n from '../i18n';
import { useAppTheme } from '../hooks/useAppTheme';

interface Props {
    children: ReactNode;
    theme: ReturnType<typeof useAppTheme>;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        const { theme } = this.props;

        if (this.state.hasError) {
            return (
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
                        {i18n.t('errorOccurred')}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
                        {i18n.t('errorMessage')}
                    </Text>
                    {__DEV__ && this.state.error && (
                        <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
                            {this.state.error.toString()}
                        </Text>
                    )}
                    <Button mode="contained" onPress={this.handleReset} style={styles.button} buttonColor={theme.colors.primary} textColor={theme.colors.onPrimary}>
                        {i18n.t('retry')}
                    </Button>
                </View>
            );
        }

        return this.props.children;
    }
}

export const ErrorBoundary = (props: { children: ReactNode }) => {
    const theme = useAppTheme();
    return <ErrorBoundaryInner theme={theme}>{props.children}</ErrorBoundaryInner>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    message: {
        textAlign: 'center',
        marginBottom: 24,
    },
    error: {
        marginBottom: 16,
        textAlign: 'center',
    },
    button: {
        marginTop: 16,
    },
});
