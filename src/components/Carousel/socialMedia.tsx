import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Linking, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  Animated 
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const socialMediaData = [
  {
    id: '1',
    title: 'Social Media',
    name: 'Facebook',
    image: require('../../../assets/img/Social Media/img1.jpg'),
    link: 'https://www.facebook.com/MolaveSB'
  },
  {
    id: '2',
    title: 'Social Media',
    name: 'Instagram',
    image: require('../../../assets/img/Social Media/img2.jpg'),
    link: 'https://www.instagram.com/molavestreetsbarbers/'
  },
  {
    id: '3',
    title: 'Social Media',
    name: 'TikTok',
    image: require('../../../assets/img/Social Media/img3.jpg'),
    link: 'https://www.tiktok.com/@molavestreetbarbers'
  },
  {
    id: '4',
    title: 'Google Form',
    name: 'Tell us what you think',
    image: require('../../../assets/img/Social Media/img4.jpg'),
    link: 'https://docs.google.com/forms/d/e/1FAIpQLSfZe_Gh7zizByHCArr5UxzM76bnr6508XSvr8epvkaRnHZuTQ/viewform?usp=header'
  },
];

const SocialMediaCarousel = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<{ id: string; title: string; name: string; image: any; link: string; }>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index % socialMediaData.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % socialMediaData.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

const handlePress = (url: string) => {
    Linking.openURL(url);
  };

const renderItem = ({ item }: { item: { id: string; title: string, name: string; image: any; link: string; } }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.imageOverlay} />
      <View style={styles.textContainer}>
        <Text style={styles.label}>{item.title}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <TouchableOpacity onPress={() => handlePress(item.link)} style={styles.icon}>
          <AntDesign name="right-circle" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={socialMediaData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      <View style={styles.dotsContainer}>
      {socialMediaData.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        });
        return <Animated.View key={index.toString()} style={[styles.dot, { width: dotWidth }]} />;
      })}
    </View>
    </View>
  );
};

export default SocialMediaCarousel;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  image: {
    width: width,
    height: 450,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  textContainer: {
    position: 'absolute',
    bottom: 160,
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Satoshi-Regular'
  },
  name: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'Satoshi-Bold',
    marginVertical: 5,
  },
  icon: {
    marginTop: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 5,
  },
});
