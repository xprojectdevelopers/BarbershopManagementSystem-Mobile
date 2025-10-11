import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator
} from 'react-native'
import React from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

interface EmailPasswordScreenProps {
  email: string;
  setEmail: (email: string) => void
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
  email,
  setEmail,
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
    <View style={{flex: 1}}>
      <TouchableOpacity onPress={goBack} style={styles.backBtn}>
        <AntDesign name="arrow-left" size={34} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>Create an Account</Text>
      <View style={styles.container}>
        <View style={styles.RegisterForm}>
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
            <Text style={{ color: "red", fontFamily: 'Satoshi-Regular', fontSize: 14, top: 10 }}>
              {error}
            </Text>
          )}
          <Text style={{fontFamily: 'Satoshi-Regular', fontSize: 14, top: -15 }}>You'll need to confirm this email later</Text>
          <Text style={styles.passwordText}>Password</Text>
          <TextInput 
            placeholder='Enter your password'
            placeholderTextColor={'#505050ff'}
            autoCapitalize='none'
            autoCorrect={false}
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <Text style={{fontFamily: 'Satoshi-Regular', fontSize: 14, top: 195, position: 'absolute' }}>Use atleast 8 characters with letters, numbers and special character.</Text>
          <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeBtn}>
            <Entypo name={showPassword ? "eye-with-line" : "eye"} size={24} color="black" />
          </TouchableOpacity>
           <TouchableOpacity onPress={handleNext} disabled={loading || !email || !password } style={[styles.continueBtn, {opacity: (!email || !password || loading) ? 0.5 : 1,}]}>
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
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Title: {
    top: 120,
    textAlign: 'center',
    fontSize: 26,
    fontFamily: 'Satoshi-Bold'
  },
  RegisterForm: {
    bottom:150,
  },
  emailText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    bottom: 5,
  },
  emailInput: {
    padding: 15,
    borderRadius: 10,
    width: 380,
    height: 50,
    marginBottom: 25,
    backgroundColor: '#cacacaff',
  },
  passwordText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    bottom: 5,
  },
  passwordInput: {
    padding: 15,
    borderRadius: 10,
    width: 380,
    height: 50,
    backgroundColor: '#cacacaff',
  },
  eyeBtn: {
    position: 'absolute',
    right: 20,
    bottom: 65,
  },
  continueBtn: {
    backgroundColor: '#000000ff',
    padding: 15,
    borderRadius: 30,
    top: 70,
  },
  continueText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold'
  }
})
