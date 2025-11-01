import { StyleSheet, Text, View, Image, Animated, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigations'
import { useAuth } from '../../contexts/AuthContext'

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen' | 'Home'>

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>()
  const { loading, user } = useAuth()
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLoading(true)
    })
  }, [scaleAnim, opacityAnim])

  useEffect(() => {
    if (!loading && showLoading) {
      const timer = setTimeout(() => {
        if (user) {
          navigation.navigate({ name: 'Home', params: {} })
        } else {
          navigation.navigate({ name: 'GetStarted', params: undefined })
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loading, showLoading, user, navigation])

  return (
    <View style={styles.container}>
      <Animated.Image
        style={[{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        source={require('../../../assets/img/Mobile Logo.png')}
      />
      {showLoading && (
        <ActivityIndicator size="large" color="#333" style={styles.loadingIndicator} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // icon: {
  //   width: 250,
  //   height: 250,
  // },
  loadingIndicator: {
    marginTop: 20,
  }
})
