import React from 'react'
import { useFonts } from 'expo-font'
import {NavigationContainer} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParamList } from './src/types/navigations'
import { AuthProvider } from './src/contexts/AuthContext'
import { NotificationProvider } from './src/contexts/notificationContext'
import * as Notification from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'

//Screens
import GetStarted from './src/screens/startApp/getStarted'
import Home from './src/screens/Home/homeScreen'
import LoginOptions from './src/screens/LogReg/loginOptionsScreen'
import SignUpOptions from './src/screens/LogReg/signUpOptionsScreen'
import EmailLogin from './src/screens/LogReg/Email/emailLogin'
import EmailSignup from './src/screens/LogReg/Email/emailSignup'
// import DisplayName from './src/screens/LogReg/Email/options/displayName'
// import UserPassword from './src/screens/LogReg/Email/options/userPassword'
// import ContactNumber from './src/screens/LogReg/Email/options/contactNum'
import Appointment from './src/screens/Appointment/appointmentScreen'
import SplashScreen from './src/screens/startApp/splashScreen'
import PushNotifScreen from './src/screens/pushNotifScreen'


const Stack = createNativeStackNavigator<RootStackParamList>()

const headerOption = {
  headerShown: false
}

Notification.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


function App() {
   const [fontsLoaded] = useFonts({
    'Satoshi-Bold': require('./assets/fonts/Satoshi-Bold.otf'),
    'Satoshi-Regular': require('./assets/fonts/Satoshi-Regular.otf'),
    'Oswald-Bold': require('./assets/fonts/Oswald-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Show nothing while fonts load
  }
  return (
      <AuthProvider>
        <NotificationProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor="#ffffff" />
            <Stack.Navigator initialRouteName="SplashScreen">
              <Stack.Screen name="GetStarted" component={GetStarted} options={headerOption} />
              <Stack.Screen name="Home" component={Home} options={headerOption} />
              <Stack.Screen name="LoginOptions" component={LoginOptions} options={headerOption} />
              <Stack.Screen name="SignUpOptions" component={SignUpOptions} options={headerOption} />
              <Stack.Screen name="EmailLogin" component={EmailLogin} options={headerOption} />
              <Stack.Screen name="EmailSignup" component={EmailSignup} options={headerOption} />
              {/* <Stack.Screen name="DisplayName" component={DisplayName} options={headerOption} />
              <Stack.Screen name="UserPassword" component={UserPassword} options={headerOption} />
              <Stack.Screen name="ContactNumber" component={ContactNumber} options={headerOption} /> */}
              <Stack.Screen name="Appointment" component={Appointment} options={headerOption} />
              <Stack.Screen name="SplashScreen" component={SplashScreen} options={headerOption} />
              <Stack.Screen name="PushNotifScreen" component={PushNotifScreen} options={headerOption} />
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationProvider>
      </AuthProvider>
  );
}

export default App