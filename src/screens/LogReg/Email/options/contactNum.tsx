import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView } from 'react-native'
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
const [formatError, setFormatError] = useState('');

const formatPhoneNumber = (input: string) => {
  const digits = input.replace(/\D/g, '');
  const limitedDigits = digits.slice(0, 10);

  let formatted = ''
  if(limitedDigits.length > 0) {
    formatted = limitedDigits
    if(limitedDigits.length > 3) {
      formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
      }
    if (limitedDigits.length > 6) {
        formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
      }
    }
    return formatted
  }

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setContactNumber(formatted);

    const digits = text.replace(/\D/g, '');
    if(digits.length > 0 && digits.length < 10) {
      setFormatError('Phone number must be 10 digits');
    } else {
      setFormatError('')
    }
  }

  const SquareCheckbox = ({ isChecked, onToggle }: any) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
      <View style={[styles.squareCheckbox, isChecked && styles.squareCheckboxChecked]}>
        {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <AntDesign name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Let's finish up!</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.contactSection}>
            <Text style={styles.label}>Contact Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>+63</Text>
              </View>
              <TextInput
                placeholder='XXX-XXX-XXXX'
                placeholderTextColor={'#6b7280'}
                keyboardType='phone-pad'
                autoCapitalize='none'
                autoCorrect={false}
                style={styles.phoneInput}
                value={contactNumber}
                onChangeText={handlePhoneNumberChange}
                editable={!loading}
                returnKeyType='done'
                onSubmitEditing={handleSubmit}
              />
            </View>
            <Text style={styles.helperText}>
              You'll need to confirm this number later
            </Text>
          </View>

          
          <View style={styles.termsSection}>
            <View style={styles.checkboxRow}>
              <SquareCheckbox
                isChecked={isChecked}
                onToggle={setChecked}
              />
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  <TouchableOpacity><Text style={styles.linkText}>Molave Street Barbers</Text></TouchableOpacity> may send me personalized emails regarding products and services. (Optional)
                </Text>
              </View>
            </View>

            <View>
              <Text style={styles.termsText}>
                By clicking Create Account, you agree to the{' '}
                <TouchableOpacity onPress={() => console.log('Terms pressed')}>
                  <Text style={styles.linkText}>Terms of Service</Text>
                </TouchableOpacity>
                {' '}and{' '}
                <TouchableOpacity onPress={() => console.log('Privacy pressed')}>
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>
                {' '}of Molave Street's Barbers.
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity onPress={handleSubmit}
            style={styles.continueBtn}
          >
            <Text style={styles.continueButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20
  },
  title: {
    top: 120,
    textAlign: 'center',
    fontSize: 28,
    fontFamily: 'Satoshi-Bold'
  },
  formContainer: {
    flex: 1,
    paddingTop: 150,
    justifyContent: 'space-between',
  },
  contactSection: {
    marginBottom: 30,
  },
  label: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#1f2937',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeContainer: {
    backgroundColor: '#cacacaff',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRightWidth: 1,
    borderRightColor: '#ebe8e8ff',
    justifyContent: 'center',
  },
  countryCode: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#1f2937',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#cacacaff',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: '#000000',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontFamily: 'Satoshi-Regular',
  },
  termsSection: {
    marginBottom: 420,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  squareCheckbox: {
    width: 20,
    height: 20,
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
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Satoshi-Regular',
    lineHeight: 20,
    bottom: 10
  },
  linkText: {
    fontFamily: 'Satoshi-Bold',
    top: 5
  },
  continueBtn: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 400
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
});