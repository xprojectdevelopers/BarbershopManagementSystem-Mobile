import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigations'
import { useGoogleAuth } from '../../hooks/useGoogleAuth' // Add this import
import NetInfo from '@react-native-community/netinfo' // Add this import if you don't have it
import React, { useState } from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type LoginOptionsNavigationProp = NativeStackNavigationProp<RootStackParamList,
  'GetStarted' | 'EmailLogin' | 'SignUpOptions' | 'Home' // Add 'Home' to navigate after Google login
>

export default function LoginOptions() {
  const navigation = useNavigation<LoginOptionsNavigationProp>()
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth() // Add this hook
  const [networkError, setNetworkError] = useState('') // Add error state

  // Add Google sign-in handler
  const handleGoogleSignIn = async () => {
    setNetworkError('');
    
    // Check network connection
    const netWorkState = await NetInfo.fetch();
    if (!netWorkState.isConnected) {
      Alert.alert('Network Error', 'No internet connection. Please check your network and try again.');
      return;
    }

    try {
      const result = await signInWithGoogle();
      
      if (result.success && result.data?.user) {
        // Successfully signed in, navigate to Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        // Handle errors
        if (result.error?.message) {
          if (result.error.message.includes('cancelled')) {
            // User cancelled, don't show error
            return;
          }
          Alert.alert('Sign In Error', result.error.message);
        } else {
          Alert.alert('Error', 'Google sign-in failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <View style={{flex: 1}}>
      <TouchableOpacity onPress={() => navigation.navigate('GetStarted')} style={styles.backBtn}>
        <AntDesign name='arrow-left' size={34} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>Login to MLV ST.</Text>
      <View style={styles.container}>
        <View style={styles.loginBtn}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EmailLogin')} 
            style={[styles.emailBtn, googleLoading && styles.buttonDisabled]}
            disabled={googleLoading}
          >
            <MaterialCommunityIcons name="email" size={24} color="white" style={{right: 58}} />
            <Text style={styles.emailText}>Continue with Email</Text>
          </TouchableOpacity>

          {/* Updated Google Button with functionality */}
          <TouchableOpacity
            style={[styles.googleBtn, (googleLoading || true) && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || true}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="black" style={{right: 50}} />
            ) : (
              <Image source={require('../../../assets/icon/googleLogo.png')} style={{width: 24, height: 24, right: 50}} />
            )}
            <Text style={styles.googleText}>
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.signUpText}>
            Don't have an account?
            <TouchableOpacity onPress={() => navigation.navigate('SignUpOptions')} disabled={googleLoading}>
              <Text style={styles.signUpText1}> Sign Up</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20
  },
  container : {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Title: {
    top: 120,
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'Satoshi-Medium'
  },
  loginBtn: {
    bottom: 170,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emailBtn: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 30,
    marginBottom: 10,
    width: 350,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emailText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  googleBtn: {
    backgroundColor: 'white',
    padding: 12,
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 10,
    width: 350,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  signUpText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
    flexDirection: 'row'
  },
  signUpText1: {
    top: 4.5,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  }
})