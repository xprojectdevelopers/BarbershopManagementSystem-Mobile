interface ExpoNotificationData {
  [key: string]: string;
}

// Cache for push token to avoid repeated requests
let cachedToken: string | null = null;
let tokenTimestamp: number = 0;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    priority: "high",
    channelId: "default",
  };

  try {
    // Use AbortController for timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(message),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Only parse JSON if response is ok to save time
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    // Quick validation - don't log full response to save time
    if (result.data?.[0]?.status === "error") {
      throw new Error("Expo push failed");
    }

    return result;
  } catch (err) {
    if ((err as any).name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw err;
  }
}

// Optimized function that caches token
export async function getCachedPushToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid
  if (cachedToken && (now - tokenTimestamp) < TOKEN_CACHE_DURATION) {
    console.log('🔄 Using cached token');
    return cachedToken;
  }

  console.log('🆕 Getting fresh token');
  // Get fresh token
  const { registerForPushNotificationsAsync } = await import('../utils/registerForPushNotificationAsync');
  const token = await registerForPushNotificationsAsync();

  // Cache the token
  cachedToken = token;
  tokenTimestamp = now;

  return token;
}

// Ultra-fast test notification function with parallel processing
export async function sendUltraFastTestNotification(): Promise<{sendTime: number, totalTime: number, result: any}> {
  const startTime = Date.now();

  try {
    // Parallel: Get cached token and prepare message simultaneously
    const [token] = await Promise.all([
      getCachedPushToken(),
    ]);

    // Send notification (optimized)
    const sendStart = Date.now();
    const result = await sendTestExpoNotification(token, 'Test Notification', 'This is a test from dev build');
    const sendTime = Date.now() - sendStart;

    const totalTime = Date.now() - startTime;

    return { sendTime, totalTime, result };
  } catch (error) {
    const totalTime = Date.now() - startTime;
    throw { sendTime: 0, totalTime, error };
  }
}
