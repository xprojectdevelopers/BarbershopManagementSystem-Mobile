import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  Easing,
} from 'react-native';
import { supabase } from '../../lib/supabase/client';

interface Album {
  id: number;
  image_url: string;
  title_caption: string;
  desc_caption: string;
}

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive card dimensions
const CARD_WIDTH = SCREEN_WIDTH * 0.9; // 90% of screen width
const CARD_HEIGHT = CARD_WIDTH * 1.3; // Maintain aspect ratio

const HaircutInspiration: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollRef = useRef<ScrollView>(null);
  const indicatorWidths = useRef<Animated.Value[]>([]);
  const currentIndexRef = useRef<number>(0);

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (albums.length === 0) return;

    const timer = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % albums.length;
      setCurrentIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      scrollRef.current?.scrollTo({
        x: nextIndex * CARD_WIDTH,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [albums.length]);

  useEffect(() => {
    if (albums.length > 0) {
      indicatorWidths.current = albums.map(() => new Animated.Value(moderateScale(8)));
      // Set initial active
      if (indicatorWidths.current[currentIndex]) {
        indicatorWidths.current[currentIndex].setValue(moderateScale(28));
      }
    }
  }, [albums]);

  useEffect(() => {
    if (indicatorWidths.current.length > 0) {
      indicatorWidths.current.forEach((width: Animated.Value, index: number) => {
        Animated.timing(width, {
          toValue: index === currentIndex ? moderateScale(28) : moderateScale(8),
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start();
      });
    }
  }, [currentIndex]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: albumsData, error: fetchError } = await supabase
        .from('album_mobile')
        .select('id, image_url, title_caption, desc_caption');

      if (fetchError) throw fetchError;
      if (!albumsData) return;

      setAlbums(albumsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setCurrentIndex(index);
    currentIndexRef.current = index;
  };

  const allImages = albums.map((album, index) => ({
    url: album.image_url,
    title: album.title_caption,
    subtitle: album.desc_caption,
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading inspirations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (allImages.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noImagesText}>No haircut inspirations available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
      >
        {allImages.map((item, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
            <View style={styles.overlay} />
            <View style={styles.textContainer}>
              <Text style={styles.smallText}>{item.title}</Text>
              <Text style={styles.bigText}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Fixed numeric indicator */}
      <View style={styles.topRightFixed}>
        <Text style={styles.counter}>
          {currentIndex + 1}/{allImages.length}
        </Text>
      </View>

      {/* Dot indicators with animation */}
      <View style={styles.indicatorContainer}>
        {allImages.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.baseIndicator,
              {
                width: indicatorWidths.current[index],
                backgroundColor: index === currentIndex ? '#000000ff' : '#ccc',
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  scrollView: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: moderateScale(20),
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  textContainer: {
    position: 'absolute',
    bottom: verticalScale(25),
    left: scale(20),
    right: scale(20),
  },
  smallText: {
    color: '#e0e0e0',
    fontSize: moderateScale(14),
    fontFamily: 'Satoshi-Medium',
  },
  bigText: {
    color: '#fff',
    fontSize: moderateScale(20),
    fontFamily: 'Satoshi-Bold',
    flexWrap: 'wrap',
  },
  topRightFixed: {
    position: 'absolute',
    top: verticalScale(20),
    right: scale(40),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  counter: {
    color: 'white',
    fontSize: moderateScale(12),
    fontFamily: 'Satoshi-Medium',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(10),
  },
  baseIndicator: {
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginHorizontal: scale(4),
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(16),
    fontFamily: 'Satoshi-Medium',
  },
  errorText: {
    fontSize: moderateScale(16),
    color: 'red',
    fontFamily: 'Satoshi-Medium',
  },
  noImagesText: {
    fontSize: moderateScale(16),
    fontFamily: 'Satoshi-Medium',
  },
});

export default HaircutInspiration;