import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNotification } from '../contexts/notificationContext';
import ThemedText from '../components/ThemedText';



const PushNotifScreen: React.FC = () => {
  const { expoPushToken, notification, error } = useNotification();

  const handleTestNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }
    try {
      const message = {
        to: expoPushToken,
        sound: 'Discord notification',
        title: 'Test Notification',
        body: 'HAYOP KA GUMANA!!!!!',
        vibrate: [0, 250],
        data: { someData: 'goes here' },
      };
      const response = await Notifications.scheduleNotificationAsync({
        content: message,
        trigger: null,
      });
      console.log('Push notification scheduled:', response);
      Alert.alert('Success', 'Test push notification scheduled');
    } catch (error) {
      console.error('Error sending push notification:', error);
      Alert.alert('Error', 'Failed to send push notification');
    }
  };

  const handleShowNotificationText = () => {
    if (notification) {
      const content = notification.request.content;
      Alert.alert('Latest Notification Text', `Title: ${content.title}\nBody: ${content.body}`);
    } else {
      Alert.alert('No Notification', 'No latest notification available');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="title" style={styles.title}>
        Push Notifications
      </ThemedText>

      <ThemedText variant="body" style={styles.tokenLabel}>
        Expo Push Token:
      </ThemedText>
      <ThemedText variant="caption" style={styles.token}>
        {expoPushToken || 'Not available'}
      </ThemedText>

      {notification && (
        <View style={styles.notificationContainer}>
          <ThemedText variant="subtitle">Latest Notification:</ThemedText>
          <ThemedText variant="body">
            {JSON.stringify(notification.request.content, null, 2)}
          </ThemedText>
        </View>
      )}

      {error && (
        <ThemedText variant="caption" style={styles.error}>
          Error: {error.message}
        </ThemedText>
      )}

      <TouchableOpacity style={styles.button} onPress={handleTestNotification}>
        <ThemedText variant="button">Send Test Notification</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonMargin]} onPress={handleShowNotificationText}>
        <ThemedText variant="button">Show Notification Text</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  tokenLabel: {
    marginBottom: 10,
  },
  token: {
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  notificationContainer: {
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonMargin: {
    marginTop: 10,
  },
});

export default PushNotifScreen;
