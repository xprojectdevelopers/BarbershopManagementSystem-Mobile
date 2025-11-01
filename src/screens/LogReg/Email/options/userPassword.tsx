import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Dimensions, // Import Dimensions
  Platform // Import Platform
} from 'react-native'
import React from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Define your responsive functions (copied from your example)
const responsiveWidth = (percent: number) => (width * percent) / 100;
const responsiveHeight = (percent: number) => (height * percent) / 100;
// Base on iPhone 6/7/8 width (375)
const responsiveFontSize = (size: number) => size * Math.min(width, height) / 375; 

interface EmailPasswordScreenProps {
  displayName: string;
  setDisplayName: (displayName: string) => void
  password: string;
  setPassword: (password: string) => void
  showPassword: boolean
  toggleShowPassword: () => void
  handleNext: () => void
  goBack: () => void
  loading: boolean
  error?: string
}

export default function UserPassword({
  displayName,
  setDisplayName,
  password,
  setPassword,
  showPassword,
  toggleShowPassword,
  handleNext,
  goBack,
  loading,
  error
}: EmailPasswordScreenProps) {
  
  return (
    <View style={styles.rootContainer}>
      <TouchableOpacity onPress={goBack} style={styles.backBtn}>
        <AntDesign name="arrow-left" size={responsiveFontSize(34)} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>Create an Account</Text>
      <View style={styles.container}>
        <View style={styles.RegisterForm}>
          <Text style={styles.labelText}>Display Name</Text> {/* Changed to labelText for consistency */}
          <TextInput
            placeholder='Enter your display name'
            placeholderTextColor={'#505050ff'}
            autoCapitalize='words'
            autoCorrect={false}
            style={[styles.inputField, {borderColor: error ? "#ef4444" : "#e5e7eb"}]}
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading}
          />
          {error && (
            <Text style={styles.errorText}>
              {error}
            </Text>
          )}
          <Text style={styles.displayNameInfoText}>This will be your public name</Text>
          
          <Text style={styles.labelText}>Password</Text> {/* Changed to labelText */}
          <TextInput 
            placeholder='Enter your password'
            placeholderTextColor={'#505050ff'}
            autoCapitalize='none'
            autoCorrect={false}
            style={[styles.inputField, styles.passwordInputField]} // Re-used inputField, added specific override
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <Text style={styles.passwordInfoText}>Use at least 8 characters with letters, numbers and special character.</Text>
          <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeBtn}>
            <Entypo name={showPassword ? "eye-with-line" : "eye"} size={responsiveFontSize(24)} color="black" />
          </TouchableOpacity>
           <TouchableOpacity onPress={handleNext} disabled={loading || !displayName || !password } style={[styles.continueBtn, {opacity: (!displayName || !password || loading) ? 0.5 : 1,}]}>
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
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? responsiveHeight(6) : responsiveHeight(4),
    left: responsiveWidth(5),
    zIndex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Title: {
    position: 'absolute',
    top: responsiveHeight(15),
    width: '100%',
    textAlign: 'center',
    fontSize: responsiveFontSize(26), // Original size: 26
    fontFamily: 'Satoshi-Bold'
  },
  RegisterForm: {
    marginTop: -responsiveHeight(15), // Adjusted to push up from center
    width: responsiveWidth(90),
    alignItems: 'flex-start', // Align text inputs and labels to the left
  },
  labelText: { // Combined emailText and passwordText
    fontFamily: 'Satoshi-Bold',
    fontSize: responsiveFontSize(16),
    marginBottom: responsiveHeight(1), // Consistent spacing
  },
  inputField: { // Combined emailInput and passwordInput base styles
    padding: responsiveFontSize(15 * 0.7), // Scaled padding
    borderRadius: 10,
    width: '100%',
    height: responsiveHeight(6),
    backgroundColor: '#cacacaff',
    fontSize: responsiveFontSize(14),
    borderWidth: 1, // Add borderWidth for consistency
    borderColor: '#e5e7eb', // Default border color
  },
  displayNameInfoText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: responsiveFontSize(14),
    marginTop: responsiveHeight(1), // Consistent spacing
    marginBottom: responsiveHeight(3), // Increased margin for spacing between inputs
  },
  passwordInputField: {
    marginBottom: responsiveHeight(1), // Small margin before info text
  },
  passwordInfoText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: responsiveFontSize(14),
    marginTop: responsiveHeight(1), // Consistent spacing
    marginBottom: responsiveHeight(4), // Space before continue button
  },
  errorText: {
    color: "red", 
    fontFamily: 'Satoshi-Regular', 
    fontSize: responsiveFontSize(14), 
    marginTop: responsiveHeight(1),
  },
  eyeBtn: {
    position: 'absolute',
    right: responsiveWidth(5), // Position relative to form width
    top: responsiveHeight(21.5), // Adjust relative to password input position
  },
  continueBtn: {
    backgroundColor: '#000000ff',
    padding: responsiveFontSize(15 * 0.7), // Scale padding
    borderRadius: 30,
    width: '100%',
    height: responsiveHeight(6),
    alignItems: 'center',
    justifyContent: 'center',
    // Removed 'top: 70' as marginTop handles spacing
  },
  continueText: {
    color: 'white',
    textAlign: 'center',
    fontSize: responsiveFontSize(15),
    bottom: responsiveHeight(0.2),
    fontFamily: 'Satoshi-Bold'
  }
})