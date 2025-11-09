import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Linking,
  useWindowDimensions
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { getProfileById } from '../../lib/supabase/profileFunctions';
import { getUserBadge } from '../../lib/supabase/badgeFunctions';
import { supabase } from '../../lib/supabase/client';
import MonthlyAnnouncement from '../../components/Carousel/monthlyAnnouncement';

import BottomTab from '../../components/bottomTab';
// Tabs
import Profile from './(tabs)/profile';
import Notification from './(tabs)/notification';
import HaircutInspiration from '../../components/Carousel/haircutInspiration';
import SocialMedia from '../../components/Carousel/socialMedia';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;



export default function HomeScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('Home');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [userBadge, setUserBadge] = useState<string>('None');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Responsive scaling functions
  const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
  const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
  const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

  // Responsive dimensions
  const CARD_WIDTH = SCREEN_WIDTH * 0.8;
  const CARD_HEIGHT = CARD_WIDTH * 1.17; // Maintain aspect ratio

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user?.id) {
        const profileResult = await getProfileById(user.id);
        if (profileResult.success && profileResult.data?.profile_image_url) {
          setProfileImageUri(profileResult.data.profile_image_url);
        }
      }
    };
    fetchProfileImage();
  }, [user]);

  useEffect(() => {
    const fetchUserBadge = async () => {
      if (user?.id) {
        const badgeResult = await getUserBadge(user.id);
        if (badgeResult.success && badgeResult.data?.badge_name) {
          setUserBadge(badgeResult.data.badge_name);
        } else {
          setUserBadge('None');
        }
      }
    };
    fetchUserBadge();

    // Set up real-time subscription for badge changes
    if (user?.id) {
      const channel = supabase
        .channel('badge_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_badges',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && payload.new.badge_name) {
              setUserBadge(payload.new.badge_name);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('notification_loader')
          .select('id')
          .eq('user_id', user.id)
          .eq('read', false);

        if (error) {
          console.error('Error fetching unread notifications:', error);
        } else {
          setUnreadNotifications(data?.length || 0);
        }
      }
    };
    fetchUnreadNotifications();

    // Set up real-time subscription for notifications
    if (user?.id) {
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notification_loader',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            fetchUnreadNotifications(); // Refetch on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  useEffect(() => {
    const backAction = () => {
      if (activeTab === 'Home') {
        BackHandler.exitApp();
        return true;
      } else {
        setActiveTab('Home');
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [activeTab]);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const getBadgeStyle = (badgeName: string) => {
    return {
      backgroundColor: '#000000ff',
      borderRadius: moderateScale(20),
      paddingVertical: verticalScale(6),
      paddingHorizontal: scale(10),
      marginLeft: scale(20),
      marginTop: verticalScale(8),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      alignSelf: 'flex-start' as const,
    };
  };

  const renderHomeContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: verticalScale(120) + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Icon */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Profile')} style={styles.profile}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
          ) : (
            <FontAwesome6 name="user" size={moderateScale(20)} color="white" />
          )}
        </TouchableOpacity>
        {(userBadge === 'Rookie' || userBadge === 'Loyal Customer' || userBadge === 'Molave Street Legend') && (
          <View style={getBadgeStyle(userBadge)}>
            <Text style={styles.badgeText}>{userBadge}</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>Get started with StreetCut</Text>

      {/* Image & Book Button */}
      <ScrollView
        style={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        contentContainerStyle={styles.scrollContainerContent}
      >
        <View style={styles.streetCutContext}>
          <TouchableOpacity onPress={() => navigation.navigate('Appointment')}>
            <Image
              source={require('../../../assets/img/Get Started with StreetCut/img1.jpg')}
              style={styles.streetCutImage}
            />
          </TouchableOpacity>
          <Text style={styles.streetCutTitle}>Book an Appointment</Text>
          <Text style={styles.streetCutText}>Your Chair is Waiting for You</Text>
        </View>
        
        <View style={styles.streetCutContext}>
          <TouchableOpacity onPress={() => navigation.navigate('HairContent')}>
            <Image
              source={require('../../../assets/img/Get Started with StreetCut/img2.jpg')}
              style={styles.streetCutImage}
            />
          </TouchableOpacity>
          <Text style={styles.streetCutTitle}>Learn More</Text>
          <Text style={styles.streetCutText}>Hair Contents for You</Text>
        </View>
        
        <View style={styles.streetCutContext}>
          <TouchableOpacity onPress={() => Linking.openURL('https://molavestreetbarbers.vercel.app/about')}>
            <Image
              source={require('../../../assets/img/Get Started with StreetCut/img3.jpg')}
              style={styles.streetCutImage}
            />
          </TouchableOpacity>
          <Text style={styles.streetCutTitle}>See More</Text>
          <Text style={styles.streetCutText}>Discover Our Unique Story</Text>
        </View>
        
        <View style={styles.streetCutContext}>
          <TouchableOpacity onPress={() => Linking.openURL('https://molavestreetbarbers.vercel.app/about')}>
            <Image
              source={require('../../../assets/img/Get Started with StreetCut/img4.jpg')}
              style={styles.streetCutImage}
            />
          </TouchableOpacity>
          <Text style={styles.streetCutTitle}>Click Now</Text>
          <Text style={styles.streetCutText}>Know your Favorite Barber</Text>
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Haircut Inspirations</Text>
      <HaircutInspiration />
      <SocialMedia />
      <Text style={styles.sectionTitle}>Monthly Announcements</Text>
      <MonthlyAnnouncement />
    </ScrollView>
  );

  const handleUnreadNotificationsUpdate = (newCount: number) => {
    setUnreadNotifications(newCount);
  };

  const renderNotificationContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{ paddingBottom: verticalScale(120) + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <Notification onUnreadUpdate={handleUnreadNotificationsUpdate} />
    </ScrollView>
  );

  const fetchProfileImage = async () => {
    if (user?.id) {
      const profileResult = await getProfileById(user.id);
      if (profileResult.success && profileResult.data?.profile_image_url) {
        setProfileImageUri(profileResult.data.profile_image_url);
      } else {
        setProfileImageUri(null)
      }
    }
  };

  const renderProfileContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{ paddingBottom: verticalScale(120) + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <Profile refreshProfileImage={fetchProfileImage} />
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return renderHomeContent();
      case 'Notification':
        return renderNotificationContent();
      case 'Profile':
        return renderProfileContent();
      default:
        return renderHomeContent();
    }
  };

  const styles = createStyles(scale, verticalScale, moderateScale, SCREEN_WIDTH, CARD_WIDTH, CARD_HEIGHT);

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.contentContainer}>{renderContent()}</View>

      {/* Fixed BottomTab */}
      <View style={[styles.bottomTabContainer, { bottom: insets.bottom }]}>
        <BottomTab activeTab={activeTab} onTabPress={handleTabPress} unreadNotifications={unreadNotifications} />
      </View>
    </View>
  );
}

const createStyles = (scale: (size: number) => number, verticalScale: (size: number) => number, moderateScale: (size: number) => number, SCREEN_WIDTH: number, CARD_WIDTH: number, CARD_HEIGHT: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    marginTop: verticalScale(60),
  },
  profile: {
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(22.5),
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(22.5),
  },
  badges: {
    backgroundColor: '#000000ff',
    borderRadius: moderateScale(20),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    marginLeft: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: SCREEN_WIDTH * 0.55,
  },
  badgeText: {
    color: 'white',
    fontFamily: 'Satoshi-Bold',
    fontSize: moderateScale(17),
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: 'Satoshi-Bold',
    marginLeft: scale(15),
    marginTop: verticalScale(30),
    marginBottom: verticalScale(30),
  },
  scrollContainer: {
    marginBottom: verticalScale(30),
  },
  scrollContainerContent: {
    alignItems: 'center',
    paddingLeft: scale(15),
    paddingRight: scale(15),
  },
  streetCutContext: {
    alignItems: 'flex-start',
    marginRight: scale(15),
    width: CARD_WIDTH,
  },
  streetCutImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(10),
  },
  streetCutTitle: {
    fontSize: moderateScale(14),
    fontFamily: 'Satoshi-Bold',
    marginBottom: verticalScale(4),
  },
  streetCutText: {
    fontSize: moderateScale(19),
    fontFamily: 'Satoshi-Bold',
  },
  sectionTitle: {
    fontSize: moderateScale(24),
    fontFamily: 'Satoshi-Bold',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(15),
    paddingHorizontal: scale(15),
  },
  bottomTabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    minHeight: verticalScale(80),
    backgroundColor: '#fff',
  },
});
