import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigations'
import { useGoogleAuth } from '../../hooks/useGoogleAuth'
import NetInfo from '@react-native-community/netinfo'
import React, { useState } from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Define a scale factor for responsiveness
const responsiveWidth = (percent: number) => (width * percent) / 100;
const responsiveHeight = (percent: number) => (height * percent) / 100;
const responsiveFontSize = (size: number) => size * Math.min(width, height) / 375; // Base on iPhone 6/7/8 width

type LoginOptionsNavigationProp = NativeStackNavigationProp<RootStackParamList,
  'GetStarted' | 'EmailSignup' | 'LoginOptions' | 'Home' // Added 'Home' for navigation.reset
>

export default function SignUpOptions() {
  const navigation = useNavigation<LoginOptionsNavigationProp>()
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth()
  const [networkError, setNetworkError] = useState('')

  const handleGoogleSignUp = async () => {
    setNetworkError('');

    const netWorkState = await NetInfo.fetch();
    if (!netWorkState.isConnected) {
      Alert.alert('Network Error', 'No internet connection. Please check your network and try again.');
      return;
    }

    try {
      const result = await signInWithGoogle();

      if (result.success && result.data?.user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        if (result.error?.message) {
          if (result.error.message.includes('cancelled')) {
            return;
          }
          Alert.alert('Sign Up Error', result.error.message);
        } else {
          Alert.alert('Error', 'Google sign-up failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Google sign-up failed:', error);
      Alert.alert('Error', 'Google sign-up failed. Please try again.');
    }
  };

  return (
    <View style={styles.rootContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('GetStarted')} style={styles.backBtn}>
        <AntDesign name="arrow-left" size={responsiveFontSize(30)} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>Sign up to MLV ST.</Text>
      <View style={styles.container}>

        <View style={styles.loginBtnContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('EmailSignup')} style={styles.emailBtn}>
            <MaterialCommunityIcons name="email" size={responsiveFontSize(22)} color="white" style={styles.emailIcon} />
            <Text style={styles.emailText}>Sign up with Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.googleBtn, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignUp}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="black" style={styles.googleIcon} />
            ) : (
              <Image source={require('../../../assets/icon/googleLogo.png')} style={styles.googleLogo} />
            )}
            <Text style={styles.googleText}>
              {googleLoading ? 'Signing up...' : 'Sign up with Google'}
            </Text>
          </TouchableOpacity>
          {/* Removed Facebook button as it was present in styles but not in render */}
          <Text style={styles.signUpText}>
            Don't have an account?
            <TouchableOpacity onPress={() => navigation.navigate('LoginOptions')}>
              <Text style={styles.signUpText1}> Sign In</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#fff', // Assuming a white background
  },
  backBtn: {
    position: 'absolute',
    top: responsiveHeight(6), // Adjusted percentage
    left: responsiveWidth(5), // Adjusted percentage
    zIndex: 1, // Ensure button is tappable
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Title: {
    position: 'absolute', // Position title absolutely to center it within the top half
    top: responsiveHeight(15), // Adjusted percentage
    width: '100%', // Take full width to center text
    textAlign: 'center',
    fontSize: responsiveFontSize(32),
    fontFamily: 'Satoshi-Bold',
  },
  loginBtnContainer: {
    bottom: responsiveHeight(30), // Adjusted to be relative to the bottom of the container
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Allow this container to take up available space
    paddingHorizontal: responsiveWidth(5), // Add horizontal padding
    marginTop: responsiveHeight(20), // Push down from the title area
  },
  emailBtn: {
    backgroundColor: 'black',
    padding: responsiveFontSize(0),
    borderRadius: responsiveFontSize(30),
    marginBottom: responsiveHeight(1.5), // Responsive margin
    width: responsiveWidth(90), // Take 90% of screen width
    height: responsiveHeight(6), // Responsive height
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emailIcon: {
    marginRight: responsiveWidth(5), // Responsive margin
  },
  emailText: {
    fontSize: responsiveFontSize(16),
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  googleBtn: {
    backgroundColor: 'white',
    padding: responsiveFontSize(0),
    borderWidth: 1,
    borderRadius: responsiveFontSize(30),
    marginBottom: responsiveHeight(1.5),
    width: responsiveWidth(90),
    height: responsiveHeight(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleLogo: {
    width: responsiveFontSize(24),
    height: responsiveFontSize(24),
    marginRight: responsiveWidth(5),
  },
  googleIcon: { // For ActivityIndicator
    marginRight: responsiveWidth(5),
  },
  googleText: {
    fontSize: responsiveFontSize(16),
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // facebookBtn and facebookText are removed as they were not used in the render method
  signUpText: {
    marginTop: responsiveHeight(2), // Responsive margin
    fontSize: responsiveFontSize(16),
    color: 'gray',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
    flexDirection: 'row',// Adjusted to align better
    alignSelf: 'center' // Ensures the entire row is centered
  },
  signUpText1: {
    top: responsiveHeight(0.1), // Adjusted to align better
    fontSize: responsiveFontSize(16),
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  }
})