import mobileAds from 'react-native-google-mobile-ads';

export const initAds = async () => {
    try {
        await mobileAds().initialize();
        console.log('Ads initialized natively');
    } catch (e) {
        console.error('Failed to initialize ads:', e);
    }
};
