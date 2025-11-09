import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

//icons
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';

interface BottomTabProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  unreadNotifications?: number;
}

export default function BottomTab({ activeTab, onTabPress, unreadNotifications }: BottomTabProps) {
  const tabs = [
    {
      key: 'Home',
      label: 'Home',
      icon: 'home',
      activeIcon: 'home',
      IconComponent: SimpleLineIcons
    },
    {
      key: 'Notification',
      label: 'Notification',
      icon: 'bell-outline',
      activeIcon: 'bell',
      IconComponent: MaterialCommunityIcons
    },
    {
      key: 'Profile',
      label: 'Profile',
      icon: 'user',
      activeIcon: 'user',
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
              <View style={styles.iconContainer}>
                <IconComponent
                  name={((tab.key === 'Notification' && unreadNotifications && unreadNotifications > 0) ? tab.activeIcon : tab.icon) as any}
                  size={25}
                  color={isActive ? '#000000ff' : '#666666'}
                  style={styles.tabIcon}
                />
                {tab.key === 'Notification' && unreadNotifications && unreadNotifications > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadNotifications > 99 ? '99+' : unreadNotifications.toString()}
                    </Text>
                  </View>
                )}
              </View>
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
    top: 30
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
    bottom: 20
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
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
  }
})
