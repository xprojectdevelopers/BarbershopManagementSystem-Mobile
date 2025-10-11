import { Text, View, Alert, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../types/navigations'
import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase/client';

//Separated Screens
import DisplayName from './options/displayName'
import UserPassword from './options/userPassword'
import ContactNumber from './options/contactNum'

type Screen = 'DisplayName' | 'UserPassword' | 'ContactNumber'

export default function EmailSignup() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [currentScreen, setCurrentScreen] = React.useState<Screen>('DisplayName');
  const [email, setEmail] = useState('');
  const [display_name, setDisplayName] = useState('');

  const [password, setPassword] = useState('');
  const [contact_number, setContactNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const goBack = () => {
    if (currentScreen === 'DisplayName') navigation.navigate('SignUpOptions')
    else if (currentScreen === 'UserPassword') setCurrentScreen('DisplayName')
    else if (currentScreen === 'ContactNumber') setCurrentScreen('UserPassword')
    else navigation.navigate('SignUpOptions')
  }



  const handleNext = async () => {
    if (currentScreen === 'DisplayName') {
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      setEmailError('');

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
            contact_number: formattedContactNumber
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
        email={email}
        setEmail={setEmail}
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
