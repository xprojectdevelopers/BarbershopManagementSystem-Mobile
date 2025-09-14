import {useFonts} from 'expo-font'
import * as SplashScreen  from 'expo-splash-screen'
import { useCallback } from 'react'

export const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    'Satoshi-Bold': require('../../assets/fonts/Satoshi-Bold.otf'),
    'Satoshi-Regular': require('../../assets/fonts/Satoshi-Regular.otf')
  })

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  return { fontsLoaded, onLayoutRootView }
}