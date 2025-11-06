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

interface ToolTip3Props {
  visible: boolean;
  onClose: () => void;
}

const ToolTip3: React.FC<ToolTip3Props> = ({ visible, onClose }) => {
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
              You can use this payment method at the shop
            </Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ToolTip3;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    width: '55%',
    maxWidth: 300,
     top: 90,
    left: 90,
  },
  tooltipContent: {
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    borderWidth: 2,
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
    color: '#666',
    lineHeight: 22,
  },
});
