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
  TextInput,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';
import { insertDropdownSelection } from '../../lib/supabase/insertFunctions';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../../contexts/AuthContext';
import { getProfileById } from '../../lib/supabase/profileFunctions';

// Icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

// Components
import BarberName from '../../components/Dropdowns/barberName';
import Services from '../../components/Dropdowns/services';
import TimeSelector from '../../components/timeSelector';
import AppointmentAlert from '../../components/Modals/appointmentAlert';
import AppointmentPayment from '../../components/Modals/appointmentPayment';

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
  const [customerName, setCustomerName] = React.useState('');
  const [contactNumber, setContactNumber] = React.useState('');
  const [subtotal, setSubtotal] = React.useState<number>(0);
  const [appointmentFee, setAppointmentFee] = React.useState<number>(50);
  const [total, setTotal] = React.useState<number>(50);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const profileResult = await getProfileById(user.id);
        if (profileResult.success && profileResult.data) {
          setCustomerName(profileResult.data.name || '');
        }
      };
      fetchProfile();
    }
  }, [user]);

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

  const formatPhoneNumber = (input: string) => {
    const digits = input.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);

    let formatted = ''
    if(limitedDigits.length > 0) {
      formatted = limitedDigits
      if(limitedDigits.length > 3) {
        formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
        }
      if (limitedDigits.length > 6) {
          formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
        }
      }
      return formatted
    }

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setContactNumber(formatted);
  }

  const handleBookAppointment = async (paymentMethod: string) => {
    if (!selectedBarber || !selectedService || !selectedTime || !customerName || !contactNumber || !date) {
      alert('Please fill in all fields');
      return;
    }

    console.log('Booking appointment...');

    const result = await insertDropdownSelection({
      barber_id: selectedBarber.value,
      service_id: selectedService.id.toString(),
      sched_date: date.toISOString().split('T')[0],
      sched_time: selectedTime,
      customer_name: customerName,
      contact_number: `+63${contactNumber.replace(/-/g, '')}`,
      subtotal,
      appointment_fee: appointmentFee,
      total,
      status: 'On Going',
      payment_method: paymentMethod,
    });

    if (result.success) {
      console.log('Appointment successfully inserted!');
      // Schedule local notification immediately
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Appointment Booked',
          body: 'Your appointment has been successfully booked.',
          sound: 'default',
          priority: 'high',
        },
        trigger: null,
      });
      // Navigate to home screen immediately
      navigation.navigate('Home', {});
    } else {
      alert('Failed to book appointment. Please try again.');
    }
  };

  const handlePayInPerson = async () => {
    if (!selectedBarber || !selectedService || !selectedTime || !customerName || !contactNumber || !date) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    try {
      await insertDropdownSelection({
      barber_id: selectedBarber.value,
      service_id: selectedService.id.toString(),
      sched_date: date.toISOString().split('T')[0],
      sched_time: selectedTime,
      customer_name: customerName,
      contact_number: `+63${contactNumber.replace(/-/g, '')}`,
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
          <View style={styles.dayOffImage}/>
          <View style={styles.dayOffContent}>
            <Text style={styles.dayOffText}>Name: John Doe</Text>
            <Text style={styles.dayOffText}>Expertise: Haircut</Text>
            <Text style={styles.dayOffText}>Rest Day: Monday</Text>
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
          <Pressable style={styles.timeInfoBtn}>
            <Ionicons name="information-circle-outline" size={18} color="black" />
          </Pressable>
        </View>
        <TimeSelector onTimeSelect={setSelectedTime} />

        {/* Name Input */}
        <View style={styles.name}>
          <Text style={styles.nameText}>Enter your Name</Text>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#505050ff"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.nameInput}
            value={customerName}
            onChangeText={setCustomerName}
          />
        </View>

        {/* Contact Number Input */}
        <View style={styles.contact}>
          <Text style={styles.contactText}>Enter your Contact Number</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCode}>+63</Text>
            </View>
            <TextInput
              placeholder='XXX-XXX-XXXX'
              placeholderTextColor={'#6b7280'}
              keyboardType='phone-pad'
              autoCapitalize='none'
              autoCorrect={false}
              style={styles.phoneInput}
              value={contactNumber}
              onChangeText={handlePhoneNumberChange}
              returnKeyType='done'
            />
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalContainer}>
          <View style={styles.subTotal}>
            <Text style={styles.subTotalText1}>Subtotal</Text>
            <Text style={styles.subTotalText2}>₱{subtotal}</Text>
          </View>

          <View style={styles.AppointmentContainer}>
            <Text style={styles.AppointmentText1}>Appointment Fee</Text>
            <Text style={styles.AppointmentText2}>₱{appointmentFee}</Text>
          </View>

          <View style={styles.total}>
            <Text style={styles.totalText1}>Total</Text>
            <Text style={styles.totalText2}>₱{total}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.gcashBtn} onPress={() => handleBookAppointment('gcash')}>
            <Text style={styles.gcashText}>Pay with Gcash</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mayaBtn} onPress={() => handleBookAppointment('maya')}>
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
           await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Appointment Booked',
              body: 'Your appointment has been successfully booked.',
              sound: 'default',
              priority: 'high',
            },
            trigger: null,
          });
          navigation.navigate('Home', { initialTab: 'Notification' });
        }}
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
    left: 20,
    top: 10,
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
     backgroundColor: 'black', 
     width: 120, 
     height: 120,
     marginLeft: 20 
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
  nameInput: {
    borderWidth: 1, 
    borderColor: '#b1b1b1ff', 
    borderRadius: 8,
    paddingHorizontal: 18, 
    paddingVertical: 12,
    fontSize: 16, 
    fontFamily: 'Satoshi-Regular', 
    backgroundColor: 'white', 
    marginTop: 10, 
    height: 50, 
    width: 370,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeContainer: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    justifyContent: 'center',
    borderColor: '#b1b1b1ff',
    top: 10
  },
  countryCode: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#1f2937',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#ffffffff',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    borderColor: '#b1b1b1ff', 
    paddingVertical: 15,
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    top: 10
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
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
});
