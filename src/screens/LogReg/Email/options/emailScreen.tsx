import { 
  StyleSheet, 
  Text, 
  View, 
  KeyboardAvoidingView, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native'
import React from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';

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
    <View style={{flex: 1}}>
      <TouchableOpacity onPress={goBack} style={styles.backBtn}>
        <AntDesign name="arrowleft" size={34} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>What's your email?</Text>
      <View style={styles.container}>
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
              style={{ color: "red", fontFamily: 'Satoshi-Regular', fontSize: 14, top: 10 }}
            >
              {error}
            </Text>
          )}
          <Text style={{fontFamily: 'Satoshi-Regular', fontSize: 14, top: 10 }}>You'll need to confirm this email later</Text>
          <TouchableOpacity onPress={handleNext} disabled={loading || !email} style={[styles.continueBtn, {opacity: (!email || loading) ? 0.5 : 1,}]}>
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
    fontSize: 28,
    fontFamily: 'Satoshi-Bold'
  },
  EmailForm: {
    bottom:200,
  },
  emailText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    bottom: 5,
  },
  emailInput: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#cacacaff',
    width: 380,
    height: 50,
  },
  continueBtn: {
    backgroundColor: '#000000ff',
    width: 380,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    top: 30
  },
  continueText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
})