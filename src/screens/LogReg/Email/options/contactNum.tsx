import { StyleSheet, Text, View, TextInput, TouchableOpacity, Linking, ActivityIndicator } from 'react-native'
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
  return limitedDigits;
}

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setContactNumber(formatted);

    const digits = text.replace(/\D/g, '');
    if(digits.length > 0 && digits.length !== 10) {
      setFormatError('Phone number must be exactly 10 digits');
    } else {
      setFormatError('')
    }
  }

  const SquareCheckbox = ({ isChecked, onToggle }: any) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle} disabled={loading}> {/* Added disabled prop */}
      <View style={[styles.squareCheckbox, isChecked && styles.squareCheckboxChecked]}>
        {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <AntDesign name="arrow-left" size={28} color="black" />
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
                maxLength={10}
              />
            </View>
            {formatError ? (
                 <Text style={styles.errorText}> {/* Added errorText style */}
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
                  <Text> {/* Added a Text wrapper to hold TouchableOpacity for proper inline display */}
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
                <Text> {/* Added a Text wrapper */}
                  <TouchableOpacity onPress={() => Linking.openURL('https://molavestreetbarbers.vercel.app/terms')}>
                    <Text style={styles.linkText}>Terms of Service</Text>
                  </TouchableOpacity>
                </Text>
                {' '}and{' '}
                <Text> {/* Added a Text wrapper */}
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
            disabled={loading || !contactNumber || formatError || !isChecked}
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
    left: 20,
    zIndex: 1, // Ensure back button is above other content
  },
  title: {
    position: 'absolute', // Keep absolute to allow other content to flow around it
    top: 120,
    width: '100%', // Take full width to center text
    textAlign: 'center',
    fontSize: 28,
    fontFamily: 'Satoshi-Bold'
  },
  formContainer: {
    flex: 1,
    paddingTop: 150,
    justifyContent: 'space-between',
    paddingBottom: 20, // Reduced from 400 to a more reasonable spacing above the button
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
  phoneInput: {
    flex: 1,
    backgroundColor: '#cacacaff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: '#000000',
    borderWidth: 1, // Added for formatError consistency
    borderColor: '#e5e7eb', // Default border color
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontFamily: 'Satoshi-Regular',
  },
  errorText: { // Added for the formatError message
    fontSize: 12,
    color: "#ef4444",
    marginTop: 8,
    fontFamily: 'Satoshi-Regular',
  },
  termsSection: {
    // Original marginBottom: 420. This is a very large space.
    // To position the button near the bottom, and have content fill space,
    // we manage the space with `formContainer`'s `justifyContent: 'space-between'`
    // and its `paddingBottom`. If this was truly desired, it would push everything far up.
    // I've removed it as it makes the layout illogical with `justifyContent: 'space-between'`.
    // The previous large bottom was likely an attempt to position the button.
    // Let's rely on formContainer's justify-content and paddingBottom.
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
    // REMOVED: bottom: 10. This was causing vertical alignment issues.
  },
  linkText: {
    fontFamily: 'Satoshi-Bold',
    color: '#000000', // Ensure link text is black as per the implied design
    // REMOVED: top: 5. This was causing vertical alignment issues.
  },
  continueBtn: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Ensure button takes full width within content padding
    // REMOVED: bottom: 400. This was an absolute position that conflicted with flexbox layout.
    // The button will now be positioned at the bottom by `formContainer`'s `justifyContent: 'space-between'`.
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
});