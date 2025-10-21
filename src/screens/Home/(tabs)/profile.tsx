import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigations';
import { useAuth } from '../../../contexts/AuthContext';
import { getProfileById, CustomerProfile } from '../../../lib/supabase/profileFunctions';
import { useEffect } from 'react';
import ChangePasswordModal from '../../../components/Modals/changePassword';
import AccountInfoModal from '../../../components/Modals/accountInfo';

//icons
import { Ionicons, MaterialIcons, Feather, FontAwesome6 } from '@expo/vector-icons';

type ProfileSettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GetStarted' | 'About'
>;

export default function ProfileSettingsScreen() {

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isAccountInfoModalVisible, setIsAccountInfoModalVisible] = useState(false);

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



  const settingsItems = [
    {
      id: 1,
      title: 'About us',
      icon: 'information-circle' as const,
      iconLibrary: 'Ionicons' as const,
      hasSwitch: false,
    },
    {
      id: 2,
      title: 'Change password',
      icon: 'lock-closed' as const,
      iconLibrary: 'Ionicons' as const,
      hasSwitch: false,
    },
    {
      id: 3,
      title: 'Account Information',
      icon: 'person' as const,
      iconLibrary: 'Ionicons' as const,
      hasSwitch: false,
    },
    {
      id: 4,
      title: 'Logout',
      icon: 'log-out-outline' as const,
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
    const colors = ['#000', '#000', '#000', '#ff4444'];
    return colors[index] || '#000';
  };

  const getIconBackground = (index: number) => {
    const backgrounds = ['#f0f0f0', '#f0f0f0', '#f0f0f0', '#f0f0f0'];
    return backgrounds[index] || '#f0f0f0';
  };

  const getTextColor = (index: number) => {
    const colors = ['#000', '#000', '#000', '#ff4444'];
    return colors[index] || '#000';
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
            <Text style={styles.locationText}>{profile?.email || ''}</Text>
          </View>

          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Change Photo</Text>
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
              onPress={() => {
                if (item.id === 1) {
                  navigation.navigate('About');
                } else if (item.id === 2) {
                  setIsChangePasswordModalVisible(true);
                } else if (item.id === 3) {
                  setIsAccountInfoModalVisible(true);
                } else if (item.id === 4) {
                  handleLogout();
                }
              }}
            >
              <View style={styles.settingsItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBackground(index) }]}>
                  {renderIcon(item.icon, item.iconLibrary, getIconColor(index))}
                </View>
                <Text style={[styles.settingsItemText, { color: getTextColor(index) }]}>{item.title}</Text>
              </View>

              <View style={styles.settingsItemRight}>
                {index !== 3 && (
                  <View style={styles.rightContent}>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>


      </ScrollView>

      <ChangePasswordModal
        visible={isChangePasswordModalVisible}
        onClose={() => setIsChangePasswordModalVisible(false)}
        onConfirm={() => {
          console.log('Password change confirmed');
        }}
      />

      <AccountInfoModal
        visible={isAccountInfoModalVisible}
        onClose={() => setIsAccountInfoModalVisible(false)}
      />
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
    borderWidth: 1,
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
    fontFamily: 'Satoshi-Bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Satoshi-Bold',
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
});