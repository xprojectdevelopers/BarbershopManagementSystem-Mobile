import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigations'

//component
import BottomTab from '../../components/bottomTab'
import Carousel from '../../components/carousel'

//screentabs
import Profile from './(tabs)/profile'
import Notification from './(tabs)/notification'

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList,
  'Appointment'
>

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const renderHomeContent = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profile}>
        <Text style={styles.profileText}>F</Text>
      </View>
      <Text style={styles.title}>Get started with StreetCut</Text>
      <View style={styles.imageContainer}>
        <Image source={require('../../../assets/img/meme.png')} style={styles.image1}/>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Appointment')} 
          style={styles.bookBtn}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.facescanner} />
      <View>
        <Text style={styles.ourWorks}>Our Works</Text>
        <Carousel 
          images={[
            require('../../../assets/img/temp1.png'),
            require('../../../assets/img/temp2.png'),
            require('../../../assets/img/temp3.png'),
            require('../../../assets/img/temp4.png'),
            require('../../../assets/img/temp5.png'),
          ]}
        />
      </View>
    </ScrollView>
  );

  const renderNotificationContent = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <Notification />
    </ScrollView>
  );

  const renderProfileContent = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <Profile />
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return renderHomeContent();
      case 'Appointment':
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
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
      
      {/* Fixed BottomTab with absolute positioning */}
      <View style={styles.bottomTabContainer}>
        <BottomTab 
          activeTab={activeTab} 
          onTabPress={handleTabPress} 
        />
      </View>
    </View>
  )
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
  animatedContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  screenContainer: {
    width: Dimensions.get('window').width,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  profile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
    marginTop: 60,
  },
  profileText: {
    fontSize: 30,
    fontFamily: 'Satoshi-Bold',
    color: 'white'
  },
  title: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    marginLeft: 15,
    marginTop: 30,
    marginBottom: 30,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
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
    bottom: 110
  },
  bookBtnText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  facescanner: {
    width: '95%',
    height: 400,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 30,
  },
  additionalText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
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
  ourWorks: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    marginLeft: 15,
    marginTop: 30,
    marginBottom: 10,
  },
})