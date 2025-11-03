import { 
  StyleSheet, 
  Text, 
  View, 
  KeyboardAvoidingView, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions, // Import Dimensions
  Platform // Import Platform for iOS/Android specific adjustments
} from 'react-native'
import React from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Define your responsive functions
const responsiveWidth = (percent: number) => (width * percent) / 100;
const responsiveHeight = (percent: number) => (height * percent) / 100;
// Base on iPhone 6/7/8 width (375)
const responsiveFontSize = (size: number) => size * Math.min(width, height) / 375; 

type Screen = 'EmailScreen' | 'UserPassword' | 'ContactNumber'

interface EmailScreenProps {
  email: string
  setEmail: (email: string) => void
  handleNext: () => void
  goBack: () => void
  setCurrentScreen: (screen: Screen) => void
  loading: boolean
  error: string
}

export default function EmailScreen({
  email,
  setEmail,
  handleNext,
  goBack,
  loading,
  error
}: EmailScreenProps) {

  return (
    <View style={styles.rootContainer}> {/* Use rootContainer for full screen */}
      <TouchableOpacity onPress={goBack} style={styles.backBtn}>
        <AntDesign name="arrow-left" size={responsiveFontSize(34)} color="black" /> 
      </TouchableOpacity>
      <Text style={styles.Title}>What's your email?</Text>
      <View  
        style={styles.keyboardAvoidingContainer} // New style for KeyboardAvoidingView
      >
        <View style={styles.EmailForm}>
          <Text style={styles.emailText}>Email</Text>
          <TextInput 
            placeholder='Enter your email'
            placeholderTextColor={'#505050ff'}
            autoCapitalize='none'
            autoCorrect={false}
            style={[styles.emailInput, {borderColor: error ? "#ef4444" : "#e5e7eb"}]}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          {error && (
            <Text
              style={styles.errorText}
            >
              {error}
            </Text>
          )}
          <Text style={styles.confirmationText}>This email verifies your MLV ST account</Text>
          <TouchableOpacity 
            onPress={handleNext} 
            disabled={loading || !email} 
            style={[styles.continueBtn, {opacity: (!email || loading) ? 0.5 : 1,}]}
          >
           {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={styles.continueText}
            >
              Next
            </Text>
          )}
          </TouchableOpacity> 
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#fff', // Assuming a white background for consistency
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? responsiveHeight(6) : responsiveHeight(4), // Adjusted for iOS notch
    left: responsiveWidth(5), 
    zIndex: 1, // Ensure button is tappable
  },
  keyboardAvoidingContainer: { // Added a specific style for the KeyboardAvoidingView
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Title: {
    position: 'absolute', // Position title absolutely to center it within the top half
    top: responsiveHeight(15), 
    width: '100%', 
    textAlign: 'center',
    fontSize: responsiveFontSize(28), // Original size: 28
    fontFamily: 'Satoshi-Bold'
  },
  EmailForm: {
    marginTop: -responsiveHeight(37), // Push it up to simulate original 'bottom: 200' effect
    width: responsiveWidth(90), // Make form width responsive
    alignItems: 'flex-start', // Align children to the start for text
  },
  emailText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: responsiveFontSize(16), // Original size: 16
    marginBottom: responsiveHeight(1), // Use marginBottom instead of top/bottom
  },
  emailInput: {
    padding: responsiveFontSize(15 * 0.7), // Scale padding based on font size
    borderRadius: 10,
    backgroundColor: '#cacacaff',
    width: '100%', // Take full width of parent (EmailForm)
    height: responsiveHeight(6), // Scale height
    fontSize: responsiveFontSize(16), // Adjust font size inside input
    // The borderColor will be overridden by the prop, so keep it for default
    borderColor: '#e5e7eb', 
    borderWidth: 1, // Add borderWidth for consistency with error state
  },
  errorText: {
    color: "red", 
    fontFamily: 'Satoshi-Regular', 
    fontSize: responsiveFontSize(14), // Original size: 14
    marginTop: responsiveHeight(1.2), // Use marginTop
  },
  confirmationText: {
    fontFamily: "Satoshi-Regular", 
    fontSize: responsiveFontSize(14), // Original size: 14
    marginTop: responsiveHeight(1.2), // Use marginTop
  },
  continueBtn: {
    backgroundColor: '#000000ff',
    width: '100%', // Take full width of parent (EmailForm)
    height: responsiveHeight(6), // Scale height
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    marginTop: responsiveHeight(4), // Use marginTop
  },
  continueText: {
    fontSize: responsiveFontSize(16), // Original size: 16
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
})