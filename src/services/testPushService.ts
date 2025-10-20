interface ExpoNotificationData {
  [key: string]: string;
}

export async function sendTestExpoNotification(
  expoPushToken: string,
  title = "Test Notification",
  body = "This is a test from dev build",
  data: ExpoNotificationData = {}
) {
  if (!expoPushToken.startsWith("ExponentPushToken[")) {
    throw new Error("Invalid Expo Push Token");
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("📩 Expo Push API Response:", JSON.stringify(result, null, 2));

    if (!response.ok || result.data?.[0]?.status === "error") {
      throw new Error("Expo push failed: " + JSON.stringify(result));
    }

    return result;
  } catch (err) {
    console.error("🔥 Error sending test notification:", err);
    throw err;
  }
}
