import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface Notification {
  id: string;
  user_id: string;
  receipt_id?: string;
  title: string;
  description?: string;
  created_at: string;
}

interface NotificationViewerProps {
  visible: boolean;
  onClose: () => void;
  notification: Notification | null;
}

const NotificationViewer: React.FC<NotificationViewerProps> = ({ visible, onClose, notification }) => {
  if (!notification) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <AntDesign name="close" size={17} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{notification.title}</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{notification.description}</Text>
          </View>
          {notification.receipt_id && (
            <Text style={styles.receiptText}>Receipt ID: {notification.receipt_id}</Text>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

export default NotificationViewer;

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
    width: 350,
    maxHeight: 500,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 50,
    width: 30,
    height: 30,
    backgroundColor: '#d6d6d6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  descriptionContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  descriptionText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  receiptText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});
