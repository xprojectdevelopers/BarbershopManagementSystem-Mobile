import React from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface PhotoOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove: () => void;
  showRemoveOption?: boolean;
}

const { width } = Dimensions.get('window');

export default function PhotoOptionsModal({ 
  visible, 
  onClose, 
  onCamera, 
  onGallery, 
  onRemove,
  showRemoveOption = true 
}: PhotoOptionsModalProps) {
  const handleCameraPress = () => {
    onClose();
    onCamera();
  };

  const handleGalleryPress = () => {
    onClose();
    onGallery();
  };

  const handleRemovePress = () => {
    onClose();
    onRemove();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={handleCameraPress}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="camera" size={28} color="#007AFF" />
              </View>
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={handleGalleryPress}
            >
              <View style={styles.optionIconContainer}>
                <MaterialIcons name="photo-library" size={28} color="#007AFF" />
              </View>
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            {showRemoveOption && (
              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={handleRemovePress}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="trash-outline" size={28} color="#FF3B30" />
                </View>
                <Text style={[styles.optionText, styles.removeText]}>Remove Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  optionIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    flex: 1,
  },
  removeText: {
    color: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelText: {
    fontSize: 17,
    fontFamily: 'Satoshi-Bold',
    color: '#007AFF',
  },
});