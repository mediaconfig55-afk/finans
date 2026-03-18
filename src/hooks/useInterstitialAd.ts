import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useStore } from '../store';

// Show ad every N transactions
const AD_FREQUENCY = 3; 

const adUnitId = __DEV__ 
  ? TestIds.INTERSTITIAL 
  : 'ca-app-pub-8461408923340819/6213192424'; // Kullanıcının Geçiş Reklam Kimliği

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

export const useInterstitialAd = () => {
    const { 
        transactionsSinceLastAd, 
        incrementTransactionsSinceLastAd, 
        resetTransactionsSinceLastAd 
    } = useStore();

    useEffect(() => {
        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            // Load the next ad seamlessly after it has been closed
            interstitial.load();
        });

        // Load the ad for the first time if not already loaded or loading
        if (!interstitial.loaded) {
            interstitial.load();
        }

        return () => {
            unsubscribeClosed();
        };
    }, []);

    const showAdIfReady = () => {
        incrementTransactionsSinceLastAd();
        
        // Show ad only if we reached the frequency AND ad is loaded
        if (transactionsSinceLastAd >= AD_FREQUENCY - 1) {
            if (interstitial.loaded) {
                try {
                    interstitial.show();
                    resetTransactionsSinceLastAd();
                } catch (e) {
                    console.error('Failed to show interstitial ad', e);
                }
            } else {
                // Ad was not ready, load it for next time
                interstitial.load();
            }
        }
    };

    return { showAdIfReady, isLoaded: interstitial.loaded };
};
