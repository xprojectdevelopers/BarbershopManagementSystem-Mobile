import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  Dimensions, 
  Animated, 
  FlatList, 
  NativeSyntheticEvent, 
  NativeScrollEvent,
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'

const { width } = Dimensions.get('window')

interface CarouselProps {
  images: any[]
  autoplay?: boolean
  autoPlayInterval?: number
  style?: any
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  autoplay = true,
  autoPlayInterval = 3000,
  style,
}) => {

  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (autoplay && images && images.length > 1) {
      const interval = setInterval(() => {
        if (flatListRef.current) {
          const nextIndex = (currentIndex + 1) % images.length // Fixed: was using & instead of %
          setCurrentIndex(nextIndex)
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true
          })
        }
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [currentIndex, autoplay, autoPlayInterval, images])

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  )

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset
    const index = Math.round(contentOffset.x / width)
    setCurrentIndex(index)
  }

  const renderItem = ({ item, index }: any) => {
    return (
      <View style={styles.itemContainer}>
        <Image
          source={item}
          style={styles.imageStyle}
          resizeMode='cover'
        />
      </View>
    )
  }

  const renderDotIndicators = () => {
    if (!images || images.length <= 1) return null
    return (
      <View style={styles.dotContainer}>
        {images.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          })
          
          const dotWidth = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [8, 24, 8],
            extrapolate: 'clamp'
          })
          
          return (
            <Animated.View 
              key={index}
              style={[styles.dot, { opacity, width: dotWidth }]}
            />
          )
        })}
      </View>
    )
  }

  const renderPageIndicator = () => {
    if (!images || images.length <= 1) return null

    return (
      <View style={styles.pageIndicator}>
        <Text style={styles.pageIndicatorText}>
          {currentIndex + 1} / {images.length}
        </Text>
      </View>
    )
  }

  return (
    <View style={style}>
      {renderPageIndicator()}

      <Animated.FlatList 
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={32}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index
        })}
      />
      {renderDotIndicators()}
    </View>
  )
}

export default Carousel

const styles = StyleSheet.create({
  itemContainer: {
    width: width,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  imageStyle: {
    width: '100%',
    height: 380,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1
  },
  dotContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  dot: {
    height: 8,
    backgroundColor: '#000000ff',
    borderRadius: 4,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 2,
  },
  pageIndicator: {
    position: 'absolute', 
    top: 15, 
    right: 25, 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15, 
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  pageIndicatorText: {
    color: 'white', 
    fontSize: 12, 
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
  }
})