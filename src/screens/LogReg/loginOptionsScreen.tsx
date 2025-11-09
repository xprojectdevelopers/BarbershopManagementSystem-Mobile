import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions, PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import NetInfo from '@react-native-community/netinfo';
import React, { useState } from 'react';

// Icons
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// --- Responsive Scaling Constants and Functions ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reference device dimensions (e.g., iPhone 6/7/8 - 375x667, or iPhone X - 375x812)
// Using iPhone X dimensions for a more modern baseline that scales well
const RF_WIDTH_BASE = 375;
const RF_HEIGHT_BASE = 812;

// Function to scale a size horizontally based on screen width
const scale = (size: number): number => (SCREEN_WIDTH / RF_WIDTH_BASE) * size;

// Function to scale a size vertically based on screen height
const verticalScale = (size: number): number => (SCREEN_HEIGHT / RF_HEIGHT_BASE) * size;

// Function for moderate scaling (mixes original size with scaled size)
// Useful for elements like border-radius, or sizes that shouldn't scale too aggressively
const moderateScale = (size: number, factor: number = 0.5): number => size + (scale(size) - size) * factor;

// Function to get responsive font size, accounting for user's font scale preference
const getResponsiveFontSize = (size: number): number => {
  const fontScale = PixelRatio.getFontScale();
  return size / fontScale;
};
// --- End Responsive Scaling ---

type LoginOptionsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GetStarted' | 'EmailLogin' | 'SignUpOptions' | 'Home'
>;

export default function LoginOptions() {
  const navigation = useNavigation<LoginOptionsNavigationProp>();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [networkError, setNetworkError] = useState<string>('');

  const handleGoogleSignIn = async (): Promise<void> => {
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
    <View style={styles.fullScreenContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('GetStarted')} style={styles.backBtn}>
        <AntDesign name='arrow-left' size={moderateScale(34)} color="black" /> {/* Scaled icon size */}
      </TouchableOpacity>
      <Text style={styles.Title}>Login to MLV ST.</Text>
      <View style={styles.container}>
        <View style={styles.loginButtonsWrapper}> {/* Retained 'loginBtn' from original, but renamed to 'loginButtonsWrapper' to better describe its content */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('EmailLogin')} 
            style={[styles.emailBtn, googleLoading && styles.buttonDisabled]}
            disabled={googleLoading}
          >
            <MaterialCommunityIcons name="email" size={moderateScale(24)} color="white" style={{right: scale(58)}} /> {/* Scaled icon size and position */}
            <Text style={styles.emailText}>Continue with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.googleBtn, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size={moderateScale(24)} color="black" style={{right: scale(50)}} />
            ) : (
              <Image source={require('../../../assets/icon/googleLogo.png')} style={{width: moderateScale(24), height: moderateScale(24), right: scale(50)}} />
            )}
            <Text style={styles.googleText}>
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signUpTextContainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUpOptions')} disabled={googleLoading}>
              <Text style={styles.signUpText1}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: verticalScale(50), // Scaled from 50
    left: scale(20), // Scaled from 20
    zIndex: 1,
  },
  container : {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Title: {
    position: 'absolute',
    top: verticalScale(120), // Scaled from 120
    textAlign: 'center',
    fontSize: getResponsiveFontSize(32), // Scaled from 32
    fontFamily: 'Satoshi-Bold',
    width: '100%', // Added for better centering consistency
  },
  loginButtonsWrapper: { // Renamed for clarity, from 'loginBtn'
    bottom: verticalScale(130), 
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailBtn: {
    backgroundColor: 'black',
    padding: moderateScale(12), // Scaled from 12
    borderRadius: moderateScale(30), // Scaled from 30
    marginBottom: verticalScale(10), // Scaled from 10
    width: scale(350), // Scaled from 350
    maxWidth: moderateScale(350), // Ensure it doesn't get too big on large screens
    height: verticalScale(50), // Scaled from 50
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emailText: {
    fontSize: getResponsiveFontSize(16), // Scaled from 16
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  googleBtn: {
    backgroundColor: 'white',
    padding: moderateScale(12), // Scaled from 12
    borderWidth: moderateScale(1), // Scaled from 1
    borderRadius: moderateScale(30), // Scaled from 30
    marginBottom: verticalScale(10), // Scaled from 10
    width: scale(350), // Scaled from 350
    maxWidth: moderateScale(350), // Ensure it doesn't get too big on large screens
    height: verticalScale(50), // Scaled from 50
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleText: {
    fontSize: getResponsiveFontSize(16), // Scaled from 16
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // New container for the "Don't have an account? Sign Up" text
  signUpTextContainer: {
    flexDirection: 'row', // To align "Don't have an account?" and "Sign Up" horizontally
    alignItems: 'center',
    marginTop: verticalScale(15), // Added for spacing, adjust as needed
  },
  signUpText: {
    fontSize: getResponsiveFontSize(16), // Scaled from 16
    color: 'gray',
    fontFamily: 'Satoshi-Bold',
    // Removed flexDirection: 'row' from here as it belongs to the container
  },
  signUpText1: {
    // Removed 'top: 4.5' because 'flexDirection: row' on parent handles vertical alignment
    fontSize: getResponsiveFontSize(16), // Scaled from 16
    color: 'black',
    fontFamily: 'Satoshi-Bold',
    // Removed 'textAlign: 'center'' as it's not needed for inline text in a row
  }
});