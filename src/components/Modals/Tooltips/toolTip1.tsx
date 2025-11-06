import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ToolTip1Props {
  visible: boolean;
  onClose: () => void;
}

const ToolTip1: React.FC<ToolTip1Props> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltipContent}>
            <Text style={styles.description}>
              A fee of ₱50 will be applied to each service booked.
            </Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ToolTip1;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    width: '45%',
    maxWidth: 300,
    left: 85,
    bottom: 35,
  },
  tooltipContent: {
    borderWidth: 2,
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Satoshi-Regular',
    color: 'black',
    lineHeight: 22,
  },
});
