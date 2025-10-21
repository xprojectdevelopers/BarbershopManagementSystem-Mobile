import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {VideoView, useVideoPlayer} from 'expo-video';
import { RootStackParamList } from "../../types/navigations";

type HairContentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home" // 👈 change this to your actual screen name if not "Home"
>;

const HairContent = () => {
  const navigation = useNavigation<HairContentScreenNavigationProp>();
  const player = useVideoPlayer(require("../../../assets/img/Hair Contents/Hair content.mp4"));

  player.loop = true;
  player.muted = true;
  player.play();

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Header Image + Back Button */}
        <View style={styles.hairImageContent1}>
          <VideoView
                  player={player}
                  style={styles.hairImage1}
                  contentFit="cover"
                  nativeControls={false}
                />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Entypo name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Text Section */}
        <View style={styles.TextSection1}>
          <Text style={styles.Title}>You should know this!</Text>
          <Text style={styles.description}>
            To get a banger haircut, you first need to know your face shape!
            There are six common face shapes: Square, Oblong, Heart, Diamond,
            Circle, and Oval. Knowing your face shape helps you find the
            hairstyle that highlights your best features and suits your overall
            look.
            {"\n"}
            {"\n"}
            If you’re not sure what yours is, our expert barbers will gladly
            help identify your face shape and recommend the most flattering and
            trendy hairstyles that perfectly match you.
          </Text>
        </View>
         <View style={styles.hairImageContent2}>
          <Image
            source={require("../../../assets/img/Hair Contents/DSC_0237.jpg")}
            style={styles.hairImage2}
          />
        </View>
         <View style={styles.TextSection2}>
          <Text style={styles.Title}>Hair care tips for you!</Text>
          <Text style={styles.description}>
            Our hair faces many challenges in our daily lives, such as dryness, lack of volume, and hair loss. To maintain healthy hair, it’s important to know which treatments are best suited for you. 
            {'\n'}{'\n'}
            At Molave Street Barbers, we offer hair washes, hot towel treatments, and other specialized services designed to restore and maintain your hair’s natural health and shine. We also sell product to boost your hair such us pomade, textured powder, spray and more.
          </Text>
        </View>
         <View style={styles.hairImageContent3}>
          <Image
            source={require("../../../assets/img/Hair Contents/DSC_0208.jpg")}
            style={styles.hairImage3}
          />
        </View>
         <View style={styles.TextSection3}>
          <Text style={styles.Title}>Elevate your haircut, now!</Text>
          <Text style={styles.description}>
           We believe that your hair plays a vital role in enhancing your overall appearance and confidence. A well-styled haircut can transform your look, uplift your mood, and help you feel your best every day. At Molave Street Barbers, we make sure your style stands out and your confidence rises with every cut.
          </Text>
        </View>
        <View style={styles.invisible} />
      </View>
    </ScrollView>
  );
};

export default HairContent;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    justifyContent: "center",
  },

  hairImageContent1: {
    bottom: 10,
  },

  hairImageContent2: {
    bottom: 20,
  },

  hairImageContent3: {
    top: 40
  },

  hairImage1: {
    width: "100%",
    height: 500,
    resizeMode: "cover",
  },

  hairImage2: {
    width: "100%",
    height: 500,
    resizeMode: "cover",
    top: 80
  },

  hairImage3: {
    width: "100%",
    height: 500,
    resizeMode: "cover",
    top: 80
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.47)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  TextSection1: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
    bottom: -10,
  },

    TextSection2: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
    top: 80,
  },

  TextSection3: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
    top: 150,
  },

  Title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 26,
    textAlign: "center",
    marginBottom: 20,
  },

  description: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },

  invisible: {
    height: 200,
  }
});
