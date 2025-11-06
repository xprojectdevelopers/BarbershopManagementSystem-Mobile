import { Text, View, Alert, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../types/navigations'
import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase/client';
import { registerForPushNotificationsAsync } from '../../../utils/registerForPushNotificationAsync';

//Separated Screens
import EmailScreen from './options/emailScreen'
import UserPassword from './options/userPassword'
import ContactNumber from './options/contactNum'

type Screen = 'EmailScreen' | 'UserPassword' | 'ContactNumber'

export default function EmailSignup() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [currentScreen, setCurrentScreen] = React.useState<Screen>('EmailScreen');
  const [email, setEmail] = useState('');
  const [display_name, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [contact_number, setContactNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  const goBack = () => {
    if (currentScreen === 'EmailScreen') navigation.navigate('SignUpOptions')
    else if (currentScreen === 'UserPassword') setCurrentScreen('EmailScreen')
    else if (currentScreen === 'ContactNumber') setCurrentScreen('UserPassword')
    else navigation.navigate('SignUpOptions')
  }

  const handleNext = async () => {
    if (currentScreen === 'EmailScreen') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      setEmailError('');
      setCurrentScreen('UserPassword');

    } else if (currentScreen === 'UserPassword') {
      // Reset errors
      setDisplayNameError('');
      setPasswordError('');
      
      // Validate display name
      if (!display_name.trim()) {
        setDisplayNameError('Please enter your display name');
        return;
      }
      if (display_name.length < 2) {
        setDisplayNameError('Display name must be at least 2 characters');
        return;
      }

      // Validate password
      if (!password || password.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        return;
      }
      
      setCurrentScreen('ContactNumber');
    }
  };

  const handleSubmit = async () => {
    if (!contact_number.trim()) {
      Alert.alert('Error', 'Please enter your contact number');
      return;
    }

    // Validate phone number format: must be 10 digits
    const phoneNumberDigits = contact_number.replace(/\D/g, ''); // Remove non-digit chars
    if (phoneNumberDigits.length !== 10) {
      Alert.alert('Error', 'Phone number must be 10 digits long');
      return;
    }

    setLoading(true);

    let formattedContactNumber = contact_number.trim();

    try {
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            display_name: display_name.trim(),
            contact_number: formattedContactNumber
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);

        if (error.message?.includes('already registered')) {
          Alert.alert('Error', 'This email is already registered. Please try logging in.');
        } else if (error.message?.includes('password')) {
          Alert.alert('Error', 'Password must be at least 8 characters');
        } else {
          Alert.alert('Registration Error', error.message || 'Registration failed. Please try again.');
        }
        return;
      }

      if (data.user?.identities?.length === 0) {
        Alert.alert('Email Exists', 'This email is already registered. Please check your email or try logging in.');
        return;
      }

      if (!data.user) {
        Alert.alert('Error', 'User creation failed. Please try again.');
        return;
      }

      // Register for push notifications and get token
      let pushToken = null;
      try {
        pushToken = await registerForPushNotificationsAsync();
        console.log('Push token obtained during signup:', pushToken);
      } catch (tokenError) {
        console.warn('Failed to get push token during signup:', tokenError);
        // Don't block signup on push token failure
      }

      // Insert user profile into customer_profiles
      const { error: profileError } = await supabase
        .from('customer_profiles')
        .insert([
          {
            id: data.user.id,
            email: email.trim(),
            display_name: display_name.trim(),
            contact_number: formattedContactNumber,
            push_token: pushToken
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        Alert.alert('Error', 'Account created but profile setup failed. Please contact support.');
        return;
      }

      // Insert into subscribers_mobile if user opted in
      if (isChecked) {
        const { error: subscriberError } = await supabase
          .from('subscribers_mobile')
          .insert([
            {
              user_id: data.user.id,
              contact_number: formattedContactNumber
            }
          ]);

        if (subscriberError) {
          console.error('Subscriber insertion error:', subscriberError);
          // Don't block on this error since subscription is optional
        }
      }

      Alert.alert(
        'Success',
        'Registration completed!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('GetStarted');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const screens = {
    EmailScreen: (
      <EmailScreen
        email={email}
        setEmail={setEmail}
        handleNext={handleNext}
        goBack={goBack}
        setCurrentScreen={setCurrentScreen}
        loading={loading}
        error={emailError}
      />
    ),
    UserPassword: (
      <UserPassword
        displayName={display_name}
        setDisplayName={setDisplayName}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
        handleNext={handleNext}
        goBack={goBack}
        loading={loading}
        displayNameError={displayNameError}
        passwordError={passwordError}
      />
    ),
    ContactNumber: (
      <ContactNumber
        contactNumber={contact_number}
        setContactNumber={setContactNumber}
        isChecked={isChecked}
        setChecked={setChecked}
        handleSubmit={handleSubmit}
        goBack={goBack}
        loading={loading}
      />
    )
  }

  return screens[currentScreen];
}