import { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

export function useSplashScreen() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        
        // Pre-load fonts, make any API calls you need to do here
        // await Font.loadAsync({
        //   'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        // });
        
        // Artificially delay for a minimum splash time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const hideSplash = async () => {
    await SplashScreen.hideAsync();
  };

  return { isReady, hideSplash };
} 