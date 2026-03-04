import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import i18n from '../i18n';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text variant="headlineMedium" style={styles.title}>
                        {i18n.t('errorOccurred')}
                    </Text>
                    <Text variant="bodyMedium" style={styles.message}>
                        {i18n.t('errorMessage')}
                    </Text>
                    {__DEV__ && this.state.error && (
                        <Text variant="bodySmall" style={styles.error}>
                            {this.state.error.toString()}
                        </Text>
                    )}
                    <Button mode="contained" onPress={this.handleReset} style={styles.button}>
                        {i18n.t('retry')}
                    </Button>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#0A0E17',
    },
    title: {
        marginBottom: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    message: {
        textAlign: 'center',
        marginBottom: 24,
        color: '#B0BEC5',
    },
    error: {
        color: '#FF1744',
        marginBottom: 16,
        textAlign: 'center',
    },
    button: {
        marginTop: 16,
    },
});
