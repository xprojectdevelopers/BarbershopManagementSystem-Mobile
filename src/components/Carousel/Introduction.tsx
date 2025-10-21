import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated
} from 'react-native';

const { width } = Dimensions.get('window');

const introductionData = [
  {
    id: '1',
    title: 'MLV ST.',
    text: 'Sign up or Log in to your account to experience a smoother and more convenient way to book your appointments.'
  },
  {
    id: '2',
    title: 'MLV ST.',
    text: 'Discover amazing hair content that grabs your attention and motivates you to level up your look with the street style haircut.'
  },
  {
    id: '3',
    title: 'MLV ST.',
    text: 'Molave Street Barbers is now closer to you, right on your phone, making it easy to book your appointments anytime, anywhere.'
  },
];

const IntroductionCarousel = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<{ id: string; title: string; text: string; }>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index % introductionData.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % introductionData.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }: { item: { id: string; title: string; text: string; } }) => (
    <View style={styles.slide}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={introductionData}
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
        {introductionData.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 30, 10],
            extrapolate: 'clamp',
          });
          return <Animated.View key={index.toString()} style={[styles.dot, { width: dotWidth }]} />;
        })}
      </View>
    </View>
  );
};

export default IntroductionCarousel;

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
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    bottom: 130,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Oswald-Bold',
    marginBottom: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 450,
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
