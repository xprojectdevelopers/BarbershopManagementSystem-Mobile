import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigations'

type GetStartedNavigationProp = NativeStackNavigationProp<RootStackParamList,
  'LoginOptions' | 'SignUpOptions'
>

export default function GetStarted() {

  const navigation = useNavigation<GetStartedNavigationProp>()

  return (
    <View style={styles.container}>
      <View style={styles.logRegButton}>
        <TouchableOpacity onPress={() => navigation.navigate('LoginOptions')} style={styles.loginBtn}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpOptions')} style={styles.signUpBtn}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logRegButton: {
    top: 300,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  loginBtn: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 30,
    marginBottom: 10,
    width: 350,
    height: 50,
  },
  loginText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  signUpBtn: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 30,
    marginBottom: 10,
    width: 350,
    height: 50,
  },
  signUpText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },

})
