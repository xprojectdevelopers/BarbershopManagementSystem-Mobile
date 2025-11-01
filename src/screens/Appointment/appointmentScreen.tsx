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
  Dimensions, // Import Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';
import { insertDropdownSelection, insertNotificationLoader } from '../../lib/supabase/insertFunctions';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { getProfileById } from '../../lib/supabase/profileFunctions';
import { getEmployeeById } from '../../lib/supabase/employeeFunctions';
// import { NotificationService } from '../../services/notificationService';

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

// Get screen dimensions for responsiveness
const { width } = Dimensions.get('window');

interface BarberItem {
  id: string;
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
  const [employeeName, setEmployeeName] = React.useState('');
  const [employeeExpertise, setEmployeeExpertise] = React.useState('');
  const [employeeRestDay, setEmployeeRestDay] = React.useState('');
  const [employeePhoto, setEmployeePhoto] = React.useState('');
  const [restDays, setRestDays] = React.useState<string[]>([]);
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const [tooltip2Visible, setTooltip2Visible] = React.useState(false);
  const [tooltip3Visible, setTooltip3Visible] = React.useState(false);
  const [isBooking, setIsBooking] = React.useState(false);
  const [bookingStep, setBookingStep] = React.useState('');

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
          setEmployeeName(employeeResult.data.Full_Name);
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

  const convertTo12HourFormat = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const convertTo24HourFormat = (time12: string) => {
    const [time, ampm] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    if (ampm.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12;
    } else if (ampm.toLowerCase() === 'am' && hour === 12) {
      hour = 0;
    }
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };



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
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    const bookingStartTime = Date.now();
    setIsBooking(true);
    setBookingStep('Validating appointment details...');

    try {
      console.log('🚀 Starting appointment booking process...');
      console.log('📅 Appointment details:', {
        barber: selectedBarber.label,
        service: selectedService.name,
        date: date.toISOString().split('T')[0],
        time: selectedTime,
        payment: paymentMethod
      });

      setBookingStep('Saving appointment...');
      const result = await insertDropdownSelection({
        barber_id: selectedBarber.label,
        service_id: selectedService.name,
        sched_date: date.toISOString().split('T')[0],
        sched_time: convertTo24HourFormat(selectedTime),
        subtotal,
        appointment_fee: appointmentFee,
        total,
        status: 'On Going',
        payment_method: paymentMethod,
      });

      if (result.success) {
        const bookingTime = Date.now() - bookingStartTime;
        console.log(`✅ Appointment successfully inserted in ${bookingTime}ms!`);

        // Insert notification into notification_loader
        const notificationResult = await insertNotificationLoader(
          'Appointment Booked',
          `Your appointment has been successfully booked for ${formatDate(date)} at ${selectedTime}.`,
          result.data?.[0]?.id ? result.data[0].id.toString() : undefined
        );

        if (notificationResult.success) {
          console.log('✅ Notification inserted into notification_loader');
        } else {
          console.error('❌ Failed to insert notification:', notificationResult.error);
        }

        setBookingStep('Appointment booked successfully!');
        setModalVisible(true);
      } else {
        throw new Error((result.error as any)?.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('❌ Booking error:', error);
      Alert.alert('Booking Error', 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
      setBookingStep('');
    }
  };

  const handlePayInPerson = async () => {
    if (!selectedBarber || !selectedService || !selectedTime || !date) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    const bookingStartTime = Date.now();
    setIsBooking(true);
    setBookingStep('Processing cash payment...');

    try {
      console.log('🚀 Starting cash payment appointment booking...');
      setBookingStep('Saving appointment...');

      const result = await insertDropdownSelection({
        barber_id: selectedBarber.label,
        service_id: selectedService.name,
        sched_date: date.toISOString().split('T')[0],
        sched_time: convertTo24HourFormat(selectedTime),
        subtotal,
        appointment_fee: appointmentFee,
        total,
        status: 'On Going',
        payment_method: 'Cash',
      });

      if (result.success) {
        const bookingTime = Date.now() - bookingStartTime;
        console.log(`✅ Cash payment appointment booked in ${bookingTime}ms!`);

        // Insert notification into notification_loader
        const notificationResult = await insertNotificationLoader(
          'Appointment Booked',
          `Your appointment has been successfully booked for ${formatDate(date)} at ${selectedTime}.`,
          result.data?.[0]?.id ? result.data[0].id.toString() : undefined
        );

        if (notificationResult.success) {
          console.log('✅ Notification inserted into notification_loader');
        } else {
          console.error('❌ Failed to insert notification:', notificationResult.error);
        }

        setBookingStep('Appointment booked successfully!');
        setModalVisible(true);
      } else {
        throw new Error((result.error as any)?.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('❌ Cash booking error:', error);
      Alert.alert('Booking Error', 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
      setBookingStep('');
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
            <Text style={styles.dayOffText}>Name: {employeeName || 'Almer N. Jaquez'}</Text>
            <Text style={styles.dayOffText}>Expertise: {employeeExpertise || 'Haircut'}</Text>
            <Text style={styles.dayOffText}>Rest Day: {employeeRestDay || 'Sunday'}</Text>
          </View>
        </View>

        {/* Barber Selection */}
        <Text style={styles.sectionTitle}>Choose a barber</Text>
        <BarberName onSelect={setSelectedBarber} />

        {/* Service Selection */}
        <Text style={styles.sectionTitle}>Choose a service</Text>
        <Services onSelect={handleServiceSelect} />

        {/* Date Picker */}
        <Text style={styles.sectionTitle}>Choose a date</Text>
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
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Choose a time</Text>
          <Pressable style={styles.timeInfoBtn} onPress={() => setTooltip2Visible(true)}>
            <Ionicons name="information-circle-outline" size={18} color="black" />
          </Pressable>
        </View>
        <TimeSelector onTimeSelect={setSelectedTime} />

        {/* Name Display */}
        <View style={styles.infoDisplayContainer}>
          <Text style={styles.infoDisplayTextTitle}>Your Name</Text>
          <Text style={styles.infoDisplayValue}>{customerName}</Text>
        </View>

        {/* Contact Number Display */}
        <View style={styles.infoDisplayContainer}>
          <Text style={styles.infoDisplayTextTitle}>Your Contact Number</Text>
          <Text style={styles.infoDisplayValue}>{contactNumber}</Text>
        </View>

        {/* Totals */}
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalRowText}>Subtotal</Text>
            <Text style={styles.totalRowText}>₱{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.totalRowText}>Appointment Fee</Text>
              <Pressable onPress={() => setTooltipVisible(true)} style={styles.tooltipIcon}>
                <Ionicons name="information-circle-outline" size={18} color="white" />
              </Pressable>
            </View>
            <Text style={styles.totalRowText}>₱{appointmentFee.toFixed(2)}</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalText}>Total</Text>
            <Text style={styles.grandTotalText}>₱{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnContainer}>
          <View style={styles.paymentMethodHeader}>
            <Text style={styles.paymentMethodTitle}>Payment Method</Text>
            <Pressable style={styles.paymentInfoBtn} onPress={() => setTooltip3Visible(true)}>
              <Ionicons name="information-circle-outline" size={18} color="black" />
            </Pressable>
          </View>
          <TouchableOpacity
            style={[styles.paymentBtn, styles.gcashBtn, isBooking && styles.disabledBtn]}
            onPress={() => handleBookAppointment('GCash')}
            disabled={isBooking}
          >
            <Text style={styles.paymentBtnText}>
              {isBooking && bookingStep.includes('GCash') ? 'Processing...' : 'Pay with Gcash'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentBtn, styles.mayaBtn, isBooking && styles.disabledBtn]}
            onPress={() => handleBookAppointment('Maya')}
            disabled={isBooking}
          >
            <Text style={styles.paymentBtnText}>
              {isBooking && bookingStep.includes('Maya') ? 'Processing...' : 'Pay with Maya'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentBtn, styles.payInPersonBtn, isBooking && styles.disabledBtn]}
            onPress={handlePayInPerson}
            disabled={isBooking}
          >
            <Text style={styles.paymentBtnText}>
              {isBooking && bookingStep.includes('Cash') ? 'Processing...' : 'Pay with Cash'}
            </Text>
          </TouchableOpacity>

          {/* Loading indicator */}
          {isBooking && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{bookingStep}</Text>
            </View>
          )}
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
        onConfirm={() => {
          setModalVisible(false);
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
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 50,
    paddingHorizontal: width * 0.05, // 5% padding on left/right
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30, // Adjust for iOS notch
    left: 20,
    zIndex: 1,
    padding: 5,
  },
  title: {
    marginTop: Platform.OS === 'ios' ? 60 : 30, // Adjust for iOS notch
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 30,
  },
  dayOff: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15, // Added padding
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%', // Take full width
    alignSelf: 'center', // Center horizontally
  },
  boxShadow: {
    shadowColor: '#000000', // Changed to hex for consistency
    shadowOffset: { width: 0, height: 5 }, // Adjusted for better look
    shadowOpacity: 0.1, // Reduced for softer shadow
    shadowRadius: 10, // Adjusted
    elevation: 5, // Android shadow
  },
  dayOffImage: {
    width: width * 0.25, // Responsive width
    height: width * 0.25, // Responsive height (square)
    borderRadius: (width * 0.25) / 2, // Make it a circle
    marginRight: 15, // Use marginRight for spacing
  },
  dayOffContent: {
    flex: 1, // Allow content to take remaining space
  },
  dayOffText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    marginBottom: 5, // Reduced margin
    color: '#333',
  },
  sectionTitle: { // Combined barberText, serviceText, dateText
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
    // Removed fixed 'left: 10', using padding of parent ScrollView
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#b1b1b1',
    borderRadius: 8,
    width: '100%', // Responsive width
    height: 50,
    marginBottom: 10,
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
    fontFamily: 'Satoshi-Regular',
  },
  timeSection: { // Combined 'time'
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    // Removed paddingHorizontal, using parent ScrollView padding
  },
  timeInfoBtn: {
    marginLeft: 5,
    top: 3,
  },
  infoDisplayContainer: { // Combined 'name' and 'contact'
    marginTop: 20,
    // Removed paddingHorizontal, using parent ScrollView padding
  },
  infoDisplayTextTitle: { // Combined nameText and contactText
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#333',
  },
  infoDisplayValue: { // Combined displayText
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    marginTop: 10,
    color: '#000',
  },
  totalContainer: {
    marginTop: 50,
    backgroundColor: 'black',
    borderRadius: 12,
    paddingVertical: 20, // Adjusted padding
    paddingHorizontal: 20,
    width: '100%', // Responsive width
    alignSelf: 'center', // Center horizontally
  },
  totalRow: { // Combined subTotal and AppointmentContainer
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, // Adjusted margin
  },
  totalRowText: { // Combined subTotalText1, AppointmentText1, subTotalText2, AppointmentText2
    fontSize: 18,
    color: 'white',
    fontFamily: 'Satoshi-Bold',
  },
  tooltipIcon: {
    marginLeft: 5,
    top: 2, // Slight adjustment for alignment
  },
  grandTotalRow: { // Combined total
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
    marginTop: 10,
  },
  grandTotalText: { // Combined totalText1 and totalText2
    fontSize: 20,
    color: 'white',
    fontFamily: 'Satoshi-Bold',
  },
  btnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30, // Adjusted margin
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Adjusted margin
    alignSelf: 'flex-start', // Align to start of its container
    marginLeft: width * 0.05, // Align with scrollview content
  },
  paymentMethodTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
  },
  paymentInfoBtn: {
    marginLeft: 5,
    top: -2, // Adjusted
  },
  paymentBtn: { // Common styles for all payment buttons
    padding: 15, // Increased padding for better touch area
    borderRadius: 30,
    marginBottom: 15, // Adjusted margin
    width: '90%', // Responsive width
    alignSelf: 'center', // Center horizontally
  },
  gcashBtn: {
    backgroundColor: '#00a2ff', // Removed extra 'ff' for standard hex color
  },
  mayaBtn: {
    backgroundColor: '#0DB36B',
  },
  payInPersonBtn: {
    backgroundColor: 'black',
  },
  paymentBtnText: { // Combined gcashText, mayaText, payInPersonText
    fontSize: 17,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  loadingContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    width: '90%', // Responsive width
    alignSelf: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: '#666',
    textAlign: 'center',
  },
});