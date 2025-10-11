import { registerForPushNotificationsAsync } from "../utils/registerForPushNotificationAsync";
import { EventSubscription } from 'expo-modules-core';
import * as Notifications from "expo-notifications";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { supabase } from "../lib/supabase/client";
import { updateProfile } from "../lib/supabase/profileFunctions";
import { PostgrestError } from "@supabase/supabase-js";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      async (token) => {
        setExpoPushToken(token);
        if (token) {
          const { data, error: authError } = await supabase.auth.getUser();
          if (authError) {
            console.error('Auth error:', authError);
            setError(new Error('Failed to get user'));
            return;
          }
          if (data.user) {
            const { error: profileError } = await updateProfile(data.user.id, { push_token: token });
            if (profileError) {
              console.error('Error updating push token:', profileError);
              setError(new Error((profileError as PostgrestError).message || "Failed to update push token"));
            }
          }
        }
      },
      (error) => setError(error)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response: ",
          JSON.stringify(response.notification.request.content, null, 2)
        );
        // Handle the notification response here
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
