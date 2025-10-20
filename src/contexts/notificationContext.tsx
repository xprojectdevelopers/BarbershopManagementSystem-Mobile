import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { NotificationService } from "../services/notificationService";
import { supabase } from "../lib/supabase/client";

interface NotificationContextType {
  expoPushToken: string | null;
  refreshPushToken: () => Promise<void>;
  sendNotification: (title: string, body: string, data?: Record<string, any>) => Promise<{ success: boolean; error?: any }>;
  sendLocalNotification: (title: string, body: string, data?: Record<string, any>) => Promise<{ success: boolean; error?: any }>;
}

const NotificationContext = createContext<NotificationContextType>({ 
  expoPushToken: null, 
  refreshPushToken: () => Promise.resolve(),
  sendNotification: () => Promise.resolve({ success: false }),
  sendLocalNotification: () => Promise.resolve({ success: false })
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = React.useState<string | null>(null);

  const initializeNotifications = async () => {
    try {
      await NotificationService.initialize();
      // Get token from the service (it will be saved automatically)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('push_token')
          .eq('id', user.id)
          .single();
        setExpoPushToken(profile?.push_token || null);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const refreshPushToken = async () => {
    await initializeNotifications();
  };

  const sendNotification = async (title: string, body: string, data?: Record<string, any>) => {
    return await NotificationService.sendPushNotification(title, body, data);
  };

  const sendLocalNotification = async (title: string, body: string, data?: Record<string, any>) => {
    return await NotificationService.sendLocalNotification(title, body, data);
  };

  useEffect(() => {
    initializeNotifications();
    
    // Cleanup on unmount
    return () => {
      NotificationService.cleanup();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      expoPushToken, 
      refreshPushToken, 
      sendNotification, 
      sendLocalNotification 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};