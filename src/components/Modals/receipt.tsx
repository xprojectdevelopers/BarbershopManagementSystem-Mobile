import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel?: () => void;
  isCancelled?: boolean;
  children?: React.ReactNode;
}

export default function ReceiptModal({ visible, onClose, onCancel, isCancelled, children }: ReceiptModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <AntDesign name="close" size={17} color="black" />
          </TouchableOpacity>
          <View style={styles.contentContainer}>
            {children}
            {onCancel && (
              <TouchableOpacity
                style={[styles.cancelBtn, isCancelled ? styles.cancelledBtn : null]}
                onPress={onCancel}
                disabled={isCancelled}
              >
                <Text style={[styles.cancelBtnText, isCancelled ? styles.cancelledBtnText : null]}>
                  {isCancelled ? 'Cancelled' : 'Cancel Appointment'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 400,
    height: 800,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    borderRadius: 50,
    width: 30,
    height: 30,
    backgroundColor: '#d6d6d6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginTop: 10,
  },
  cancelBtn: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    width: '100%',
    height: 50,
    borderRadius: 30,
  },
  cancelledBtn: {
    backgroundColor: '#cccccc',
  },
  cancelBtnText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  cancelledBtnText: {
    color: '#666666',
  },
});
