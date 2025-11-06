import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigations";
import Entypo from "@expo/vector-icons/Entypo";

import Barbers from "../../components/Carousel/barbers";

// ✅ Define navigation type for "About" screen
type AboutScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList
>;

const About = () => {
  const navigation = useNavigation<AboutScreenNavigationProp>();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {/* 🔹 Header Image Section */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../../../assets/img/Modal Edit Name.png")}
          style={styles.headerImage}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Entypo name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* 🔹 Text Section */}
      <View style={styles.textSection}>
        <Text style={styles.title}>What is MLV ST. and its purpose?</Text>
        <Text style={styles.description}>
          MLV ST. is a mobile application developed by Molave Street Barbers to
          streamline the booking process for customers. The app allows users to
          easily view available time slots, select their preferred barber, and
          book appointments with just a few taps.{"\n\n"}
          The purpose of MLV ST. is to make every visit smooth and convenient by
          reducing waiting time and improving service accessibility. Customers
          can manage their appointments, receive reminders, and explore various
          grooming services offered by Molave Street Barbers.
        </Text>
      </View>

      {/* 🔹 Carousel Section */}
      <View style={styles.carouselContainer}>
        <Barbers />
      </View>
    </ScrollView>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // 🔹 Header Section
  headerContainer: {
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.47)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // 🔹 Text Section
  textSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 26,
    textAlign: "center",
    marginBottom: 15,
    color: "#111",
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },

  // 🔹 Carousel Section
  carouselContainer: {
    marginTop: 40,
  },
});
