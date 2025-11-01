import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Introduction from '../../components/Carousel/Introduction'; // Assuming this component is handled separately for responsiveness

// Get screen dimensions directly
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Responsive Scaling Constants and Functions ---
// Reference device dimensions (e.g., iPhone 6/7/8) for scaling
const RF_WIDTH_BASE = 375;
const RF_HEIGHT_BASE = 812; // A common reference height for modern phones (e.g., iPhone X)

// Function to scale a size horizontally based on screen width
const scale = (size: number) => (SCREEN_WIDTH / RF_WIDTH_BASE) * size;

// Function to scale a size vertically based on screen height
const verticalScale = (size: number) => (SCREEN_HEIGHT / RF_HEIGHT_BASE) * size;

// Function for moderate scaling (mixes original size with scaled size)
// Useful for elements like border-radius, or sizes that shouldn't scale too aggressively
const moderateScale = (size: number, factor: number = 0.5) => size + (scale(size) - size) * factor;

// Function to get responsive font size, accounting for user's font scale preference
const getResponsiveFontSize = (size: number) => {
  const fontScale = PixelRatio.getFontScale();
  return size / fontScale;
};
// --- End Responsive Scaling ---

type GetStartedNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoginOptions' | 'SignUpOptions'
>;

export default function GetStarted() {
  const navigation = useNavigation<GetStartedNavigationProp>();
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(require('../../../assets/img/bg.mp4'));

  player.loop = true;
  player.muted = true;
  player.play();

  // Calculate the bottom position for the buttons responsively
  // The original was `120 + insets.bottom`. We scale the `120`.
  const responsiveButtonBottom = verticalScale(120) + insets.bottom;

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Brightness Filter Overlay */}
      <View style={[StyleSheet.absoluteFill, styles.brightnessOverlay]} />
      
      <Introduction /> {/* Ensure this component is also responsive internally */}
      
      {/* Buttons Overlay */}
      <View style={[styles.logRegButton, { bottom: responsiveButtonBottom }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('LoginOptions')}
          style={styles.loginBtn}
        >
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUpOptions')}
          style={styles.signUpBtn}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brightnessOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logRegButton: {
    position: 'absolute',
    width: '100%', // Use 100% width to ensure centering works well
    alignItems: 'center',
    // 'bottom' is set dynamically in the component
  },
  loginBtn: {
    backgroundColor: 'white',
    paddingVertical: verticalScale(12), // Scale vertical padding
    borderRadius: moderateScale(30), // Scale border radius
    marginBottom: verticalScale(15), // Scale vertical margin
    width: '85%', // Use percentage width for flexibility
    maxWidth: moderateScale(320), // Set a max width for larger screens (e.g., tablets)
    height: verticalScale(50), // Scale height
    justifyContent: 'center',
  },
  loginText: {
    fontSize: getResponsiveFontSize(16), // Scale font size
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  signUpBtn: {
    borderWidth: moderateScale(2), // Scale border width
    borderColor: 'white',
    borderRadius: moderateScale(30), // Scale border radius
    width: '85%', // Use percentage width
    maxWidth: moderateScale(320), // Set a max width
    height: verticalScale(50), // Scale height
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: getResponsiveFontSize(16), // Scale font size
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
});