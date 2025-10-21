import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';
import { insertDropdownSelection } from '../../lib/supabase/insertFunctions';
import { useAuth } from '../../contexts/AuthContext';
import { getProfileById } from '../../lib/supabase/profileFunctions';
import { getEmployeeById } from '../../lib/supabase/employeeFunctions';
import { getBookedTimesForDateAndBarber } from '../../lib/supabase/appointmentFunctions';
import { NotificationService } from '../../services/notificationService';

// Icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

// Components
import BarberName from '../../components/Dropdowns/barberName';
import Services from '../../components/Dropdowns/services';
import TimeSelector from '../../components/timeSelector';
import AppointmentAlert from '../../components/Modals/appointmentAlert';
import AppointmentPayment from '../../components/Modals/appointmentPayment';
import ToolTip1 from '../../components/Modals/Tooltips/toolTip1';
import ToolTip2 from '../../components/Modals/Tooltips/toolTip2';
import ToolTip3 from '../../components/Modals/Tooltips/tooTip3';

// Supabase

interface BarberItem {
  id: number;
  label: string;
  value: string;
}

interface ServiceItem {
  id: number;
  name: string;
  price: string;
}

type AppointmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AppointmentScreen() {
  const navigation = useNavigation<AppointmentScreenNavigationProp>();
  const { user } = useAuth();

  const [date, setDate] = React.useState<Date | null>(null);
  const [showPicker, setShowPicker] = React.useState(false);
  const [selectedBarber, setSelectedBarber] = React.useState<BarberItem | null>(null);
  const [selectedService, setSelectedService] = React.useState<ServiceItem | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [disabledTimes, setDisabledTimes] = React.useState<string[]>([]);
  const [customerName, setCustomerName] = React.useState('');
  const [contactNumber, setContactNumber] = React.useState('');
  const [subtotal, setSubtotal] = React.useState<number>(0);
  const [appointmentFee, setAppointmentFee] = React.useState<number>(50);
  const [total, setTotal] = React.useState<number>(50);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(true);
  const [employeeName, setEmployeeName] = React.useState('');
  const [employeeExpertise, setEmployeeExpertise] = React.useState('');
  const [employeeRestDay, setEmployeeRestDay] = React.useState('');
  const [employeePhoto, setEmployeePhoto] = React.useState('');
  const [restDays, setRestDays] = React.useState<string[]>([]);
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const [tooltip2Visible, setTooltip2Visible] = React.useState(false);
  const [tooltip3Visible, setTooltip3Visible] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const profileResult = await getProfileById(user.id);
        if (profileResult.success && profileResult.data) {
          setCustomerName(profileResult.data.display_name || profileResult.data.username || '');
          setContactNumber(profileResult.data.contact_number || '');
        }
      };
      fetchProfile();
    }
  }, [user]);

  React.useEffect(() => {
    if (selectedBarber) {
      const fetchEmployee = async () => {
        const employeeResult = await getEmployeeById(selectedBarber.value);
        if (employeeResult.success && employeeResult.data) {
          setEmployeeName(employeeResult.data.full_name);
          setEmployeeExpertise(employeeResult.data.expertise);
          setEmployeePhoto(employeeResult.data.photo);
          const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const workDays = employeeResult.data.work_sched || [];
          const restDays = allDays.filter(day => !workDays.includes(day));
          setEmployeeRestDay(restDays.length > 0 ? restDays.join(', ') : 'No rest day');
          setRestDays(restDays);
        }
      };
      fetchEmployee();
    }
  }, [selectedBarber]);

  React.useEffect(() => {
    // No longer disabling times based on booked slots or rest days
    setDisabledTimes([]);
  }, [selectedBarber, date, restDays]);

  const toggleDatePicker = () => setShowPicker(!showPicker);

  const onChange = (event: any, selectedDate: any) => {
    const { type } = event;
    if (type === 'set') {
      const currentDate = selectedDate;
      setDate(currentDate);
      if (Platform.OS === 'android') toggleDatePicker();
    } else {
      toggleDatePicker();
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service);
    const servicePrice = parseFloat(service.price.replace('₱', '')) || 0;
    setSubtotal(servicePrice);
    setTotal(servicePrice + appointmentFee);
  };



  const handleBookAppointment = async (paymentMethod: string) => {
    if (!selectedBarber || !selectedService || !selectedTime || !date) {
      alert('Please fill in all fields');
      return;
    }

    console.log('Booking appointment...');

    const result = await insertDropdownSelection({
      barber_id: 'Barber - Zed',
      service_id: selectedService.name,
      sched_date: date.toISOString().split('T')[0],
      sched_time: selectedTime,
      subtotal,
      appointment_fee: appointmentFee,
      total,
      status: 'On Going',
      payment_method: paymentMethod,
    });

    if (result.success) {
      console.log('Appointment successfully inserted!');
      setModalVisible(true);
    } else {
      alert('Failed to book appointment. Please try again.');
    }
  };

  const handlePayInPerson = async () => {
    if (!selectedBarber || !selectedService || !selectedTime || !date) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    try {
      await insertDropdownSelection({
      barber_id: `Barber - ${selectedBarber.label}`,
      service_id: selectedService.name,
      sched_date: date.toISOString().split('T')[0],
      sched_time: selectedTime,
      subtotal,
      appointment_fee: appointmentFee,
      total,
      status: 'On Going',
      payment_method: 'Cash',
    });
    setModalVisible(true);
    } catch (error) {
      Alert.alert('Booking Error', 'Failed to book appointment. Please try again.');
      console.error('Booking error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Home', {})}
        style={styles.backBtn}>
        <AntDesign name="arrow-left" size={34} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Book an Appointment</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Barber Info */}
        <View style={[styles.dayOff, styles.boxShadow]}>
           <Image source={require('../../../assets/img/DSC_0332.jpg')} style={styles.dayOffImage} />
          <View style={styles.dayOffContent}>
            <Text style={styles.dayOffText}>Name: Almer N. Jaquez</Text>
            <Text style={styles.dayOffText}>Expertise: Haircut</Text>
            <Text style={styles.dayOffText}>Rest Day: Sunday</Text>
          </View>
        </View>

        {/* Barber Selection */}
        <Text style={styles.barberText}>Choose a barber</Text>
        <BarberName onSelect={setSelectedBarber} />

        {/* Service Selection */}
        <Text style={styles.serviceText}>Choose a service</Text>
        <Services onSelect={handleServiceSelect} />

        {/* Date Picker */}
        <Text style={styles.dateText}>Choose a date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={toggleDatePicker}>
          <Text style={styles.dateButtonText}>{date ? formatDate(date) : 'Choose a date'}</Text>
          <AntDesign name="calendar" size={20} color="#666" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={date || new Date()}
            onChange={onChange}
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
          />
        )}

        {/* Time Selector */}
        <View style={styles.time}>
          <Text style={styles.timeText}>Choose a time</Text>
          <Pressable style={styles.timeInfoBtn} onPress={() => setTooltip2Visible(true)}>
            <Ionicons name="information-circle-outline" size={18} color="black" />
          </Pressable>
        </View>
        <TimeSelector onTimeSelect={setSelectedTime} disabledTimes={disabledTimes} />

        {/* Name Display */}
        <View style={styles.name}>
          <Text style={styles.nameText}>Your Name</Text>
          <Text style={styles.displayText}>{customerName}</Text>
        </View>

        {/* Contact Number Display */}
        <View style={styles.contact}>
          <Text style={styles.contactText}>Your Contact Number</Text>
          <Text style={styles.displayText}>{contactNumber}</Text>
        </View>

        {/* Totals */}
        <View style={styles.totalContainer}>
          <View style={styles.subTotal}>
            <Text style={styles.subTotalText1}>Subtotal</Text>
            <Text style={styles.subTotalText2}>₱{subtotal}</Text>
          </View>

          <View style={styles.AppointmentContainer}>
           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
             <Text style={styles.AppointmentText1}>Appointment Fee</Text>
            <Pressable onPress={() => setTooltipVisible(true)}>
              <Ionicons name="information-circle-outline" size={18} color="white" />
            </Pressable>
           </View>
            <Text style={styles.AppointmentText2}>₱{appointmentFee}</Text>
          </View>

          <View style={styles.total}>
            <Text style={styles.totalText1}>Total</Text>
            <Text style={styles.totalText2}>₱{total}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnContainer}>
         <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, right: 100 }}>
           <Text style={{ fontFamily: 'Satoshi-Bold', fontSize: 16, marginBottom: 10 }}>Payment Method</Text>
          <Pressable style={styles.paymentInfoBtn} onPress={() => setTooltip3Visible(true)}>
            <Ionicons name="information-circle-outline" size={18} color="black" />
          </Pressable>
         </View>
          <TouchableOpacity style={styles.gcashBtn} onPress={() => handleBookAppointment('GCash')}>
            <Text style={styles.gcashText}>Pay with Gcash</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mayaBtn} onPress={() => handleBookAppointment('Maya')}>
            <Text style={styles.mayaText}>Pay with Maya</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.payInPersonBtn} onPress={handlePayInPerson}>
            <Text style={styles.payInPersonText}>Pay with Cash</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <AppointmentAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onConfirm={() => setAlertVisible(false)}
      />
      <AppointmentPayment
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={async () => {
          setModalVisible(false);
          await NotificationService.sendPushNotification(
            'Appointment Booked',
            'Your appointment has been successfully booked.',
            { type: 'appointment_booked' }
          );
          navigation.navigate('Home', { initialTab: 'Notification' });
        }}
      />
      <ToolTip1
        visible={tooltipVisible}
        onClose={() => setTooltipVisible(false)}
      />
      <ToolTip2
        visible={tooltip2Visible}
        onClose={() => setTooltip2Visible(false)}
      />
      <ToolTip3
        visible={tooltip3Visible}
        onClose={() => setTooltip3Visible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1,
      backgroundColor: '#fff'
  },
  scrollContent: {
     paddingBottom: 50
  },
  backBtn: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    zIndex: 1, 
    padding: 5 
  },
  title: { 
    marginTop: 50, 
    textAlign: 'center', 
    fontSize: 22, 
    fontFamily: 'Satoshi-Bold', 
    marginBottom: 30
  },
  dayOff: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    width: 350,
    height: 150,
    marginBottom: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    borderRadius: 20,
  },
  boxShadow: {
    shadowColor: '#000000ff',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  dayOffImage: {
     width: 120,
     height: 120,
     marginLeft: 20,
    },
  dayOffContent: { 
    marginLeft: 20, 
    flex: 1 
  },
  dayOffText: { 
    fontFamily: 'Satoshi-Bold', 
    fontSize: 16, 
    marginBottom: 8, 
    color: '#333' 
  },
  barberText: { 
    fontFamily: 'Satoshi-Bold', 
    fontSize: 18, 
    marginTop: 20,
    marginBottom: 10, 
    color: '#333', 
    left: 10 
  },
  serviceText: { 
    fontFamily: 'Satoshi-Bold', 
    fontSize: 18, 
    marginTop: 20, 
    marginBottom: 10, 
    color: '#333', 
    left: 10 },
  dateText: { 
    fontFamily: 'Satoshi-Bold', 
    fontSize: 18,
    top: 2, 
    marginBottom: 10, 
    color: '#333', 
    left: 10 
  },
  dateButton: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: '#b1b1b1ff', 
    borderRadius: 8,
    width: 370, 
    height: 50, 
    marginBottom: 10, 
    left: 10, 
    paddingHorizontal: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1,
    shadowRadius: 2, 
    elevation: 2,
  },
  dateButtonText: { 
    fontSize: 16, 
    color: '#333', 
    fontFamily: 'Satoshi-Regular' 
  },
  time: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    marginTop: 20 
  },
  timeText: { 
    fontFamily: 'Satoshi-Bold', 
    fontSize: 18, 
    color: '#333' },
  timeInfoBtn: { 
    marginLeft: 5, 
    top: 3 
  },
  name: { 
    paddingHorizontal: 10, 
    marginTop: 40 
  },
  nameText: { 
    fontFamily: 'Satoshi-Bold', 
    fontSize: 18, 
    color: '#333' 
  },

  contact: { 
    paddingHorizontal: 10, 
    marginTop: 20 
  },
  contactText: { 
    fontFamily: 'Satoshi-Bold', 
    fontSize: 18, 
    color: '#333' 
  },

  totalContainer: { 
    marginTop: 50, 
    marginHorizontal: 10, 
    backgroundColor: 'black', 
    borderRadius: 12, 
    paddingVertical: 30, 
    paddingHorizontal: 20 
  },
  subTotal: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  subTotalText1: { 
    fontSize: 18, 
    color: 'white', 
    fontFamily: 'Satoshi-Bold' 
  },
  subTotalText2: { 
    fontSize: 18, 
    color: 'white', 
    fontFamily: 'Satoshi-Bold'
  },
  paymentInfoBtn: {
    marginLeft: 5,
    top: -3
  },
  AppointmentContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 20 
    },
  AppointmentText1: { 
    fontSize: 18, 
    color: 'white', 
    fontFamily: 'Satoshi-Bold' 
  },
  AppointmentText2: { 
    fontSize: 18, 
    color: 'white', 
    fontFamily: 'Satoshi-Bold' 
  },
  total: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#333', 
    paddingTop: 15, 
    marginTop: 10 
  },
  totalText1: { 
    fontSize: 20, 
    color: 'white', 
    fontFamily: 'Satoshi-Bold' 
  },
  totalText2: { 
    fontSize: 20, 
    color: 'white', 
    fontFamily: 'Satoshi-Bold' 
  },
  btnContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 20 
  },
  gcashBtn: { 
    backgroundColor: '#00a2ffff', 
    padding: 10, 
    borderRadius: 30, 
    marginBottom: 20, 
    width: 350, 
    height: 50 
  },
  gcashText: { 
    fontSize: 17, 
    color: 'white', 
    textAlign: 'center', 
    fontFamily: 'Satoshi-Bold' 
  },
  mayaBtn: { 
    backgroundColor: '#0DB36B', 
    padding: 10, 
    borderRadius: 30, 
    marginBottom: 20, 
    width: 350, 
    height: 50 
  },
  mayaText: { 
    fontSize: 17, 
    color: 'white', 
    textAlign: 'center', 
    fontFamily: 'Satoshi-Bold' 
  },
  payInPersonBtn: { 
    backgroundColor: 'black', 
    padding: 10, 
    borderRadius: 30, 
    marginBottom: 20, 
    width: 350, 
    height: 50 
  },
  payInPersonText: {
     fontSize: 17,
     color: 'white',
     textAlign: 'center',
     fontFamily: 'Satoshi-Bold'
  },

  displayText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    marginTop: 10,
    color: '#000',
  },
});
