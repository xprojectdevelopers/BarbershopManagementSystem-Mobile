import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getProfileById, updateProfile, sendOTP , CustomerProfile } from '../../lib/supabase/profileFunctions';


interface AccountInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AccountInfoModal({ visible, onClose }: AccountInfoModalProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (visible && user?.id) fetchProfile();
  }, [visible, user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { success, data } = await getProfileById(user.id);
      if (success && data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setContactNumber(data.contact_number || '');
        setEmail(data.email || '');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    setOtpLoading(true);
    try {
      const { success, error } = await sendOTP(email);
      if (success) {
        Alert.alert('Success', 'OTP sent to your email');
        setShowOtpInput(true);
      } else {
        Alert.alert('Error', error ? String(error) : 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !profile) return;

    // Check if email is being changed and OTP is required
    const emailChanged = email !== profile.email;
    if (emailChanged && (!otp || otp.trim() === '')) {
      Alert.alert('Error', 'Please enter the OTP code to verify your new email address');
      return;
    }

    setSaving(true);
    try {
      const updates: Partial<CustomerProfile> = {
        display_name: displayName,
        contact_number: contactNumber,
        email,
      };
      const { success, error } = await updateProfile(user.id, updates);
      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
        onClose();
      } else {
        Alert.alert('Error', error ? String(error) : 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.header}>Account Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Luca Paguro"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact number</Text>
            <TextInput
              style={styles.input}
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
              placeholder="09096862512"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.emailContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="lucapaguro@gmail.com"
              />
              <TouchableOpacity style={styles.iconButton} onPress={handleSendOTP} disabled={otpLoading}>
                {otpLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.iconText}>➤</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Code</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              placeholder="123456"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.updateButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateText}>Update</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#000',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  iconText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: '#000',
  },
  updateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  cancelText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
});
