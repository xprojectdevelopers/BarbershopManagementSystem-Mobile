import { StyleSheet, Text, View, TextInput, TouchableOpacity, Linking, ActivityIndicator, useWindowDimensions } from 'react-native'
import React, { useState } from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ContactNumProps {
  contactNumber: string
  setContactNumber: (contactNum: string) => void
  isChecked: boolean
  setChecked: (value: boolean) => void
  handleSubmit: () => void
  goBack: () => void
  loading: boolean
}

export default function ContactNum({
  contactNumber,
  setContactNumber,
  isChecked,
  setChecked,
  handleSubmit,
  goBack,
  loading
}: ContactNumProps) {
  const { width, height } = useWindowDimensions();
  const [formatError, setFormatError] = useState('');

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

  const formatPhoneNumber = (input: string) => {
    const digits = input.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 11);
    return limitedDigits;
  }

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setContactNumber(formatted);

    const digits = text.replace(/\D/g, '');
    if(digits.length > 0 && digits.length !== 11) {
      setFormatError('Phone number must be exactly 11 digits');
    } else {
      setFormatError('')
    }
  }

  const SquareCheckbox = ({ isChecked, onToggle }: any) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle} disabled={loading}>
      <View style={[styles.squareCheckbox, isChecked && styles.squareCheckboxChecked]}>
        {isChecked && <Ionicons name="checkmark" size={wp(4)} color="white" />}
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(wp, hp, fs);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <AntDesign name="arrow-left" size={wp(7)} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Let's finish up!</Text>

        <View style={styles.formContainer}>
          <View style={styles.contactSection}>
            <Text style={styles.label}>Contact Number</Text>
            <View style={styles.phoneInputContainer}>
              <TextInput
                placeholder='XXXXXXXXXXX'
                placeholderTextColor={'#6b7280'}
                keyboardType='phone-pad'
                autoCapitalize='none'
                autoCorrect={false}
                style={[styles.phoneInput, {borderColor: formatError ? "#ef4444" : "#e5e7eb", borderWidth: 1}]}
                value={contactNumber}
                onChangeText={handlePhoneNumberChange}
                editable={!loading}
                returnKeyType='done'
                onSubmitEditing={handleSubmit}
                maxLength={11}
              />
            </View>
            {formatError ? (
                 <Text style={styles.errorText}>
                   {formatError}
                 </Text>
               ) : (
                <Text style={styles.helperText}>
                  You&apos;ll need to confirm this number later
                </Text>
              )}
          </View>


          <View style={styles.termsSection}>
            <View style={styles.checkboxRow}>
              <SquareCheckbox
                isChecked={isChecked}
                onToggle={() => setChecked(!isChecked)}
              />
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  <Text>
                    <TouchableOpacity onPress={() => Linking.openURL('https://molavestreetbarbers.vercel.app')} >
                      <Text style={styles.linkText}>Molave Street Barbers</Text>
                    </TouchableOpacity>
                  </Text>
                  {' '}may send me personalized emails regarding products and services. (Optional)
                </Text>
              </View>
            </View>

            <View>
              <Text style={styles.termsText}>
                By clicking Create Account, you agree to the{' '}
                <Text>
                  <TouchableOpacity onPress={() => Linking.openURL('https://molavestreetbarbers.vercel.app/terms')}>
                    <Text style={styles.linkText}>Terms of Service</Text>
                  </TouchableOpacity>
                </Text>
                {' '}and{' '}
                <Text>
                  <TouchableOpacity onPress={() => Linking.openURL('https://molavestreetbarbers.vercel.app/privacy')}>
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </TouchableOpacity>
                </Text>
                {' '}of Molave Street&apos;s Barbers.
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.continueBtn, { opacity: (loading || !contactNumber || formatError || !isChecked) ? 0.5 : 1 }]}
            disabled={Boolean(loading || !contactNumber || formatError || !isChecked)}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.continueButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const createStyles = (wp: (p: number) => number, hp: (p: number) => number, fs: (p: number) => number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  backBtn: {
    position: 'absolute',
    top: hp(6),
    left: wp(5),
    zIndex: 1,
  },
  title: {
    position: 'absolute',
    top: hp(10),
    left: wp(2.5),
    width: '100%',
    textAlign: 'center',
    fontSize: fs(7),
    fontFamily: 'Satoshi-Bold'
  },
  formContainer: {
    flex: 1,
    paddingTop: hp(19),
    justifyContent: 'space-between',
    paddingBottom: hp(2.5),
  },
  contactSection: {
    marginBottom: hp(3.5),
  },
  label: {
    fontFamily: 'Satoshi-Bold',
    fontSize: fs(4),
    marginBottom: hp(1),
    color: '#1f2937',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#cacacaff',
    borderRadius: 8,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    fontFamily: 'Satoshi-Medium',
    fontSize: fs(4),
    color: '#000000',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  helperText: {
    fontSize: fs(3),
    color: '#6b7280',
    marginTop: hp(1),
    fontFamily: 'Satoshi-Regular',
  },
  errorText: {
    fontSize: fs(3),
    color: "#ef4444",
    marginTop: hp(1),
    fontFamily: 'Satoshi-Regular',
  },
  termsSection: {
    bottom: hp(22)
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(2.5),
  },
  checkboxContainer: {
    marginRight: wp(3),
    marginTop: hp(0.25),
  },
  squareCheckbox: {
    width: wp(5),
    height: wp(5),
    borderWidth: 2,
    borderColor: '#6b7280',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  squareCheckboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: fs(3.5),
    color: '#374151',
    fontFamily: 'Satoshi-Regular',
    lineHeight: hp(4),
  },
  linkText: {
    fontFamily: 'Satoshi-Bold',
    color: '#000000',
    fontSize: fs(3.5),
    textDecorationLine: 'underline',
  },
  continueBtn: {
    backgroundColor: '#000000',
    paddingVertical: hp(2),
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    bottom: hp(40),
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: fs(4),
    fontFamily: 'Satoshi-Bold',
  },
});
