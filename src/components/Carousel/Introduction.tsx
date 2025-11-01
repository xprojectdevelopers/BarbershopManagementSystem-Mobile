import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  PixelRatio, // Import PixelRatio for font scaling
} from 'react-native';

// Get screen dimensions directly at the top level of the file
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Responsive Scaling Constants and Functions ---
// Reference device dimensions (e.g., iPhone 6/7/8) for scaling
const RF_WIDTH_BASE = 375;
const RF_HEIGHT_BASE = 812; // A common reference height for modern phones (e.g., iPhone X)

// Function to scale a size horizontally based on screen width
const scale = (size: number) => (SCREEN_WIDTH / RF_WIDTH_BASE) * size;

// Function to scale a size vertically based on screen height
const verticalScale = (size: number) => (SCREEN_HEIGHT / RF_HEIGHT_BASE) * size;

// Function for moderate scaling (mixes original size with scaled size)
// Useful for elements like border-radius, or sizes that shouldn't scale too aggressively
const moderateScale = (size: number, factor: number = 0.5) => size + (scale(size) - size) * factor;

// Function to get responsive font size, accounting for user's font scale preference
const getResponsiveFontSize = (size: number) => {
  const fontScale = PixelRatio.getFontScale();
  return size / fontScale;
};
// --- End Responsive Scaling ---


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
  // Specify the type for FlatList ref
  const flatListRef = useRef<FlatList<{ id: string; title: string; text: string; }>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    // Ensure index calculation is robust, especially for non-perfect divisions
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index % introductionData.length);
  };

  useEffect(() => {
    // Clear any existing interval if the component unmounts or effect re-runs
    let interval: NodeJS.Timeout;

    // Use a small delay to ensure flatListRef is ready, especially on hot reloads
    const initCarousel = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % introductionData.length;
          // Ensure flatListRef.current exists before calling scrollToIndex
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
          }
          return nextIndex;
        });
      }, 5000); // Auto-scroll every 5 seconds
    }, 100); // Short delay

    return () => {
      clearTimeout(initCarousel); // Clear the initial delay timeout
      if (interval) {
        clearInterval(interval); // Clear the interval
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount


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
        // Use SCREEN_WIDTH here as well
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } // useNativeDriver: true might be possible for scrollX, but needs careful testing with Animated.event
        )}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      <View style={styles.dotsContainer}>
        {introductionData.map((_, index) => {
          // Use SCREEN_WIDTH for inputRange as well
          const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [moderateScale(10), moderateScale(30), moderateScale(10)], // Scale dot width
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
    // This container itself doesn't need flex: 1, as it's positioned within GetStarted.
    // Its size is implicitly determined by its children (FlatList).
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width: SCREEN_WIDTH, // Use SCREEN_WIDTH for each slide to fill the screen
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: moderateScale(40), // Scale horizontal padding
    bottom: verticalScale(130), // Scale vertical position (from bottom)
  },
  title: {
    color: '#fff',
    fontSize: getResponsiveFontSize(28), // Scale font size
    fontFamily: 'Oswald-Bold',
    marginBottom: verticalScale(10), // Scale vertical margin
  },
  text: {
    color: '#fff',
    fontSize: getResponsiveFontSize(16), // Scale font size
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(24), // Scale line height based on font size
  },
  dotsContainer: {
    position: 'absolute',
    bottom: verticalScale(450), // Scale vertical position of dots
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  dot: {
    width: moderateScale(10), // Scale initial dot width
    height: moderateScale(10), // Scale dot height
    borderRadius: moderateScale(5), // Scale border radius
    backgroundColor: 'white',
    marginHorizontal: moderateScale(5), // Scale horizontal margin
  },
});