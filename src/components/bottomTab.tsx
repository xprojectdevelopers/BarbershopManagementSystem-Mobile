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
      key: 'Notification',
      label: 'Notification',
      icon: 'bell-outline',
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
                name={tab.icon as any}
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
    // alignSelf: 'stretch', // Ensure it stretches full width
    width: '100%', // Explicitly set width to 100%
    alignItems: 'center', // Keep content centered horizontally if bottomTab has maxWidth
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth, // Add a subtle top border
    borderTopColor: '#e0e0e0', // Light gray border color
  },
  bottomTab: {
    justifyContent: 'space-around', // Distribute items evenly
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%', // Take full width of its parent container
    // Removed maxWidth to allow it to stretch fully unless explicitly needed
    minHeight: 60, // Slightly reduced minHeight for more flexibility
    paddingHorizontal: 10, // Adjusted padding for better spacing
    paddingVertical: 8,
    // Removed gap property for better responsiveness with space-around
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Each tab button takes equal available space
    paddingVertical: 5, // Added vertical padding for touch area
  },
  tabIcon: {
    textAlign: 'center',
    marginBottom: 4,
  },
  bottomTabText: {
    fontFamily: 'Satoshi-Bold', // Ensure this font is loaded in your project
    fontSize: 12,
    textAlign: 'center',
  }
})