import { Text, View, Alert, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../types/navigations'
import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase/client';

//Separated Screens
import EmailScreen from './options/emailScreen'
import DisplayName from './options/displayName'
import UserPassword from './options/userPassword'
import ContactNumber from './options/contactNum'

type Screen = 'EmailScreen' | 'DisplayName' | 'UserPassword' | 'ContactNumber'

export default function EmailSignup() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [currentScreen, setCurrentScreen] = React.useState<Screen>('EmailScreen');
  const [email, setEmail] = useState('');
  const [display_name, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [contact_number, setContactNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const goBack = () => {
    if (currentScreen === 'DisplayName') setCurrentScreen('EmailScreen')
    else if (currentScreen === 'UserPassword') setCurrentScreen('DisplayName')
    else if (currentScreen === 'ContactNumber') setCurrentScreen('UserPassword')
    else navigation.navigate('SignUpOptions')
  }

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      return !data; // If no data found, username is available
    } catch (error) {
      console.error('Username check error:', error);
      return true; // Don't block on error
    }
  };

  const handleNext = async () => {
    if (currentScreen === 'EmailScreen') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      setEmailError('');
      setCurrentScreen('DisplayName');

    } else if (currentScreen === 'DisplayName') {
      if (!display_name.trim()) {
        Alert.alert('Error', 'Please enter your display name');
        return;
      }
      if (display_name.length < 2) {
        Alert.alert('Error', 'Display name must be at least 2 characters');
        return;
      }
      setCurrentScreen('UserPassword');

    } else if (currentScreen === 'UserPassword') {
      if (!username.trim()) {
        Alert.alert('Error', 'Please enter a username');
        return;
      }
      if (username.length < 3) {
        Alert.alert('Error', 'Username must be at least 3 characters');
        return;
      }

      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        Alert.alert('Error', 'Username is already taken. Please choose another one.');
        return;
      }

      if (!password || password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
      setPasswordError('');
      setCurrentScreen('ContactNumber');
    }
  };

  const handleSubmit = async () => {
    if (!contact_number.trim()) {
      Alert.alert('Error', 'Please enter your contact number');
      return;
    }

    // Validate phone number format: must be 10 digits (excluding +63)
    const phoneNumberDigits = contact_number.replace(/\D/g, ''); // Remove non-digit chars
    if (phoneNumberDigits.length !== 10) {
      Alert.alert('Error', 'Phone number must be 10 digits long (excluding country code)');
      return;
    }

    if (!isChecked) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    // Ensure contact number includes +63 prefix
    let formattedContactNumber = contact_number.trim();
    if (!formattedContactNumber.startsWith('+63')) {
      formattedContactNumber = '+63' + formattedContactNumber;
    }

    try {
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            display_name: display_name.trim(),
            username: username.toLowerCase().trim(),
            contact_number: formattedContactNumber
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);

        if (error.message?.includes('already registered')) {
          Alert.alert('Error', 'This email is already registered. Please try logging in.');
        } else if (error.message?.includes('password')) {
          Alert.alert('Error', 'Password must be at least 6 characters');
        } else if (error.message?.includes('username')) {
          Alert.alert('Error', 'Username is already taken');
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

      // Insert user profile into customer_profiles
      const { error: profileError } = await supabase
        .from('customer_profiles')
        .insert([
          {
            id: data.user.id,
            email: email.trim(),
            display_name: display_name.trim(),
            username: username.toLowerCase().trim(),
            contact_number: formattedContactNumber
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        Alert.alert('Error', 'Account created but profile setup failed. Please contact support.');
        return;
      }

      Alert.alert(
        'Success',
        'Registration completed! Please check your email to verify your account before logging in.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await supabase.auth.signOut();
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
        setCurrentScreen={setCurrentScreen as any}
        loading={loading}
        error={emailError}
      />
    ),
    DisplayName: (
      <DisplayName
        displayName={display_name}
        setDisplayName={setDisplayName}
        handleNext={handleNext}
        goBack={goBack}
        loading={loading}
        error=""
      />
    ),
    UserPassword: (
      <UserPassword
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
        handleNext={handleNext}
        goBack={goBack}
        loading={loading}
        error={passwordError}
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
