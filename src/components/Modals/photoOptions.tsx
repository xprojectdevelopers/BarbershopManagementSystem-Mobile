import React from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface PhotoOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove: () => void;
}

export default function PhotoOptionsModal({ visible, onClose, onCamera, onGallery, onRemove }: PhotoOptionsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.optionButton} onPress={onCamera}>
              <Ionicons name="camera" size={24} color="#000" />
              <Text style={styles.optionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={onGallery}>
              <MaterialIcons name="photo-library" size={24} color="#000" />
              <Text style={styles.optionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={onRemove}>
              <Ionicons name="trash" size={24} color="#000" />
              <Text style={styles.optionText}>Remove</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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
    width: '80%',
    borderRadius: 10,
    padding: 20,
    height: 150,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  optionButton: {
    alignItems: 'center',
    paddingVertical: 15,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#f9f9f9',
  },
  optionText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Satoshi-Regular',
    marginTop: 5,
  },
  cancelButton: {
    paddingVertical: 15,
    marginTop: 10,
  },
  cancelText: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
    color: '#007AFF',
    bottom: 15,
  },
});
