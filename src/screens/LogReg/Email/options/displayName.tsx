import { 
  StyleSheet, 
  Text, 
  View, 
  KeyboardAvoidingView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator
} from 'react-native'
import React from 'react'

//icons
import AntDesign from '@expo/vector-icons/AntDesign';

export default function DisplayName({
  displayName,
  setDisplayName,
  handleNext,
  goBack,
  loading,
  error
}: {
  displayName: string;
  setDisplayName: React.Dispatch<React.SetStateAction<string>>;
  handleNext: () => void;
  goBack: () => void;
  loading: boolean
  error: string
}) {
  return (
    <View style={{flex: 1}}>
       <TouchableOpacity onPress={goBack} style={styles.backBtn}>
        <AntDesign name="arrow-left" size={34} color="black" />
      </TouchableOpacity>
      <Text style={styles.Title}>What's your name?</Text>
      <View style={styles.container}>
        <View style={styles.DisplayNameForm}>
          <Text style={styles.DisplayNameText}>Display Name</Text>
          <TextInput 
            placeholderTextColor={'#505050ff'}
            placeholder='Enter your name'
            autoCapitalize='none'
            autoCorrect={false}
            style={styles.DisplayNameInput}
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading}
          />
          {error && <Text style={{color: '#ef4444', fontSize: 14, top: 10, opacity: (!displayName || loading) ? 0.5 : 1, }}>{error}</Text>}
          <Text style={{fontFamily: 'Satoshi-Regular', fontSize: 14, top: 10 }}>This is the name that will appear on your profile</Text>
          <TouchableOpacity onPress={handleNext} disabled={loading || !displayName} style={[styles.continueBtn, {opacity: (!displayName || loading) ? 0.5 : 1,}]}>
           {loading ? (
            <ActivityIndicator color="white" />
              ) : (
              <Text
                style={styles.continueText}
              >
                Next
              </Text>
            )}
          </TouchableOpacity> 
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
  container: {
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
  DisplayNameForm: {
    bottom:200,
  },
  DisplayNameText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    bottom: 5,
  },
  DisplayNameInput: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#cacacaff',
    width: 380,
    height: 50,
  },
  continueBtn: {
     backgroundColor: '#000000ff',
    width: 380,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    top: 30
  },
  continueText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
})