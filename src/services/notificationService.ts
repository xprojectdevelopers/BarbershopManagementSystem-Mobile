import { supabase } from '../lib/supabase/client';
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotificationAsync';

/**
 * Unified Notification Service
 * Handles all notification-related operations consistently
 */
export class NotificationService {
  private static channel: any = null;

  /**
   * Initialize notification service
   * Registers for push notifications and sets up realtime listeners
   */
  static async initialize() {
    try {
      const token = await registerForPushNotificationsAsync();
      await this.savePushToken(token);
    } catch (error) {
      console.log('Push notifications not available:', error);
    }
    await this.setupRealtimeListeners();
  }

  /**
   * Save push token to customer_profiles table
   */
  private static async savePushToken(token: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('customer_profiles')
        .update({ 
          push_token: token,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    }
  }

  /**
   * Setup realtime listeners for notifications and appointments
   */
  static async setupRealtimeListeners() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    this.channel = supabase.channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => this.handleNewNotification(payload.new))
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'appointment_sched',
        filter: `customer_id=eq.${user.id}`,
      }, (payload) => this.handleNewAppointment(payload.new))
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'appointment_sched',
        filter: `customer_id=eq.${user.id}`,
      }, (payload) => this.handleAppointmentUpdate(payload.old, payload.new))
      .subscribe();
  }

  /**
   * Handle new notification from database
   */
  private static async handleNewNotification(notification: any) {
    await this.sendPushNotification(
      notification.header || notification.title,
      notification.description || notification.body,
      { type: 'notification', notification_id: notification.id }
    );
  }

  /**
   * Handle new appointment booking
   */
  private static async handleNewAppointment(appointment: any) {
    await this.sendPushNotification(
      'Appointment Booked',
      `Your appointment has been confirmed for ${new Date(appointment.sched_date).toLocaleString()}`,
      { type: 'appointment_booked', appointment_id: appointment.id }
    );
  }

  /**
   * Handle appointment status updates
   */
  private static async handleAppointmentUpdate(oldAppointment: any, newAppointment: any) {
    if (oldAppointment.status !== newAppointment.status) {
      let title = '', body = '';
      switch (newAppointment.status) {
        case 'confirmed': 
          title = 'Appointment Confirmed'; 
          body = 'Your appointment has been confirmed'; 
          break;
        case 'cancelled': 
          title = 'Appointment Cancelled'; 
          body = 'Your appointment has been cancelled'; 
          break;
        case 'rescheduled': 
          title = 'Appointment Rescheduled'; 
          body = 'Your appointment has been rescheduled'; 
          break;
        case 'completed': 
          title = 'Appointment Completed'; 
          body = 'Your appointment has been completed'; 
          break;
      }
      
      if (title && body) {
        await this.sendPushNotification(title, body, { 
          type: `appointment_${newAppointment.status}`, 
          appointment_id: newAppointment.id 
        });
      }
    }
  }

  /**
   * Send push notification via Supabase Edge Function
   */
  static async sendPushNotification(
    title: string, 
    body: string, 
    data?: Record<string, any>
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user for notification');
        return { success: false, error: 'No authenticated user' };
      }

      // Get push token from user profile
      const { data: profile, error: profileError } = await supabase
        .from('customer_profiles')
        .select('push_token')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { success: false, error: 'Failed to fetch user profile' };
      }

      if (!profile?.push_token) {
        console.error('No push token found for user');
        // Try to fallback to local notification
        console.log('Falling back to local notification');
        const localResult = await this.sendLocalNotification(title, body, data);
        return localResult;
      }

      const response = await supabase.functions.invoke('sendNotification', {
        body: {
          expoPushToken: profile.push_token,
          title,
          message: body,
          data: data || {},
        },
      });

      if (response.error) {
        console.error('Failed to send push notification:', response.error);
        // Try to fallback to local notification
        console.log('Falling back to local notification due to push failure');
        const localResult = await this.sendLocalNotification(title, body, data);
        return localResult;
      }

      console.log('Push notification sent successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending notification:', error);
      // Try to fallback to local notification
      console.log('Falling back to local notification due to error');
      try {
        const localResult = await this.sendLocalNotification(title, body, data);
        return localResult;
      } catch (localError) {
        console.error('Local notification fallback also failed:', localError);
        return { success: false, error: 'Both push and local notifications failed' };
      }
    }
  }

  /**
   * Send local notification immediately
   */
  static async sendLocalNotification(
    title: string, 
    body: string, 
    data?: Record<string, any>
  ) {
    try {
      const { scheduleNotificationAsync } = await import('expo-notifications');
      await scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
      console.log('Local notification scheduled');
      return { success: true };
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return { success: false, error };
    }
  }

  /**
   * Cleanup realtime listeners
   */
  static async cleanup() {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}