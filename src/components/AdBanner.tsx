import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Use test ID in development
const adUnitId = __DEV__ 
  ? TestIds.BANNER
  : 'ca-app-pub-8461408923340819/5275515277'; // Kullanıcının verdiği Banner Kimliği

export const AdBanner = () => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 4 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // GDPR/CCPA uyumluluğu için
        }}
        onAdFailedToLoad={(error) => {
          console.error('BannerAd failed to load:', error);
        }}
      />
    </View>
  );
};
