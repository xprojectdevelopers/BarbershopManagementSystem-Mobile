import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, TextInput, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/client";
import { useNotification } from "../contexts/notificationContext";
import { insertNotification } from "../lib/supabase/insertFunctions";

// Optional: fallback Supabase client if context is unavailable
const localSupabase = createClient(
  "https://YOUR_SUPABASE_URL.supabase.co",
  "YOUR_SUPABASE_ANON_KEY"
);

const PushNotifScreen: React.FC = () => {
  const { expoPushToken } = useNotification();
  const [logs, setLogs] = useState<string[]>([]);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);
  const [header, setHeader] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const log = (message: string) => {
    console.log(message);
    setLogs((prev) => [message, ...prev]);
  };

  // ✅ Listen for incoming notifications and mark as delivered
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const receivedAt = new Date();
      setLastNotificationTime(receivedAt);

      log(`📬 Notification received at ${receivedAt.toLocaleTimeString()}`);
      console.log("📩 Notification details:", notification);

      const deviceToken = notification.request.identifier;
      const receivedAtISO = receivedAt.toISOString();

      const { error } = await localSupabase
        .from("notification_logs")
        .update({
          status: "delivered",
          delivered_at: receivedAtISO,
        })
        .eq("device_token", deviceToken);

      if (error) log(`⚠️ Error updating delivery: ${error.message}`);
      else log("✅ Delivery logged successfully in Supabase.");
    });

    return () => subscription.remove();
  }, []);

  // 💾 Save Expo push token to Supabase (manually if needed)
  const savePushToken = async () => {
    try {
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;

      if (userError || !user) {
        log("❌ No user logged in. Cannot save push token.");
        return;
      }

      if (!expoPushToken) {
        log("⚠️ No Expo push token to save.");
        return;
      }

      log(`💾 Saving push token for user: ${user.id}`);

      const { error } = await supabase
        .from("customer_profiles")
        .update({
          push_token: expoPushToken,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      log(`✅ Push token saved successfully: ${expoPushToken}`);
    } catch (err: unknown) {
      log(`🔥 Error saving push token: ${String(err)}`);
    }
  };

  // 🚀 Send test notification manually
  const handleTestNotification = async () => {
    if (!expoPushToken) {
      log("❌ No Expo push token available.");
      return;
    }

    log(`🚀 Sending test notification for token: ${expoPushToken}`);

    try {
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;

      if (userError || !user) {
        log("❌ User not logged in.");
        return;
      }

      const startTime = new Date();

      const { data: result, error } = await supabase.functions.invoke("sendNotification", {
        body: {
          expoPushToken,
          title: "Molave Street Barbers 💈",
          message: "Instant test from Supabase Edge Function!",
        },
      });

      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;

      if (error) {
        log(`❌ Supabase Function Error: ${error.message}`);
        return;
      }

      log(`✅ Supabase Function invoked in ${duration}s.`);
      log("📦 Full server response:");
      log(JSON.stringify(result, null, 2));

      if (result?.success) {
        log("📲 Notification queued successfully!");
      } else {
        log("⚠️ Notification may have failed. Check server logs.");
      }
    } catch (err: unknown) {
      log(`🔥 Exception while calling server: ${String(err)}`);
    }
  };

  // Insert notification into database
  const handleInsertNotification = async () => {
    if (!header || !description) {
      Alert.alert('Validation Error', 'Please fill in header and description');
      return;
    }

    try {
      const result = await insertNotification(header, description, status, type);
      if (result.success) {
        log('✅ Notification inserted successfully');
        Alert.alert('Success', 'Notification inserted successfully');
        setHeader('');
        setDescription('');
        setStatus('');
        setType('');
      } else {
        log(`❌ Error inserting notification: ${result.error}`);
        Alert.alert('Error', 'Failed to insert notification');
      }
    } catch (error) {
      log(`🔥 Exception while inserting notification: ${String(error)}`);
      Alert.alert('Error', 'Failed to insert notification');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📱 Push Notification Tester</Text>

      <TouchableOpacity style={styles.button} onPress={handleTestNotification}>
        <Text style={styles.buttonText}>Send Test Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={savePushToken}>
        <Text style={styles.secondaryButtonText}>Save Push Token</Text>
      </TouchableOpacity>

      {/* Notification Input Fields */}
      <Text style={styles.inputTitle}>Insert Notification</Text>
      <TextInput
        style={styles.input}
        placeholder="Header"
        value={header}
        onChangeText={setHeader}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Status (upcoming, approved, declined)"
        value={status}
        onChangeText={setStatus}
      />
      <TextInput
        style={styles.input}
        placeholder="Type (appointment, general, system)"
        value={type}
        onChangeText={setType}
      />
      <TouchableOpacity style={styles.insertButton} onPress={handleInsertNotification}>
        <Text style={styles.insertButtonText}>Insert Notification</Text>
      </TouchableOpacity>

      {lastNotificationTime && (
        <Text style={styles.deliveryTime}>
          🕒 Last delivery: {lastNotificationTime.toLocaleTimeString()}
        </Text>
      )}

      <Text style={styles.logTitle}>Logs</Text>
      <View style={styles.logBox}>
        {logs.length > 0 ? (
          logs.map((line, index) => (
            <Text key={index} style={styles.logText}>
              {line}
            </Text>
          ))
        ) : (
          <Text style={styles.logEmpty}>No logs yet.</Text>
        )}
      </View>

      <View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>Expo Push Token:</Text>
        <Text style={styles.tokenText}>{expoPushToken || "Not available"}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryButtonText: { color: "#fff", fontSize: 14 },
  inputTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  insertButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  insertButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  deliveryTime: { textAlign: "center", color: "#333", marginBottom: 10 },
  logTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  logBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    minHeight: 150,
  },
  logText: { fontSize: 13, color: "#333", marginBottom: 4 },
  logEmpty: { fontSize: 13, color: "#999", textAlign: "center" },
  tokenContainer: { marginTop: 20 },
  tokenLabel: { fontWeight: "bold", marginBottom: 5 },
  tokenText: { fontFamily: "monospace", color: "#333", fontSize: 13 },
});

export default PushNotifScreen;
