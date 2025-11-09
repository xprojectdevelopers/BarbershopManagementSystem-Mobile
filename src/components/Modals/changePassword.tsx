import React, { useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { changePassword } from '../../lib/supabase/profileFunctions';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ChangePasswordModal({ visible, onClose, onConfirm }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const { success, error } = await changePassword(newPassword);
      if (success) {
        Alert.alert('Success', 'Password changed successfully');
        onConfirm();
        onClose();
        // Clear fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', (error as any)?.message || 'Failed to change password');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalBoxContainer}>
            <Text style={styles.modalBoxTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholderTextColor={'#505050ff'}
            />

            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor={'#505050ff'}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor={'#505050ff'}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn} disabled={isLoading}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChangePassword} style={styles.changeBtn} disabled={isLoading}>
                <Text style={styles.changeBtnText}>{isLoading ? 'Changing...' : 'Change'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: 350,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBoxContainer: {
    borderWidth: 1,
    borderColor: 'black',
    width: '90%',
    height: '90%',
    padding: 20,
  },
  modalBoxTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Satoshi-Regular',
    color: 'black'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: '#ccc',
    width: '45%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  cancelBtnText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
  changeBtn: {
    backgroundColor: 'black',
    width: '45%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  changeBtnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
});
