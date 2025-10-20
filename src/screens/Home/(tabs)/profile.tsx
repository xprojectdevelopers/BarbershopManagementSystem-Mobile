import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigations';
import { useAuth } from '../../../contexts/AuthContext';
import { deleteProfile, getProfileById, CustomerProfile } from '../../../lib/supabase/profileFunctions';
import { Alert } from 'react-native';
import { useEffect } from 'react';

//icons
import { Ionicons, MaterialIcons, Feather, FontAwesome6 } from '@expo/vector-icons';

type ProfileSettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GetStarted'
>;

export default function ProfileSettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  const toggleDarkMode = () => setDarkMode(previousState => !previousState);

  const navigation = useNavigation<ProfileSettingsScreenNavigationProp>();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { success, data } = await getProfileById(user.id);
        if (success) {
          setProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'GetStarted' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (user?.id) {
              try {
                const { success, error } = await deleteProfile(user.id);
                if (success) {
                  await signOut();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'GetStarted' }],
                  });
                } else {
                  Alert.alert('Error', (error as Error)?.message || 'Failed to delete account');
                }
              } catch (error) {
                Alert.alert('Error', 'An unexpected error occurred');
              }
            }
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      id: 1,
      title: 'Dark Mode',
      icon: 'moon' as const,
      iconLibrary: 'Feather' as const,
      hasSwitch: true,
      switchValue: darkMode,
      onSwitchToggle: toggleDarkMode,
    },
    {
      id: 2,
      title: 'Notifications',
      icon: 'notifications' as const,
      iconLibrary: 'Ionicons' as const,
      hasSwitch: false,
      status: 'On',
    },
    {
      id: 4,
      title: 'Security',
      icon: 'lock-closed' as const,
      iconLibrary: 'Ionicons' as const,
      hasSwitch: false,
    },
    {
      id: 5,
      title: 'Account',
      icon: 'person' as const,
      iconLibrary: 'Ionicons' as const,
      hasSwitch: false,
    },
  ];

  const renderIcon = (iconName: string, iconLibrary: string, color: string) => {
    switch (iconLibrary) {
      case 'Ionicons':
        return <Ionicons name={iconName as any} size={24} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} size={24} color={color} />;
      case 'Feather':
        return <Feather name={iconName as any} size={24} color={color} />;
      default:
        return <Ionicons name={iconName as any} size={24} color={color} />;
    }
  };

  const getIconColor = (index: number) => {
    const colors = ['#000', '#000', '#000', '#000'];
    return colors[index] || '#000';
  };

  const getIconBackground = (index: number) => {
    const backgrounds = ['#f0f0f0', '#f0f0f0', '#f0f0f0', '#f0f0f0'];
    return backgrounds[index] || '#f0f0f0';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileLetterContainer}>
              <FontAwesome6 name="user" size={40} color="white" />
            </View>
          </View>
          <Text style={styles.profileName}>{profile?.display_name || 'User'}</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>{profile?.username || ''}</Text>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={() => navigation.navigate('PushNotifScreen')}>
            <Text style={styles.upgradeButtonText}>Test Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Settings</Text>

          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingsItem}
              disabled={item.hasSwitch}
            >
              <View style={styles.settingsItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackground(index) }]}>
                  {renderIcon(item.icon, item.iconLibrary, getIconColor(index))}
                </View>
                <Text style={styles.settingsItemText}>{item.title}</Text>
              </View>

              <View style={styles.settingsItemRight}>
                {item.hasSwitch ? (
                  <Switch
                    trackColor={{ false: '#E0E0E0', true: '#E91E63' }}
                    thumbColor={item.switchValue ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#E0E0E0"
                    onValueChange={item.onSwitchToggle}
                    value={item.switchValue}
                    style={styles.switch}
                  />
                ) : (
                  <View style={styles.rightContent}>
                    {item.status && (
                      <Text style={styles.statusText}>{item.status}</Text>
                    )}
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <View style={styles.logoutContent}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={24} color="#ff4444" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
          <View style={styles.deleteContent}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </View>
            <Text style={styles.deleteText}>Delete Account</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileSection: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileLetterContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLetter: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  upgradeButton: {
    backgroundColor: '#000',
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 25,
    marginLeft: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsItemText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },

  logoutButton: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    borderRadius: 24,
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  logoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#fff0f0',
  },
  logoutText: {
    fontSize: 18,
    color: '#ff4444',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    borderRadius: 24,
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  deleteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  deleteIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#fff0f0',
  },
  deleteText: {
    fontSize: 18,
    color: '#ff4444',
    fontWeight: '500',
  },
});
