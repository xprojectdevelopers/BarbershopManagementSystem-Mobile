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

interface ToolTip2Props {
  visible: boolean;
  onClose: () => void;
}

const ToolTip2: React.FC<ToolTip2Props> = ({ visible, onClose }) => {
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
              Don’t be late! Come at least 15 minutes early for your appointment.
            </Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ToolTip2;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    width: '60%',
    maxWidth: 300,
    height: 300,
    top: 125,
    left: 75,
  },
  tooltipContent: {
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
    borderWidth: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: '#666',
    lineHeight: 22,
  },
});
