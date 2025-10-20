import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import { NotificationProvider } from "./src/contexts/notificationContext";
import { RootStackParamList } from "./src/types/navigations";
import { createClient } from "@supabase/supabase-js";

// Screens
import GetStarted from "./src/screens/startApp/getStarted";
import Home from "./src/screens/Home/homeScreen";
import LoginOptions from "./src/screens/LogReg/loginOptionsScreen";
import SignUpOptions from "./src/screens/LogReg/signUpOptionsScreen";
import EmailLogin from "./src/screens/LogReg/Email/emailLogin";
import EmailSignup from "./src/screens/LogReg/Email/emailSignup";
import Appointment from "./src/screens/Appointment/appointmentScreen";
import SplashScreen from "./src/screens/startApp/splashScreen";
import PushNotifScreen from "./src/screens/pushNotifScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const supabase = createClient(
  "https://YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
);

// ✅ Notification handler — always show instantly
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    "Satoshi-Bold": require("./assets/fonts/Satoshi-Bold.otf"),
    "Satoshi-Regular": require("./assets/fonts/Satoshi-Regular.otf"),
    "Oswald-Bold": require("./assets/fonts/Oswald-Bold.ttf"),
  });

  useEffect(() => {
    console.log("🔔 Registering notification listener...");

    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const receivedAt = new Date().toISOString();
        console.log("📬 Notification received at:", receivedAt);
        console.log("📦 Payload:", notification.request.content.data);

        // ✅ Send confirmation back to Supabase
        const { error } = await supabase
          .from("notification_logs")
          .update({
            status: "delivered",
            delivered_at: receivedAt,
          })
          .eq("device_token", notification.request.identifier);

        if (error) console.error("❌ Error updating delivery:", error);
        else console.log("✅ Delivery confirmed instantly in Supabase");
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#ffffff" />
          <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="GetStarted" component={GetStarted} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="LoginOptions" component={LoginOptions} />
            <Stack.Screen name="SignUpOptions" component={SignUpOptions} />
            <Stack.Screen name="EmailLogin" component={EmailLogin} />
            <Stack.Screen name="EmailSignup" component={EmailSignup} />
            <Stack.Screen name="Appointment" component={Appointment} />
            <Stack.Screen name="PushNotifScreen" component={PushNotifScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </NotificationProvider>
    </AuthProvider>
  );
}
