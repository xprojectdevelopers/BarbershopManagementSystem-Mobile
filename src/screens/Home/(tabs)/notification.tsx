import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'

//icons
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Notification() {
  const [activeTab, setActiveTab] = useState('Notification');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const renderNotificationContent = () => (
    <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
      <View style={styles.notif}>
        <Fontisto name="bell" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>New Appointment</Text>
          <Text style={styles.notifText}>You have a new appointment at 12:00 PM on...</Text>
        </View>
      </View>
      <View style={styles.notif}>
        <Fontisto name="bell" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>New Appointment</Text>
          <Text style={styles.notifText}>You have a new appointment at 12:00 PM on...</Text>
        </View>
      </View>
      <View style={styles.notif}>
        <Fontisto name="bell" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>New Appointment</Text>
          <Text style={styles.notifText}>You have a new appointment at 12:00 PM on...</Text>
        </View>
      </View>
      <View style={styles.notif}>
        <Fontisto name="bell" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>New Appointment</Text>
          <Text style={styles.notifText}>You have a new appointment at 12:00 PM on...</Text>
        </View>
      </View>
      <View style={styles.notif}>
        <Fontisto name="bell" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>New Appointment</Text>
          <Text style={styles.notifText}>You have a new appointment at 12:00 PM on...</Text>
        </View>
      </View>
      <View style={styles.notif}>
        <Fontisto name="bell" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>New Appointment</Text>
          <Text style={styles.notifText}>You have a new appointment at 12:00 PM on...</Text>
        </View>
      </View>
      <View style={styles.notif}>
        <Fontisto name="bell" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>New Appointment</Text>
          <Text style={styles.notifText}>You have a new appointment at 12:00 PM on...</Text>
        </View>
      </View>
      <View style={styles.notif}>
        <Fontisto name="bell" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>New Appointment</Text>
          <Text style={styles.notifText}>You have a new appointment at 12:00 PM on...</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderStatusContent = () => (
    <ScrollView style={styles.notifBox} showsVerticalScrollIndicator={false}>
      <View style={styles.notif}>
        <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>9/11/2002</Text>
          <Text style={styles.notifText}>Appointment Status: 
           <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> Confirmed</Text> 
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.notif}>
        <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>9/11/2002</Text>
          <Text style={styles.notifText}>Appointment Status: 
           <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> Confirmed</Text> 
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.notif}>
        <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>9/11/2002</Text>
          <Text style={styles.notifText}>Appointment Status: 
           <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> Confirmed</Text> 
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.notif}>
        <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>9/11/2002</Text>
          <Text style={styles.notifText}>Appointment Status: 
           <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> Confirmed</Text> 
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.notif}>
        <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>9/11/2002</Text>
          <Text style={styles.notifText}>Appointment Status: 
           <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> Confirmed</Text> 
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.notif}>
        <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>9/11/2002</Text>
          <Text style={styles.notifText}>Appointment Status: 
           <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> Confirmed</Text> 
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.notif}>
        <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>9/11/2002</Text>
          <Text style={styles.notifText}>Appointment Status: 
           <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> Confirmed</Text> 
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.notif}>
        <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>9/11/2002</Text>
          <Text style={styles.notifText}>Appointment Status: 
           <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> Confirmed</Text> 
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.notif}>
        <MaterialCommunityIcons name="stool-outline" size={54} color="black" style={{left: 10, top: 9}}/>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>9/11/2002</Text>
          <Text style={styles.notifText}>Appointment Status: 
           <Text style={{fontFamily: 'Satoshi-Bold', color: 'black' }}> Confirmed</Text> 
          </Text>
        </View>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

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
    height: 590,
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
})