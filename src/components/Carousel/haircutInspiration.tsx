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
}

const { width } = Dimensions.get('window');
const itemWidth = 350;

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
        x: nextIndex * itemWidth,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [albums.length]);

  useEffect(() => {
    if (albums.length > 0) {
      indicatorWidths.current = albums.map(() => new Animated.Value(8));
      // Set initial active
      if (indicatorWidths.current[currentIndex]) {
        indicatorWidths.current[currentIndex].setValue(28);
      }
    }
  }, [albums]);

  useEffect(() => {
    if (indicatorWidths.current.length > 0) {
      indicatorWidths.current.forEach((width: Animated.Value, index: number) => {
        Animated.timing(width, {
          toValue: index === currentIndex ? 28 : 8,
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
        .from('album')
        .select('id, image_url');

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
    const index = Math.round(scrollPosition / itemWidth);
    setCurrentIndex(index);
    currentIndexRef.current = index;
  };

  const allImages = albums.map((album, index) => ({
    url: album.image_url,
    title: index === 0 ? 'Round Shape' : index === 1 ? 'Square Shape' : 'Haircut Inspiration',
    subtitle: index === 0 ? 'Clean Cut Look' : index === 1 ? 'Trendy Taper Style' : 'Inspiration',
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

      {/* ✅ Fixed numeric indicator outside of ScrollView */}
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
    bottom: 80
  },
  scrollView: {
    width: 350,
    height: 450,
  },
  imageContainer: {
    width: 350,
    height: 450,
    position: 'relative',
  },
  image: {
    width: 350,
    height: 450,
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  textContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
  },
  smallText: {
    color: '#e0e0e0',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  bigText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
  },
  topRightFixed: {
    position: 'absolute',
    top: 20,
    right: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counter: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  baseIndicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    fontFamily: 'Satoshi-Medium',
  },
  noImagesText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
  },
});

export default HaircutInspiration;