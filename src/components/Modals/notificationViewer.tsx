import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface AppNotification {
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
  notification: AppNotification | null;
  loading?: boolean;
}

const NotificationViewer: React.FC<NotificationViewerProps> = ({ visible, onClose, notification, loading = false }) => {
  if (!notification) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <View style={styles.outline}>
              <View style={styles.title}>
                <Text style={styles.titleText}>Molave Street Barbers</Text>
                <Text style={styles.description}>112 Upper Molave Street Payatas B.</Text>
                <Text style={styles.description}>1119 Quezon City, Philippines</Text>
                <Text style={styles.description}>0909123456</Text>
              </View>
              <View style={styles.notificationdesc}>
                <Text style={styles.notifdesc}>{notification.description}</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Read</Text>
              </TouchableOpacity>
            </View>
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
    width: 350,
    height: 450,
    maxHeight: 500,
    alignItems: 'center',
  },
  outline: {
    height: 400,
    width: 300,
    borderWidth: 2,
    borderColor: 'black',
  },
  title: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 20
  },
  titleText: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    marginVertical: 2,
    
  },
  notificationdesc: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 50
  },
  notifdesc: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    paddingLeft: 17,
    paddingRight: 17
  },
  closeBtn: {
    top: 100,
    left: 70,
    borderRadius: 50,
    width: 150,
    height: 50,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
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
