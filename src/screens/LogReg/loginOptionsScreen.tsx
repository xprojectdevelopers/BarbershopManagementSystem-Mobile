import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigations'

import React from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type LoginOptionsNavigationProp = NativeStackNavigationProp<RootStackParamList,
  'GetStarted' | 'EmailLogin' | 'SignUpOptions'
>

export default function LoginOptions() {
  const navigation = useNavigation<LoginOptionsNavigationProp>()
  return (
    <View style={{flex: 1}}>
      <TouchableOpacity onPress={() => navigation.navigate('GetStarted')} style={styles.backBtn}>
        <AntDesign name="arrowleft" size={34} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>Login to StreetCut</Text>
      <View style={styles.container}>
        <View style={styles.loginBtn}>
          <TouchableOpacity onPress={() => navigation.navigate('EmailLogin')} style={styles.emailBtn}>
            <MaterialCommunityIcons name="email" size={24} color="white" style={{right: 58}} />
            <Text style={styles.emailText}>Continue with Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.googleBtn}>
            <Image source={require('../../../assets/icon/googleLogo.png')} style={{width: 24, height: 24, right: 50}} />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>
          <Text style={styles.signUpText}>
            Don't have an account?
            <TouchableOpacity onPress={() => navigation.navigate('SignUpOptions')}>
              <Text style={styles.signUpText1}> Sign Up</Text>
            </TouchableOpacity>
          </Text>
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
  container : {
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
  loginBtn: {
    bottom: 170,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emailBtn: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 30,
    marginBottom: 10,
    width: 350,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emailText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  googleBtn: {
    backgroundColor: 'white',
    padding: 12,
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 10,
    width: 350,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  facebookBtn: {
    backgroundColor: 'white',
    padding: 10,
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 10,
    width: 350,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  facebookText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  signUpText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
    flexDirection: 'row'
  },
  signUpText1: {
    top: 4.5,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  }
})