import React from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';

interface AppointmentAlertProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AppointmentAlert({ visible, onClose, onConfirm }: AppointmentAlertProps) {
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
            <Text style={styles.modalBoxTitle}>TAKE NOTE</Text>
            <Image 
              source={require('../../../assets/icon/animation/Reminder.gif')}
              style={{ width: 140, height: 140, alignSelf: 'center', marginTop: 10 }}
            />
            <Text style={styles.modalBoxText}>All bookings go through approval. We&apos;ll notify you once confirmed.</Text>
            <TouchableOpacity onPress={() => { onConfirm(); onClose(); }} style={styles.modalBoxBtn}>
              <Text style={styles.modalBoxBtnText}>Continue</Text>
            </TouchableOpacity>
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
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  modalBoxContainer: {
    borderWidth: 1,
    borderColor: 'black',
    width: '80%',
    height: '85%',
    borderRadius: 30,
  },
  modalBoxTitle: {
    fontSize: 26,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    marginTop: 20,
  },
  modalBoxText: {
    fontSize: 20,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    marginTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  modalBoxBtn: {
    backgroundColor: 'black',
    width: '60%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  modalBoxBtnText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
  },
});
