import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

//icons
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';

interface BottomTabProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function BottomTab({ activeTab, onTabPress }: BottomTabProps) {
  const tabs = [
    {
      key: 'Home',
      label: 'Home',
      icon: 'home',
      IconComponent: SimpleLineIcons
    },
    {
      key: 'Appointment',
      label: 'Appointment',
      icon: 'stool-outline',
      IconComponent: MaterialCommunityIcons
    },
    {
      key: 'Profile',
      label: 'Profile',
      icon: 'user',
      IconComponent: Feather
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bottomTab}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.IconComponent;
          
          return (
            <TouchableOpacity 
              key={tab.key}
              style={styles.tabButton}
              onPress={() => onTabPress(tab.key)}
            >
              <IconComponent
                name={tab.icon} 
                size={25} 
                color={isActive ? '#000000ff' : '#666666'} 
                style={styles.tabIcon} 
              />
              <Text style={[
                styles.bottomTabText,
                { color: isActive ? '#000000ff' : '#666666' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  bottomTab: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    height: 70,
    paddingHorizontal: 20,
    gap: 70
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    textAlign: 'center',
    marginBottom: 4,
  },
  bottomTabText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    textAlign: 'center',
  }
})