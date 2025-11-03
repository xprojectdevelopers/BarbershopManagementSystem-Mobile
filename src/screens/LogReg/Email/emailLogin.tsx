import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  useWindowDimensions
} from 'react-native'
import React, {useState}from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../types/navigations'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotification } from '../../../contexts/notificationContext'
import NetInfo from '@react-native-community/netinfo';

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email)
}

type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

type EmailLoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoginOptions' | 'Home'
>;

export default function EmailLogin() {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle')
  const [networkError, setNetworkError] = useState('')
  const [showPassword, setShowPassword] = React.useState(false);
  const navigation = useNavigation<EmailLoginNavigationProp>()
  const {signIn, loading: authLoading} = useAuth()
  const { refreshPushToken } = useNotification()

  // Responsive helper functions
  const wp = (percentage: number) => {
    return (width * percentage) / 100;
  };

  const hp = (percentage: number) => {
    return (height * percentage) / 100;
  };

  const fs = (percentage: number) => {
    return (width * percentage) / 100;
  };

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
        const result = await signIn(email.trim(), password.trim())

        if(!result.error) {
          setLoginStatus('success')
          // Refresh push token after successful login
          try {
            await refreshPushToken()
          } catch (tokenError) {
            console.error('Error refreshing push token after login:', tokenError)
          }
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

  const styles = createStyles(wp, hp, fs);

  return (
    <View style={{flex: 1}}>
      <TouchableOpacity onPress={() => navigation.navigate('LoginOptions')} style={styles.backBtn}>
        <AntDesign name="arrow-left" size={wp(9)} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>Welcome Back</Text>
      <View style={styles.container}>
        <View style={styles.loginForm}>
          <Text style={styles.emailText}>Email</Text>
          <TextInput
            placeholder='Enter your email'
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
            <Entypo name={showPassword ? "eye-with-line" : "eye"} size={wp(6)} color="black" style={styles.eyeIcon} disabled={authLoading || loginStatus === 'loading'}/>
          </TouchableOpacity>
          {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          {networkError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{networkError}</Text>
          </View>
        ) : null}
          <TouchableOpacity disabled={authLoading || loginStatus === 'loading'} onPress={() => Linking.openURL('https://molavestreetbarbers-forgotpassword.netlify.app/')}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogin}
          disabled={authLoading || loginStatus === 'loading' || loginStatus === 'success' || !email || !password} style={getButtonStyle()}>
            {loginStatus === 'loading' ? (
              <ActivityIndicator color="white" />
            ) : loginStatus === 'success' ? (
              <AntDesign name="check" size={wp(6)} color="white" />
            ) : loginStatus === 'error' ? (
              <AntDesign name="close" size={wp(6)} color="white" />
            ) : (
              <Text style={styles.loginText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const createStyles = (wp: (p: number) => number, hp: (p: number) => number, fs: (p: number) => number) => StyleSheet.create({
  backBtn: {
    position: 'absolute',
    top: hp(6),
    left: wp(5)
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Title: {
    top: hp(15),
    textAlign: 'center',
    fontSize: fs(8),
    fontFamily: 'Satoshi-Bold'
  },
  loginForm: {
    bottom: hp(16),
    width: wp(90),
    alignItems: 'stretch',
  },
  emailText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: fs(4),
    marginBottom: hp(0.6),
  },
  emailInput: {
    padding: wp(2),
    borderRadius: 10,
    marginBottom: hp(1.2),
    width: '100%',
    height: hp(6),
    backgroundColor: '#cacacaff',
    fontFamily: 'Satoshi-Bold',
    color: '#000000ff',
    fontSize: fs(3.8),
  },
  passwordText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: fs(4),
    marginBottom: hp(0.6),
    marginTop: hp(1.2)
  },
  passwordInput: {
    padding: wp(2),
    borderRadius: 10,
    width: '100%',
    height: hp(6),
    backgroundColor: '#cacacaff',
    fontFamily: 'Satoshi-Bold',
    color: '#000000ff',
    fontSize: fs(3.8),
  },
  eyeIcon: {
    position: 'absolute',
    right: wp(5),
    bottom: hp(1.2)
  },
  forgotPasswordText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: fs(3.5),
    marginTop: hp(1.2)
  },
  loginBtn: {
    backgroundColor: 'black',
    padding: wp(2.6),
    borderRadius: 30,
    marginTop: hp(1.8),
    width: '100%',
    height: hp(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnDisabled: {
    backgroundColor: '#b0b0b0',
    padding: wp(2.6),
    borderRadius: 30,
    marginTop: hp(1.8),
    width: '100%',
    height: hp(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnSuccess: {
    backgroundColor: 'green',
    padding: wp(2.6),
    borderRadius: 30,
    marginTop: hp(1.8),
    width: '100%',
    height: hp(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnError: {
    backgroundColor: 'red',
    padding: wp(2.6),
    borderRadius: 30,
    marginTop: hp(1.8),
    width: '100%',
    height: hp(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: fs(4),
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },

  errorText: {
    color: 'red',
    marginTop: hp(0.6),
    textAlign: 'center',
    fontSize: fs(3.5),
  },
  errorContainer: {
    marginTop: hp(1.2),
    padding: wp(2.6),
    backgroundColor: '#f8d7da',
    borderRadius: 5,
  },
})
