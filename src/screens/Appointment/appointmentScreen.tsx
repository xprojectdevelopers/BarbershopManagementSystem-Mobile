import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, ScrollView, Pressable, TextInput } from 'react-native';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';
import { insertDropdownSelection } from '../../lib/supabase/insertFunctions';

//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

//components
import BarberName from '../../components/Dropdowns/barberName';
import Services from '../../components/Dropdowns/services';
import TimeSelector from '../../components/timeSelector';

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

type AppointmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList,
 'Home'
>
export default function AppointmentScreen() {
  const [date, setDate] = React.useState(new Date());
  const [showPicker, setShowPicker] = React.useState(false);
  const [selectedBarber, setSelectedBarber] = React.useState<BarberItem | null>(null);
  const [selectedService, setSelectedService] = React.useState<ServiceItem | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [customerName, setCustomerName] = React.useState('');
  const [subtotal, setSubtotal] = React.useState<number>(0);
  const [appointmentFee, setAppointmentFee] = React.useState<number>(10);
  const [total, setTotal] = React.useState<number>(10);

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };
  const onChange = (event: any, selectedDate: any) => {
    const { type } = event;
    
    if (type === 'set') {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      
      if (Platform.OS === 'android') {
        toggleDatePicker(); 
      }
    } else {
      toggleDatePicker(); 
    }
  };
  const formatDate = (date: any) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service);
    const servicePrice = parseFloat(service.price.replace('₱', '')) || 0;
    setSubtotal(servicePrice);
    setTotal(servicePrice + appointmentFee);
  };

  const handleBookAppointment = () => {
    if (!selectedBarber || !selectedService || !selectedTime || !customerName) {
      alert('Please fill in all fields');
      return;
    }

    console.log('Selected Barber:', selectedBarber);
    console.log('Selected Service:', selectedService);
    console.log('Selected Date:', date);
    console.log('Selected Time:', selectedTime);
    console.log('Customer Name:', customerName);
    console.log('All selections are good');

    insertDropdownSelection({
      barber_id: selectedBarber.value,
      service_id: selectedService.id.toString(),
      sched_date: date.toISOString().split('T')[0],
      sched_time: selectedTime,
      customer_name: customerName,
      subtotal: subtotal,
      appointment_fee: appointmentFee,
      total: total,
      status: 'pending',
    });
    alert('Appointment booked successfully!');
  };

  const navigation = useNavigation<AppointmentScreenNavigationProp>()

  return (
     <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
        <AntDesign name="arrowleft" size={34} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Book an Appointment</Text>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.dayOff}>
          <Image 
            source={require('../../../assets/img/tempID.png')}
            style={styles.dayOffImage}
          />
          <View style={styles.dayOffContent}>
            <Text style={styles.dayOffText}>Name: John Doe</Text>
            <Text style={styles.dayOffText}>Expertise: Haircut</Text>
            <Text style={styles.dayOffText}>Rest Day: Monday</Text>
          </View>
        </View>
        
        <View>
          <Text style={styles.barberText}>Choose a barber</Text>
          <BarberName onSelect={setSelectedBarber} />

          <Text style={styles.serviceText}>Choose a service</Text>
          <Services onSelect={handleServiceSelect} />

          <Text style={styles.dateText}>Choose a date</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={toggleDatePicker}
          >
            <Text style={styles.dateButtonText}>
              {formatDate(date)}
            </Text>
            <AntDesign name="calendar" size={20} color="#666" />
          </TouchableOpacity>
          
          {showPicker && (
            <DateTimePicker 
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              value={date}
              onChange={onChange}
              minimumDate={new Date()} 
              maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} 
            />
          )}
        </View>
        
        <View style={styles.time}>
          <Text style={styles.timeText}>Choose a time</Text>
          <Pressable style={styles.timeInfoBtn}>
            <Ionicons name="information-circle-outline" size={18} color="black" />
          </Pressable>
        </View>

        <TimeSelector onTimeSelect={setSelectedTime} />

        <View style={styles.name}>
          <Text style={styles.nameText}>Enter your Name</Text>
          <TextInput
            placeholder='Enter your name'
            placeholderTextColor={'#505050ff'}
            autoCapitalize='none'
            autoCorrect={false}
            style={styles.nameInput}
            value={customerName}
            onChangeText={setCustomerName}
          />
        </View>
        <View style={styles.totalContainer}>
          <View style={styles.subTotal}>
            <Text style={styles.subTotalText1}>Subtotal</Text>
            <Text style={styles.subTotalText2}>₱{subtotal}</Text>
          </View>
           <View style={styles.AppointmentContainer}>
            <Text style={styles.AppointmentText1}>Appointment Fee</Text>
            <Pressable style={styles.timeInfoBtn}>
              <Ionicons name="information-circle-outline" size={18} color="white" style={{right: 150}}/>
            </Pressable>
            <Text style={styles.AppointmentText2}>₱{appointmentFee}</Text>
          </View>
          <View style={styles.total}>
            <Text style={styles.totalText1}>Total</Text>
            <Text style={styles.totalText2}>₱{total}</Text>
          </View>
        </View>
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.gcashBtn} onPress={handleBookAppointment}>
          <Text style={styles.gcashText}>Pay with Gcash</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mayaBtn} onPress={handleBookAppointment}>
          <Text style={styles.mayaText}>Pay with Maya</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.payInPersonBtn} onPress={handleBookAppointment}>
          <Text style={styles.payInPersonText}>Pay in person</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
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
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 5,
  },
  title: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 30,
  },
  dayOff: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
    left: 40,
  },
  dayOffImage: {
    width: 120,
    height: 120,
  },
  dayOffContent: {
    marginLeft: 20,
    flex: 1,
  },
  dayOffText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  barberText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
    left: 10,
  },
  serviceText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    marginTop: 20, 
    marginBottom: 10,
    color: '#333',
    left: 10,
  },
  dateText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    top: 2, 
    marginBottom: 10,
    color: '#333',
    left: 10,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#b1b1b1ff',
    borderRadius: 8,
    width: 380,
    height: 50,
    marginBottom: 10,
    left: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Satoshi-Regular',
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  timeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#333',
  },
  timeInfoBtn: {
    marginLeft: 5,
    top: 3
  },
  name: {
    paddingHorizontal: 10,
    marginTop: 40,
  },
  nameText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#333',
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
    width: 380,
  },
  totalContainer: {
    marginTop: 50,
    marginHorizontal: 10, 
    backgroundColor: 'black',
    borderRadius: 12, 
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  subTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
  },
  subTotalText1: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Satoshi-Bold',
  },
  subTotalText2: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Satoshi-Bold',
  },
  AppointmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20, 
  },
  AppointmentText1: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Satoshi-Bold',
    flex: 1, 
  },
  AppointmentText2: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Satoshi-Bold',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
    marginTop: 10,
  },
  totalText1: {
    fontSize: 20, 
    color: 'white',
    fontFamily: 'Satoshi-Bold',
  },
  totalText2: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Satoshi-Bold',
  },
  btnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  gcashBtn: {
    backgroundColor: '#00a2ffff',
    padding: 10,
    borderRadius: 30,
    marginBottom: 20,
    width: 350,
    height: 50,
  },
  gcashText: {
    fontSize: 17,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  mayaBtn: {
    backgroundColor: '#0DB36B',
    padding: 10,
    borderRadius: 30,
    marginBottom: 20,
    width: 350,
    height: 50,
  },
  mayaText: {
    fontSize: 17,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  payInPersonBtn: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 30,
    marginBottom: 20,
    width: 350,
    height: 50,
  },
  payInPersonText: {
    fontSize: 17,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
});