export const useInterstitialAd = () => {
    const showAdIfReady = () => {
        console.log('[useInterstitialAd Mock] showAdIfReady called on Web');
    };

    return { showAdIfReady, isLoaded: true };
};
