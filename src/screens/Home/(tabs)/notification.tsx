import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'

//icons
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

// supabase
import { supabase } from '../../../lib/supabase/client';

// auth
import { useAuth } from '../../../contexts/AuthContext';

// notification
import { useNotification } from '../../../contexts/notificationContext';

// components
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

interface NotifItem {
  id: string;
  user_id: string;
  receipt_id?: string;
  title: string;
  description?: string;
  created_at: string;
  read: boolean;
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

const formatTime = (timeString: string | undefined) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
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
    return 'Cancel Appointment';
  }
};

interface NotificationProps {
  onUnreadUpdate?: (count: number) => void;
}

export default function Notification({ onUnreadUpdate }: NotificationProps) {
  const { width, height } = useWindowDimensions();
  const { user, loading: authLoading, refreshSession } = useAuth();
  const { expoPushToken } = useNotification();

  const [activeTab, setActiveTab] = useState('Notification');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationRetry, setNotificationRetry] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [statusLoading, setStatusLoading] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [notificationViewerVisible, setNotificationViewerVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotifItem | null>(null);

  // New states for selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    // Exit selection mode when switching tabs
    setSelectionMode(false);
    setSelectedNotifications(new Set());
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
        const { data, error } = await supabase
          .from('appointment_sched')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching appointments:', error);
        } else {
          setAppointments(data || []);
        }
      };
      fetchAppointments();

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
            notificationTimeoutRef.current = setTimeout(() => {
              setNotificationRetry(true);
            }, 10000);
          } else {
            setNotifications(data || []);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
          notificationTimeoutRef.current = setTimeout(() => {
            setNotificationRetry(true);
          }, 10000);
        } finally {
          setNotificationLoading(false);
        }
      };
      fetchNotifications();
    } else if (!authLoading) {
      setStatusLoading(true);
      setShowRetry(false);
      retryTimeoutRef.current = setTimeout(() => {
        setStatusLoading(false);
        setShowRetry(true);
      }, 30000);
    }
  }, [user, authLoading]);

  const hasUnread = notifications.some(n => !n.read);

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notification_loader')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        setNotifications(prev => {
          const updated = prev.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
          );
          if (onUnreadUpdate) {
            const newUnreadCount = updated.filter(n => !n.read).length;
            onUnreadUpdate(newUnreadCount);
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notification_loader')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      } else {
        setNotifications(prev => {
          const updated = prev.map(notif => ({ ...notif, read: true }));
          if (onUnreadUpdate) {
            onUnreadUpdate(0);
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationPress = (notification: NotifItem) => {
    if (selectionMode) {
      toggleNotificationSelection(notification.id);
    } else {
      handleMarkAsRead(notification.id);
      setSelectedNotification(notification);
      setNotificationViewerVisible(true);
    }
  };

  const handleNotificationLongPress = (id: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedNotifications(new Set([id]));
    }
  };

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };



  const handleMarkSelectedAsRead = async () => {
    try {
      const idsToMark = Array.from(selectedNotifications);
      const { error } = await supabase
        .from('notification_loader')
        .update({ read: true })
        .in('id', idsToMark);

      if (error) {
        console.error('Error marking notifications as read:', error);
      } else {
        setNotifications(prev => {
          const updated = prev.map(notif =>
            selectedNotifications.has(notif.id) ? { ...notif, read: true } : notif
          );
          if (onUnreadUpdate) {
            const newUnreadCount = updated.filter(n => !n.read).length;
            onUnreadUpdate(newUnreadCount);
          }
          return updated;
        });
        setSelectionMode(false);
        setSelectedNotifications(new Set());
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notification_loader')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
      } else {
        setNotifications(prev => {
          const updated = prev.filter(notif => notif.id !== id);
          if (onUnreadUpdate) {
            const newUnreadCount = updated.filter(n => !n.read).length;
            onUnreadUpdate(newUnreadCount);
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

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
              const fetchNotifications = async () => {
                try {
                  const { data, error } = await supabase
                    .from('notification_loader')
                    .select('*')
                    .eq('user_id', user?.id)
                    .order('created_at', { ascending: false });

                  if (error) {
                    console.error('Error fetching notifications:', error);
                    notificationTimeoutRef.current = setTimeout(() => {
                      setNotificationRetry(true);
                    }, 10000);
                  } else {
                    setNotifications(data || []);
                  }
                } catch (error) {
                  console.error('Error fetching notifications:', error);
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
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notif,
              selectedNotifications.has(notification.id) && styles.notifSelected
            ]}
            onPress={() => handleNotificationPress(notification)}
            onLongPress={() => handleNotificationLongPress(notification.id)}
          >
            {selectionMode && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => toggleNotificationSelection(notification.id)}
              >
                <View style={[
                  styles.squareCheckbox,
                  selectedNotifications.has(notification.id) && styles.squareCheckboxChecked
                ]}>
                  {selectedNotifications.has(notification.id) && (
                    <Ionicons name="checkmark" size={18} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            )}
            <View style={styles.notifIconContainer}>
              <Fontisto name={notification.read ? "bell" : "bell-alt"} size={24} color="white" />
              {!notification.read && <View style={styles.newNotifDot} />}
            </View>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{notification.title}</Text>
              <Text style={styles.notifText} numberOfLines={1} ellipsizeMode="tail">{notification.description}</Text>
              <Text style={styles.notifTime}>{new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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

    const uniqueAppointments = appointments.filter((appt, index, self) =>
      index === self.findIndex(a => a.id === appt.id)
    );

    return (
      <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
        {uniqueAppointments.map((appointment) => (
          <View key={appointment.id} style={styles.notif}>
            <View style={styles.notifIconContainer}>
              <MaterialCommunityIcons name="stool-outline" size={24} color="white" />
            </View>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{formatDate(appointment.sched_date)}</Text>
              <Text style={styles.notifText}>Appointment Status:
               <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> {formatStatus(appointment.status)}</Text>
              </Text>
              <Text style={styles.notifTime}>{formatTime(appointment.sched_time)}</Text>
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
    const { error } = await supabase
      .from('appointment_sched')
      .update({ status: 'Cancelled' })
      .eq('id', selectedAppointment.id);

    if (!error) {
      console.log('Appointment cancelled successfully');

      try {
        const { sendNotification } = useNotification();

        await sendNotification(
          'Appointment Cancelled',
          `Your appointment on ${formatDate(selectedAppointment.sched_date)} has been cancelled.`,
          { appointmentId: selectedAppointment.id, action: 'cancelled' }
        );

        console.log('Cancellation notification sent successfully');
      } catch (notificationError) {
        console.log('Error sending cancellation notification:', notificationError);
      }

      const { data: refetchData, error: refetchError } = await supabase
        .from('appointment_sched')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (refetchError) {
        console.error('Error refetching appointments:', refetchError);
      } else {
        setAppointments(refetchData || []);
      }
      setSelectedAppointment({ ...selectedAppointment, status: 'Cancelled' });
      setModalVisible(false);
    } else {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Action buttons for Notification Tab */}
      {activeTab === 'Notification' && (
        <View style={styles.actionBarContainer}>
          {selectionMode ? (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={() => {
                setSelectionMode(false);
                setSelectedNotifications(new Set());
              }}>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleSelectAll}>
                <Text style={styles.actionText}>
                  {selectedNotifications.size === notifications.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
              <View style={styles.actionBtnGroup}>
                <TouchableOpacity
                  style={[styles.iconActionBtn, selectedNotifications.size === 0 && styles.disabledActionBtn]}
                  onPress={handleMarkSelectedAsRead}
                  disabled={selectedNotifications.size === 0}
                >
                  <Ionicons name="checkmark-done" size={20} color={selectedNotifications.size === 0 ? "#999" : "black"} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={handleMarkAllAsRead}>
                <Text style={styles.actionText}>Mark All as Read</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectionMode(true)}>
                <Ionicons name="checkmark-circle-outline" size={20} color="black" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

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

        {activeTab === 'Notification' ? renderNotificationContent() : renderStatusContent()}
      </View>

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
            <Text style={styles.appointmentBarberText}>Barber: {getBarberName(selectedAppointment?.barber_id || '')}</Text>
            <Text style={styles.appointmentServiceText}>Service: {getServiceName(selectedAppointment?.service_id || '')}</Text>
            <Text style={styles.appointmentDateText}>Date: {selectedAppointment ? formatDate(selectedAppointment.sched_date) : ''}</Text>
            <Text style={styles.appointmentTimeText}>Time: {formatTime(selectedAppointment?.sched_time)}</Text>
            <Text style={styles.appointmentTotalText}>Total: ₱{selectedAppointment?.total}</Text>
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
  outerContainer: {
    flex: 1,
  },
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
    top: 160,
    borderRadius: 10,
  },
  notif: {
    width: '100%',
    height: 90,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#efefefef'
  },
  notifSelected: {
    backgroundColor: '#f0f0f0',
    borderColor: '#000',
    borderWidth: 2,
  },
  notifIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#000',
  },
  notifText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notifTime: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#999',
  },
  viewBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  viewText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: 'white',
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
  receiptBarberText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: 'black',
    top: 5,
  },
  receiptServiceText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: 'black',
    top: 10,
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
  newNotifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: 'red',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  deleteBtn: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 90,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkboxContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  squareCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  squareCheckboxChecked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  actionBarContainer: {
    position: 'absolute',
    top: 190,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 1000,
  },
  actionBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    top: 2,
    gap: 5,
  },
  actionText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: 'black',
    right: 15
  },
  actionBtnGroup: {
    flexDirection: 'row',
    gap: 15,
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledActionBtn: {
    opacity: 0.5,
  },
})