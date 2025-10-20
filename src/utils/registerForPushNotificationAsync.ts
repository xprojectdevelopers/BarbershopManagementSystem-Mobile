import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// ✅ Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Sets up Android notification channels with proper configuration
 */
async function setupAndroidChannels() {
  if (Platform.OS !== "android") return;

  try {
    // Default channel for regular notifications
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    // High priority channel for important notifications
    await Notifications.setNotificationChannelAsync("high-priority", {
      name: "High Priority",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF0000",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    console.log("✅ Android notification channels created");
  } catch (error) {
    console.error("❌ Error creating notification channels:", error);
  }
}

/**
 * Registers the device for push notifications and returns the Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string> {
  // Setup Android channels first
  await setupAndroidChannels();

  // Check if running on physical device
  if (!Device.isDevice) {
    const error = "Must use a physical device for push notifications.";
    console.error("❌", error);
    throw new Error(error);
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  console.log("📋 Current permission status:", existingStatus);

  // Request permissions if not granted
  if (existingStatus !== "granted") {
    console.log("🔔 Requesting notification permissions...");
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Handle permission denial
  if (finalStatus !== "granted") {
    const error = "Notification permissions not granted.";
    console.error("❌", error);
    throw new Error(error);
  }

  console.log("✅ Notification permissions granted");

  // Get project ID from config
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    const error = "Project ID not found in app configuration.";
    console.error("❌", error);
    throw new Error(error);
  }

  console.log("📱 Project ID:", projectId);

  try {
    // Get Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync({ 
      projectId 
    });
    const token = tokenData.data;

    console.log("✅ Expo Push Token obtained:", token);
    console.log("📌 Token format valid:", token.startsWith("ExponentPushToken["));

    return token;
  } catch (error) {
    console.error("❌ Error getting push token:", error);
    throw error;
  }
}

/**
 * Test function to send a local notification (for debugging)
 */
export async function sendTestLocalNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🧪 Test Notification",
        body: "If you see this, local notifications are working!",
        sound: "default",
        data: { test: true },
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // Show immediately
    });
    console.log("✅ Test notification scheduled");
  } catch (error) {
    console.error("❌ Error sending test notification:", error);
  }
}

/**
 * Send push notification via Supabase Edge Function
 */
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  try {
    console.log("📤 Sending push notification...");
    console.log("Token:", expoPushToken);
    console.log("Title:", title);
    console.log("Message:", message);

    const response = await fetch(
      "https://gycwoawekmmompvholqr.supabase.co/functions/v1/sendNotification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expoPushToken,
          title,
          message,
          data: data || {},
          sound: "default",
          priority: "high",
          channelId: "default",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("📦 Server response:", result);

    if (!result.success) {
      throw new Error(result.error || "Unknown error");
    }

    console.log("✅ Push notification sent successfully!");
    console.log("Ticket:", result.ticket);

    return result;
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    throw error;
  }
}

/**
 * Setup notification listeners for your app
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
  // Listen for notifications received while app is in foreground
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("📨 Notification received (foreground):", notification);
      onNotificationReceived?.(notification);
    }
  );

  // Listen for notification taps
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log("👆 Notification tapped:", response);
      console.log("Data:", response.notification.request.content.data);
      onNotificationTapped?.(response);
    }
  );

  // Return cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}