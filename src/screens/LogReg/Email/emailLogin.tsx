import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator } from 'react-native'
import React, {useState}from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../types/navigations'
import { useAuth } from '../../../contexts/AuthContext'
import NetInfo from '@react-native-community/netinfo';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email)
}

type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

type EmailLoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoginOptions' | 'Home'
>;

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

export default function EmailLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle')
  const [networkError, setNetworkError] = useState('')
  const [showPassword, setShowPassword] = React.useState(false);
  const navigation = useNavigation<EmailLoginNavigationProp>()
  const {signIn, loading: authLoading} = useAuth()

  const handleLogin = async () => {
    setLoginStatus('loading')
    setNetworkError('')
    setEmailError('')

    if(!email.trim()) {
      setEmailError('Please enter your Email')
      setLoginStatus('idle')
      return
    }

    if(!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      setLoginStatus('idle')
      return
    }

    if(!password.trim()) {
      setPasswordError('Please enter your password')
      setLoginStatus('idle')
      return
    }

    const netWorkState = await NetInfo.fetch()
      if(!netWorkState.isConnected) {
        setNetworkError('No internet connection. Please check your network and try again.')
        setLoginStatus('error');
        setTimeout(() => setLoginStatus('idle'), 3000)
        return
      }

      try{
        if(__DEV__) {
          console.log('Attempting login with:', {email: email.trim()})
        }
        const result = await signIn(email, password)

        if(result.data) {
          setLoginStatus('success')
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            })
          }, 1500)
        } else {
          if(result.error?.message) {
            if(result.error.message.includes('Invalid login credentials')) {
              setNetworkError('Invalid email or password. Please try again.')
            } else if (result.error.message.includes('Email not confirmed')) {
              setNetworkError('Please verify your email before logging in.')  
            } else if (
              result.error.message.includes('Network Error') ||
              result.error.message.includes('Network request failed')
            ) {
              setNetworkError('Network Error. Please check your internet connection and try again.')
            } else{
              setNetworkError(result.error.message)
            }
          } else {
            setNetworkError('Login failed. Please try again.')
          }
          setLoginStatus('error')
          setTimeout(() => setLoginStatus('idle'), 3000)
        }
      } catch (error: any) {
        console.error('Login failed:', error)
        if (error.message?.includes('Network')) {
          setNetworkError('Network Error. Please check your internet connection and try again.')
        } else {
          setNetworkError('Login failed. Please try again.')
        }
        setLoginStatus('error')
        setTimeout(() => setLoginStatus('idle'), 3000)
      }
  }

  const getButtonStyle = () => {
    if (loginStatus === 'success') return styles.loginBtnSuccess
    if (loginStatus === 'error') return styles.loginBtnError
    if (!email || !password) return styles.loginBtnDisabled
    return styles.loginBtn
  }

  return (
    <View style={{flex: 1}}>
      <TouchableOpacity onPress={() => navigation.navigate('LoginOptions')} style={styles.backBtn}>
        <AntDesign name="arrowleft" size={34} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>Welcome Back</Text>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View style={styles.loginForm}>
          <Text style={styles.emailText}>Email or username</Text>
          <TextInput 
            placeholder='Enter email or username'
            placeholderTextColor={'#505050ff'}
            autoCapitalize='none'
            autoCorrect={false}
            keyboardType='email-address'
            style={styles.emailInput}
            value={email}
            onChangeText={setEmail}
            editable={!authLoading && loginStatus !== 'loading'}
          />
          {emailError && <Text style={styles.errorText} >{emailError}</Text>}
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
            editable={!authLoading && loginStatus !== 'loading'}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Entypo name={showPassword ? "eye-with-line" : "eye"} size={24} color="black" style={styles.eyeIcon} disabled={authLoading || loginStatus === 'loading'}/>
          </TouchableOpacity>
          {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          {networkError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{networkError}</Text>
          </View>
        ) : null}
          <TouchableOpacity disabled={authLoading || loginStatus === 'loading'}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogin}
          disabled={authLoading || loginStatus === 'loading' || loginStatus === 'success' || !email || !password} style={getButtonStyle()}>
            {loginStatus === 'loading' ? (
              <ActivityIndicator color="white" />
            ) : loginStatus === 'success' ? (
              <AntDesign name="check" size={24} color="white" />
            ) : loginStatus === 'error' ? (
              <AntDesign name="close" size={24} color="white" />
            ) : (
              <Text style={styles.loginText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    fontSize: 32,
    fontFamily: 'Satoshi-Bold'
  },
  loginForm: {
    bottom:130,
  },
  emailText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    bottom: 5,
    
  },
  emailInput: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: 350,
    height: 50,
    backgroundColor: '#cacacaff',
    fontFamily: 'Satoshi-Bold'
  },
  passwordText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    bottom: 5,
    marginTop: 10
  },
  passwordInput: {
    padding: 15,
    borderRadius: 10,
    width: 350,
    height: 50,
    backgroundColor: '#cacacaff',
    fontFamily: 'Satoshi-Bold'
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    bottom: 13
  },
  forgotPasswordText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    marginTop: 10
  },
  loginBtn: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 30,
    top: 15,
    width: 350,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnDisabled: {
    backgroundColor: '#b0b0b0',
    padding: 10,
    borderRadius: 30,
    top: 15,
    width: 350,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnSuccess: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 30,
    top: 15,
    width: 350,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnError: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 30,
    top: 15,
    width: 350,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },

  errorText: {
    color: 'red',
    marginTop: 5,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 5,
  },
})
