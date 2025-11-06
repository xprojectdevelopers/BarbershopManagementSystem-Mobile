import React, { useState , useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigations';
import { useAuth } from '../../../contexts/AuthContext';
import { getProfileById, CustomerProfile, uploadProfileImage } from '../../../lib/supabase/profileFunctions';
import { getUserBadge, BadgeTracker } from '../../../lib/supabase/badgeFunctions';

import ChangePasswordModal from '../../../components/Modals/changePassword';
import AccountInfoModal from '../../../components/Modals/accountInfo';
import PhotoOptionsModal from '../../../components/Modals/photoOptions';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

//icons
import { Ionicons, MaterialIcons, Feather, FontAwesome6 } from '@expo/vector-icons';

type ProfileSettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GetStarted' | 'About'
>;

export default function ProfileSettingsScreen({ refreshProfileImage }: { refreshProfileImage?: () => void }) {

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isAccountInfoModalVisible, setIsAccountInfoModalVisible] = useState(false);
  const [isPhotoOptionsModalVisible, setIsPhotoOptionsModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraRef, setCameraRef] = useState<any>(null);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [badge, setBadge] = useState<BadgeTracker | null>(null);

  const navigation = useNavigation<ProfileSettingsScreenNavigationProp>();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      if (user?.id) {
        const { success, data } = await getProfileById(user.id);
        if (success && data !== undefined) {
          setProfile(data);
          setProfileImageUri(data.profile_image_url || null);
        }

        // Fetch badge data
        const badgeResult = await getUserBadge(user.id);
        if (badgeResult.success && badgeResult.data) {
          setBadge(badgeResult.data);
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

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

  const onCamera = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        setProfileImageUri(selectedImageUri);
        
        // Upload to Supabase
        if (user?.id) {
          setIsUploading(true);
          const uploadResult = await uploadProfileImage(user.id, selectedImageUri);
          setIsUploading(false);
          
          if (uploadResult.success && uploadResult.data) {
            setProfileImageUri(uploadResult.data);
            Alert.alert('Success', 'Profile image uploaded successfully');

            // Refresh profile data
            const { success, data } = await getProfileById(user.id);
            if (success && data !== undefined) {
              setProfile(data);
            }
            // Refresh home screen profile image
            refreshProfileImage?.();
          } else {
            Alert.alert('Upload Failed', uploadResult.error?.message || 'Failed to upload profile image');
            console.error('Failed to upload profile image:', uploadResult.error);
          }
        }
      }
      setIsPhotoOptionsModalVisible(false);
    } catch (error) {
      setIsUploading(false);
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const onGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is required to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        setProfileImageUri(selectedImageUri);
        
        // Upload to Supabase
        if (user?.id) {
          setIsUploading(true);
          const uploadResult = await uploadProfileImage(user.id, selectedImageUri);
          setIsUploading(false);
          
          if (uploadResult.success && uploadResult.data) {
            setProfileImageUri(uploadResult.data);
            Alert.alert('Success', 'Profile image uploaded successfully');

        // Refresh profile data
        const { success, data } = await getProfileById(user.id);
        if (success && data !== undefined) {
          setProfile(data);
        }
            // Refresh home screen profile image
            refreshProfileImage?.();
          } else {
            Alert.alert('Upload Failed', uploadResult.error?.message || 'Failed to upload profile image');
            console.error('Failed to upload profile image:', uploadResult.error);
          }
        }
      }
      setIsPhotoOptionsModalVisible(false);
    } catch (error) {
      setIsUploading(false);
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const onRemove = async () => {
    try {
      setProfileImageUri(null);

      // Update profile to remove image URL
      if (user?.id) {
        const { updateProfile } = await import('../../../lib/supabase/profileFunctions');
        await updateProfile(user.id, { profile_image_url: null });

        // Refresh profile data
        const { success, data } = await getProfileById(user.id);
        if (success && data) {
          setProfile(data);
        }

        Alert.alert('Success', 'Profile image removed');
        // Refresh home screen profile image
        refreshProfileImage?.();
      }
      setIsPhotoOptionsModalVisible(false);
    } catch (error) {
      console.error('Error removing photo:', error);
      Alert.alert('Error', 'Failed to remove photo. Please try again.');
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
      id: 3,
      title: 'Change password',
      icon: 'lock-closed' as const,
      iconLibrary: 'Ionicons' as const,
      hasSwitch: false,
    },
    {
      id: 4,
      title: 'Account Information',
      icon: 'person' as const,
      iconLibrary: 'Ionicons' as const,
      hasSwitch: false,
    },
    {
      id: 5,
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
    const colors = ['#000', '#000', '#000', '#fff'];
    return colors[index] || '#000';
  };

  const getIconBackground = (index: number) => {
    const backgrounds = ['#f0f0f0', '#f0f0f0', '#f0f0f0', '#ff4444'];
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
            {profileImageUri || profile?.profile_image_url ? (
              <Image source={{ uri: profileImageUri || profile?.profile_image_url! }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileLetterContainer}>
                <FontAwesome6 name="user" size={40} color="white" />
              </View>
            )}
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{profile?.display_name || 'User'}</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>{profile?.email || ''}</Text>
          </View>

          <TouchableOpacity 
            style={styles.upgradeButton} 
            onPress={() => setIsPhotoOptionsModalVisible(true)}
            disabled={isUploading}
          >
            <Text style={styles.upgradeButtonText}>
              {isUploading ? 'Uploading...' : 'Change Photo'}
            </Text>
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
                } else if (item.id === 3) {
                  setIsChangePasswordModalVisible(true);
                } else if (item.id === 4) {
                  setIsAccountInfoModalVisible(true);
                } else if (item.id === 5) {
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
                {index !== 4 && (
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

      <PhotoOptionsModal
        visible={isPhotoOptionsModalVisible}
        onClose={() => setIsPhotoOptionsModalVisible(false)}
        onCamera={onCamera}
        onGallery={onGallery}
        onRemove={onRemove}
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
    position: 'relative',
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
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
