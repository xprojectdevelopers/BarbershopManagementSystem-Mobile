import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  Image,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const Barbers = () => {
  const scrollX = useRef(new Animated.Value(0)).current;

  const images = [
    require("../../../assets/img/barbers/Group 15.png"),
    require("../../../assets/img/barbers/Rectangle 14.png"),
    require("../../../assets/img/barbers/Rectangle 15.png"),
    require("../../../assets/img/barbers/Rectangle 16.png"),
    require("../../../assets/img/barbers/Rectangle 17.png"),
    require("../../../assets/img/barbers/Rectangle 18.png"),
    require("../../../assets/img/barbers/Rectangle 19.png"),
    require("../../../assets/img/barbers/Rectangle 20.png"),
    require("../../../assets/img/barbers/Rectangle 21.png"),
    require("../../../assets/img/barbers/Rectangle 22.png"),
  ];

  // Duplicate once for seamless looping
  const duplicatedImages = [...images, ...images];

  useEffect(() => {
    const totalWidth = (width * 0.6 + 10) * images.length; // total scroll distance

    const loopAnimation = () => {
      Animated.timing(scrollX, {
        toValue: -totalWidth,
        duration: 60000, // ⏳ slower animation (60 seconds for full loop)
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        scrollX.setValue(0);
        loopAnimation(); // restart smoothly
      });
    };

    loopAnimation();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.row,
          {
            transform: [
              {
                translateX: scrollX,
              },
            ],
          },
        ]}
      >
        {duplicatedImages.map((src, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={src} style={styles.image} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export default Barbers;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    paddingVertical: 20,
  },
  row: {
    flexDirection: "row",
  },
  imageWrapper: {
    paddingHorizontal: 5, // spacing between images
  },
  image: {
    width: width - 60, // smaller width for smoother animation
    height: 500,
    borderRadius: 10,
    resizeMode: "cover",
  },
});
