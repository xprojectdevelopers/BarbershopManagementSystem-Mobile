import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native'
import React from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Define your responsive functions
const responsiveWidth = (percent: number) => (width * percent) / 100;
const responsiveHeight = (percent: number) => (height * percent) / 100;
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
  displayNameError?: string // This is for display name errors
  passwordError?: string // This is for password errors
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
  displayNameError, // display name error
  passwordError // password error
}: EmailPasswordScreenProps) {
  
  // Check if form is valid for button enable/disable
  const isFormValid = displayName.trim() &&
                     password.trim() &&
                     password.length >= 8 &&
                     !displayNameError &&
                     !passwordError;

  return (
    <View style={styles.rootContainer}>
      <TouchableOpacity onPress={goBack} style={styles.backBtn}>
        <AntDesign name="arrow-left" size={responsiveFontSize(34)} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>Create an Account</Text>
      <View style={styles.container}>
        <View style={styles.RegisterForm}>
          <Text style={styles.labelText}>Display Name</Text>
          <TextInput
            placeholder='Enter your display name'
            placeholderTextColor={'#505050ff'}
            autoCapitalize='words'
            autoCorrect={false}
            style={[styles.inputField, {borderColor: displayNameError ? "#ef4444" : "#e5e7eb"}]}
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading}
          />
          {displayNameError && (
            <Text style={styles.errorText}>
              {displayNameError}
            </Text>
          )}
          <Text style={styles.displayNameInfoText}>This is the name that will appear on your profile.</Text>
          
          <Text style={styles.labelText}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder='Enter your password'
              placeholderTextColor={'#505050ff'}
              autoCapitalize='none'
              autoCorrect={false}
              style={[styles.inputField, styles.passwordInputField, {borderColor: passwordError ? "#ef4444" : "#e5e7eb"}]}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeBtn}>
              <Entypo name={showPassword ? "eye-with-line" : "eye"} size={responsiveFontSize(24)} color="black" />
            </TouchableOpacity>
          </View>
          {passwordError && (
            <Text style={styles.errorText}>
              {passwordError}
            </Text>
          )}
          <Text style={styles.passwordInfoText}>Use at least 8 characters with letters, numbers and special character.</Text>
           
          <TouchableOpacity 
            onPress={handleNext} 
            disabled={loading || !isFormValid} 
            style={[
              styles.continueBtn, 
              {opacity: (loading || !isFormValid) ? 0.5 : 1}
            ]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.continueText}>
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
    fontSize: responsiveFontSize(26),
    fontFamily: 'Satoshi-Bold'
  },
  RegisterForm: {
    marginTop: -responsiveHeight(15),
    width: responsiveWidth(90),
    alignItems: 'flex-start',
  },
  labelText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: responsiveFontSize(16),
    marginBottom: responsiveHeight(1),
  },
  inputField: {
    padding: responsiveFontSize(15 * 0.7),
    borderRadius: 10,
    width: '100%',
    height: responsiveHeight(6),
    backgroundColor: '#cacacaff',
    fontSize: responsiveFontSize(14),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  displayNameInfoText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: responsiveFontSize(14),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(3),
  },
  passwordInputField: {
    marginBottom: responsiveHeight(1),
  },
  passwordInfoText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: responsiveFontSize(14),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(4),
  },
  errorText: {
    color: "#ef4444",
    fontFamily: 'Satoshi-Regular', 
    fontSize: responsiveFontSize(14), 
    marginTop: responsiveHeight(1),
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute',
    right: responsiveWidth(3),
    top: '40%',
    transform: [{ translateY: -responsiveFontSize(12) }],
  },
  continueBtn: {
    backgroundColor: '#000000ff',
    padding: responsiveFontSize(15 * 0.7),
    borderRadius: 30,
    width: '100%',
    height: responsiveHeight(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: 'white',
    textAlign: 'center',
    fontSize: responsiveFontSize(15),
    bottom: responsiveHeight(0.2),
    fontFamily: 'Satoshi-Bold'
  }
})