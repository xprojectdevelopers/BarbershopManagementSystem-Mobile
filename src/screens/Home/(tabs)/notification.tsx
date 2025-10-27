import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Modal, Pressable, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'

//icons
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

// supabase
import { getAppointmentsForUser, updateAppointmentStatus } from '../../../lib/supabase/appointmentFunctions';
import { supabase } from '../../../lib/supabase/client';

// auth
import { useAuth } from '../../../contexts/AuthContext';

// notification
import { useNotification } from '../../../contexts/notificationContext';
import * as Notifications from 'expo-notifications';

// components
import ReceiptModal from '../../../components/Modals/receipt';
import NotificationViewer from '../../../components/Modals/notificationViewer';

interface Appointment {
  id?: string;
  sched_date: string;
  sched_time?: string;
  customer_name?: string;
  total?: number;
  receipt_code?: string;
  status: string;
  barber_id: string;
  service_id: string;
  payment_method?: string;
}

interface Notification {
  id: string;
  user_id: string;
  receipt_id?: string;
  title: string;
  description?: string;
  created_at: string;
}

const barberMap: { [key: string]: string } = {
  'john_doe': 'John Doe',
  'jane_doe': 'Jane Doe',
  'janet_doe': 'Janet Doe',
  'jack_doe': 'Jack Doe',
  'jim_doe': 'Jim Doe'
};

const serviceMap: { [key: string]: string } = {
  '1': 'Haircut(Walk in)',
  '2': 'Reservation(Walk in)',
  '3': 'Haircut/Wash',
  '4': 'Haircut/Hot Towel',
  '5': 'Hairdye/Haircut',
  '6': 'Hair color/Haircut',
  '7': 'Highlights/Haircut',
  '8': 'Balyage/Haircut',
  '9': 'Bleaching/Haircut',
  '10': 'Perm/Haircut',
  '11': 'Rebond/ShortHair',
  '12': 'Rebound/LongHair'
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatStatus = (status: string): string => {
  if (status === 'cancelled') {
    return 'Cancelled';
  }
  return status;
};



const getStatusButtonText = (status: string) => {
  const negativeStatuses = ['Cancelled', 'No Show'];
  const positiveStatuses = ['Approved', 'Completed'];

  if (negativeStatuses.includes(status)) {
    return status;
  } else if (positiveStatuses.includes(status)) {
    return status;
  } else {
    return 'Cancel Appointment'; // Default for other statuses like 'On Going'
  }
};

export default function Notification() {
  const { user, loading: authLoading, refreshSession } = useAuth();
  const { expoPushToken } = useNotification();

  const [activeTab, setActiveTab] = useState('Notification');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationRetry, setNotificationRetry] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [statusLoading, setStatusLoading] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [notificationViewerVisible, setNotificationViewerVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  // Cleanup timeout on unmount or tab change
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      const fetchAppointments = async () => {
        const { success, data } = await getAppointmentsForUser();
        if (success) {
          setAppointments(data || []);
        }
      };
      fetchAppointments();

      // Fetch notifications
      const fetchNotifications = async () => {
        setNotificationLoading(true);
        setNotificationRetry(false);
        try {
          const { data, error } = await supabase
            .from('notification_loader')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching notifications:', error);
            // Set timeout for retry if no data loaded
            notificationTimeoutRef.current = setTimeout(() => {
              setNotificationRetry(true);
            }, 10000);
          } else {
            setNotifications(data || []);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
          // Set timeout for retry if no data loaded
          notificationTimeoutRef.current = setTimeout(() => {
            setNotificationRetry(true);
          }, 10000);
        } finally {
          setNotificationLoading(false);
        }
      };
      fetchNotifications();
    } else if (!authLoading) {
      // No user and auth not loading, start status loading and timeout
      setStatusLoading(true);
      setShowRetry(false);
      // Set 30s timeout
      retryTimeoutRef.current = setTimeout(() => {
        setStatusLoading(false);
        setShowRetry(true);
      }, 30000);
    }
  }, [user, authLoading]);

  const renderNotificationContent = () => {
    if (notificationLoading) {
      return (
        <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.placeholderText}>Loading notifications...</Text>
          </View>
        </ScrollView>
      );
    }

    if (notificationRetry) {
      return (
        <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
          <View style={styles.placeholder}>
            <TouchableOpacity onPress={() => {
              setNotificationRetry(false);
              setNotificationLoading(true);
              // Refetch notifications
              const fetchNotifications = async () => {
                try {
                  const { data, error } = await supabase
                    .from('notification_loader')
                    .select('*')
                    .eq('user_id', user?.id)
                    .order('created_at', { ascending: false });

                  if (error) {
                    console.error('Error fetching notifications:', error);
                    // Set timeout for retry if no data loaded
                    notificationTimeoutRef.current = setTimeout(() => {
                      setNotificationRetry(true);
                    }, 10000);
                  } else {
                    setNotifications(data || []);
                  }
                } catch (error) {
                  console.error('Error fetching notifications:', error);
                  // Set timeout for retry if no data loaded
                  notificationTimeoutRef.current = setTimeout(() => {
                    setNotificationRetry(true);
                  }, 10000);
                } finally {
                  setNotificationLoading(false);
                }
              };
              fetchNotifications();
            }}>
              <Text style={styles.placeholderText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    if (notifications.length === 0) {
      return (
        <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No notifications</Text>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity key={notification.id} style={styles.notif} onPress={() => { setSelectedNotification(notification); setNotificationViewerVisible(true); }}>
            <Fontisto name="bell" size={54} color="black" style={{left: 10, top: 9}}/>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{notification.title}</Text>
              <Text style={styles.notifText}>{notification.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderStatusContent = () => {
    if (authLoading) {
      return (
        <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.placeholderText}>Loading...</Text>
          </View>
        </ScrollView>
      );
    }

    if (!user) {
      if (statusLoading) {
        return (
          <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
            <View style={styles.placeholder}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.placeholderText}>Loading status...</Text>
            </View>
          </ScrollView>
        );
      }

      if (showRetry) {
        return (
          <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
            <View style={styles.placeholder}>
              <TouchableOpacity onPress={() => {
                setShowRetry(false);
                setStatusLoading(true);
                refreshSession();
                retryTimeoutRef.current = setTimeout(() => {
                  setStatusLoading(false);
                  setShowRetry(true);
                }, 30000);
              }}>
                <Text style={styles.placeholderText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      }
    }

    if (appointments.length === 0) {
      return (
        <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No appointments booked</Text>
          </View>
        </ScrollView>
      );
    }

    // Remove duplicates based on appointment id
    const uniqueAppointments = appointments.filter((appt, index, self) =>
      index === self.findIndex(a => a.id === appt.id)
    );

    return (
      <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
        {uniqueAppointments.map((appointment) => (
          <View key={appointment.id} style={styles.notif}>
            <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{formatDate(appointment.sched_date)}</Text>
              <Text style={styles.notifText}>Appointment Status:
               <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> {formatStatus(appointment.status)}</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.viewBtn} onPress={() => { setSelectedAppointment(appointment); setModalVisible(true); }}>
              <Text style={styles.viewText}>View</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  const getBarberName = (id: string) => barberMap[id] || 'Unknown Barber';
  const getServiceName = (id: string) => serviceMap[id] || 'Unknown Service';

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || selectedAppointment.status === 'Cancelled') {
      return;
    }

    console.log('Cancelling appointment...');
    const { success, error } = await updateAppointmentStatus(selectedAppointment.id!, 'Cancelled');
    if (success) {
      console.log('Appointment cancelled successfully');

      // Send cancellation notification using context
      try {
        const { sendNotification } = useNotification();

        // Send push notification
        await sendNotification(
          'Appointment Cancelled',
          `Your appointment on ${formatDate(selectedAppointment.sched_date)} has been cancelled.`,
          { appointmentId: selectedAppointment.id, action: 'cancelled' }
        );

        console.log('Cancellation notification sent successfully');
      } catch (notificationError) {
        console.log('Error sending cancellation notification:', notificationError);
      }

      // Refetch appointments to update the list
      const { success: fetchSuccess, data } = await getAppointmentsForUser();
      if (fetchSuccess) {
        setAppointments(data || []);
      }
      // Update selected appointment status
      setSelectedAppointment({ ...selectedAppointment, status: 'Cancelled' });
      // Close modal
      setModalVisible(false);
    } else {
      console.error('Error cancelling appointment:', error);
      // Optionally show alert to user
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointments</Text>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'Notification' ? styles.activeTabBtn : styles.inactiveTabBtn
          ]}
          onPress={() => handleTabPress('Notification')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'Notification' ? styles.activeTabText : styles.inactiveTabText
          ]}>
            Notification
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'Status' ? styles.activeTabBtn : styles.inactiveTabBtn
          ]}
          onPress={() => handleTabPress('Status')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'Status' ? styles.activeTabText : styles.inactiveTabText
          ]}>
            Status
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render content based on active tab */}
      {activeTab === 'Notification' ? renderNotificationContent() : renderStatusContent()}

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <AntDesign name="close" size={17} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedAppointment ? formatDate(selectedAppointment.sched_date) : ''}</Text>
           <View style={styles.appointmentDetails}>
            <Text style={styles.appointmentTitle}>Appointment Details</Text>
            <Text style={styles.appointmentNameText}>Name: {selectedAppointment?.customer_name}</Text>
            <Text style={styles.appointmentBarberText}>Barber Name: {selectedAppointment ? getBarberName(selectedAppointment.barber_id) : ''}</Text>
            <Text style={styles.appointmentServiceText}>Service: {selectedAppointment ? getServiceName(selectedAppointment.service_id) : ''}</Text>
            <Text style={styles.appointmentDateText}>Date: {selectedAppointment ? formatDate(selectedAppointment.sched_date) : ''}</Text>
            <Text style={styles.appointmentTimeText}>Time: {selectedAppointment?.sched_time}</Text>
            <Text style={styles.appointmentTotalText}>Total: {selectedAppointment?.total}</Text>
           </View>
            <View style={styles.receiptContainer}>
              <Text style={styles.receiptTitle}>Molave Street Barbers</Text>
              <Text style={styles.receiptAddress}>112 Upper Molave Street Payatas B. {'\n'}
                1119 Quezon City, Philippines {'\n'}
                099-999-9999
              </Text>
              <Text style={styles.receiptNumberText}>Appointment Number:</Text>
              <Text style={styles.receiptNumber1Text}>{selectedAppointment?.receipt_code}</Text>
              <Text style={styles.receiptStatusText}>Appointment Status: </Text>
              <Text style={styles.receiptStatus1Text}>{selectedAppointment?.status}</Text>
              <Text style={styles.receiptPaymentText}>Payment Method: </Text>
              <Text style={styles.receiptPayment1Text}>{selectedAppointment?.payment_method || 'Pay in Person'}</Text>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  (selectedAppointment?.status === 'Cancelled' || selectedAppointment?.status === 'No Show' || selectedAppointment?.status === 'Approved' || selectedAppointment?.status === 'Completed') && styles.disabledBtn
                ]}
                onPress={handleCancelAppointment}
                disabled={selectedAppointment?.status === 'Cancelled' || selectedAppointment?.status === 'No Show' || selectedAppointment?.status === 'Approved' || selectedAppointment?.status === 'Completed'}
              >
                <Text style={styles.cancelBtnText}>
                  {getStatusButtonText(selectedAppointment?.status || '')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
      <Modal
        visible={notificationViewerVisible}
        transparent={true}
        onRequestClose={() => setNotificationViewerVisible(false)}
      >
        <NotificationViewer
          visible={notificationViewerVisible}
          onClose={() => setNotificationViewerVisible(false)}
          notification={selectedNotification}
        />
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Satoshi-Bold',
    top: 100,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    width: 380,
    height: 50,
    backgroundColor: '#d1d1d1ff',
    top: 120,
    justifyContent: 'center',
    borderRadius: 15
  },
  tabBtn: {
    width: 170,
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabBtn: {
    backgroundColor: 'white',
  },
  inactiveTabBtn: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 17,
    textAlign: 'center',
    bottom: 1
  },
  activeTabText: {
    color: 'black',
  },
  inactiveTabText: {
    color: '#666666',
  },
  notifBox: {
    width: 380,
    height: 530,
    top: 150,
    borderRadius: 10,
  },
  notif: {
    width: 380,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9e9e9eff',
    marginBottom: 10
  },
  notifContent: {
    left: 70,
    bottom: 40,
  },
  notifTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    marginBottom: 5
  },
  notifText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#4e4e4eff'
  },
  // Status styles
  statusItem: {
    width: 380,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9e9e9eff',
    marginBottom: 10,
    padding: 15,
  },
  statusTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    marginBottom: 8,
    color: 'black',
  },
  statusText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#4e4e4eff',
    marginBottom: 8,
    lineHeight: 20,
  },
  statusTime: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#999999',
    alignSelf: 'flex-end',
  },
  viewBtn: {
    bottom: 75,
    left: 330,
  },
  viewText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: 'black',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  placeholderText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 400,
    height: 800,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    marginBottom: 10,
  },
  appointmentDetails: {
    width: 320,
    height: 250,
    backgroundColor: 'black',
    top: 30,
    padding: 15,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    borderRadius: 50,
    width: 30,
    height: 30,
    backgroundColor: '#d6d6d6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    color: 'white',
    bottom: 5,
  },
  appointmentNameText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: 'white',
    top: 5,
  },
  appointmentBarberText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: 'white',
    top: 5,
  },
  appointmentServiceText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: 'white',
    top: 10,
  },
  appointmentDateText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: 'white',
    top: 15,
  },
  appointmentTimeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: 'white',
    top: 20,
  },
  appointmentTotalText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: 'white',
    top: 25,
  },
  receiptContainer: {
    width: 320,
    height: 400,
    borderWidth: 1,
    top: 70,
    padding: 15,
    alignItems: 'center',
  },
  receiptTitle: {
    fontFamily: 'Oswald-Bold',
    fontSize: 30,
    color: 'black',
    bottom: 5,
  },
  receiptAddress: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: 'black',
    bottom: 7,
    textAlign: 'center',
  },
  receiptNumberText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    color: 'black',
    top: 5,
  },
  receiptNumber1Text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: 'black',
    top: 5,
  },
  receiptStatusText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    color: 'black',
    top: 25,
  },
  receiptStatus1Text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: 'black',
    top: 26,
  },
  receiptPaymentText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    color: 'black',
    top: 45,
  },
  receiptPayment1Text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: 'black',
    top: 46,
  },
  cancelBtn: {
    top: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    width: 250,
    height: 50,
    borderRadius: 30
  },
  cancelBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: 'white',
  },
  disabledBtn: {
    backgroundColor: '#858585ff',
  },
})
