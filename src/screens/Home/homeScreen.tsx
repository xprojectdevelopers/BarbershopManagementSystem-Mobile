import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Linking
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { getProfileById } from '../../lib/supabase/profileFunctions';
import MonthlyAnnouncement from '../../components/Carousel/monthlyAnnouncement';

// Components
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
  const [activeTab, setActiveTab] = useState('Home');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

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

  const renderHomeContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Icon */}
     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
       <TouchableOpacity onPress={() => setActiveTab('Profile')} style={styles.profile}>
        {profileImageUri ? (
          <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
        ) : (
          <FontAwesome6 name="user" size={20} color="white" />
        )}
      </TouchableOpacity>
      <View style={styles.badges}>
        <Text style={{color: 'white', fontFamily: 'Satoshi-Bold', fontSize: 16 }}>Molave Street Legends</Text>
      </View>
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
        <View style={styles.StreetCutContext1}>
          <TouchableOpacity onPress={() => navigation.navigate('Appointment')}>
            <Image
              source={require('../../../assets/img/Get Started with StreetCut/img1.jpg')}
              style={styles.StreetCutImage1}
            />
          </TouchableOpacity>
            <Text style={styles.StreetCutTitle1}>Book an Appointment</Text>
            <Text style={styles.StreetCutText1}>Your Chair is Waiting for You</Text>
        </View>
         <View style={styles.StreetCutContext2}>
          <TouchableOpacity onPress={() => navigation.navigate('HairContent')}>
            <Image 
              source={require('../../../assets/img/Get Started with StreetCut/img2.jpg')}
              style={styles.StreetCutImage2}
            />
          </TouchableOpacity>
            <Text style={styles.StreetCutTitle2}>Learn More</Text>
            <Text style={styles.StreetCutText2}>Hair Contents for You</Text>
        </View>
         <View style={styles.StreetCutContext3}>
          <TouchableOpacity onPress={() => Linking.openURL('https://molavestreetbarbers.vercel.app/about')}>
            <Image 
              source={require('../../../assets/img/Get Started with StreetCut/img3.jpg')}
              style={styles.StreetCutImage2}
            />
          </TouchableOpacity>
            <Text style={styles.StreetCutTitle3}>See More</Text>
            <Text style={styles.StreetCutText3}>Discover Our Unique Story</Text>
        </View>
         <View style={styles.StreetCutContext4}>
          <TouchableOpacity onPress={() => Linking.openURL('https://molavestreetbarbers.vercel.app/about')}>
            <Image 
              source={require('../../../assets/img/Get Started with StreetCut/img4.jpg')}
              style={styles.StreetCutImage3}
            />
          </TouchableOpacity>
            <Text style={styles.StreetCutTitle4}>Click Now</Text>
            <Text style={styles.StreetCutText4}>Know your Favorite Barber</Text>
        </View>
      </ScrollView>
    <Text style={styles.haircutInspirations}>Haircut Inspirations</Text>
    <HaircutInspiration />
    <SocialMedia />
    <Text style={styles.monthlyInspirations}>Monthly Announcements</Text>
    <MonthlyAnnouncement />
    </ScrollView>
  );

  const renderNotificationContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <Notification />
    </ScrollView>
  );

  const fetchProfileImage = async () => {
    if (user?.id) {
      const profileResult = await getProfileById(user.id);
      if (profileResult.success && profileResult.data?.profile_image_url) {
        setProfileImageUri(profileResult.data.profile_image_url);
      } else {
        setProfileImageUri(null);
      }
    }
  };

  const renderProfileContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
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

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.contentContainer}>{renderContent()}</View>

      {/* Fixed BottomTab */}
      <View style={[styles.bottomTabContainer, { bottom: insets.bottom }]}>
        <BottomTab activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  profile: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
    marginTop: 60,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  profileText: {
    fontSize: 30,
    fontFamily: 'Satoshi-Bold',
    color: 'white',
  },
  badges: {
    backgroundColor: '#000000ff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 20,
    marginTop: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    marginLeft: 15,
    marginTop: 30,
    marginBottom: 30,
  },
  scrollContainer: {
    height: 560,
    bottom: 90
  },
  scrollContainerContent: {
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  StreetCutContext1: {
    alignItems: 'center',
    marginRight: 10,
  },
  StreetCutImage1: {
    width: 300,
    height: 350,
    borderRadius: 10,
    marginBottom: 10,
  },
  StreetCutContext2: {
    alignItems: 'center',
    marginRight: 10,
  },
   StreetCutContext3: {
    alignItems: 'center',
    marginRight: 10,
  },
  StreetCutContext4: {
    alignItems: 'center',
    marginRight: 10,
  },
  StreetCutImage2: {
    width: 300,
    height: 350,
    borderRadius: 10,
    marginBottom: 10,
  },
  StreetCutImage3: {
    width: 300,
    height: 350,
    borderRadius: 10,
    marginBottom: 10,
  },
  image1: {
    width: 380,
    height: 380,
    borderRadius: 10,
    marginBottom: 20,
  },
  bookBtn: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 30,
    width: 150,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 110,
  },
  bookBtnText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  bottomTabContainer: {
    position: 'absolute',
    top: 760,
    left: 0,
    right: 0,
    zIndex: 1000,
    minHeight: 80,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  StreetCutTitle1: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    right: 80,
  },
  StreetCutText1: {
    fontSize: 19,
    fontFamily: 'Satoshi-Bold',
    right: 25,
  },
  StreetCutTitle2: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    right: 115,
  },
  StreetCutText2: {
    fontSize: 19,
    fontFamily: 'Satoshi-Bold',
    right: 56,
  },
  StreetCutTitle3: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    right: 120,
  },
  StreetCutText3: {
    fontSize: 19,
    fontFamily: 'Satoshi-Bold',
    right: 33,
  },
  StreetCutTitle4: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    right: 110,
  },
  StreetCutText4: {
    fontSize: 19,
    fontFamily: 'Satoshi-Bold',
    right: 25,
  },
  haircutInspirations: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    bottom: 90,
    left: 15,
  },
  monthlyInspirations: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    marginTop: 50,
    left: 15,
  },
});
