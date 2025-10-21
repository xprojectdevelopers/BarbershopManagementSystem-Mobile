import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Introduction = () => {
  return (
    <View>
      <View style={styles.carousel1}>
        <Text style={styles.title1}>MLV ST.</Text>
        <Text style={styles.text1}>Sign up or Log in to your account to experience a smoother and more convenient way to book your appointments.</Text>
      </View>
      <View style={styles.carousel2}>
        <Text style={styles.title2}>MLV ST.</Text>
        <Text style={styles.text2}>Discover amazing hair content that grabs your attention and motivates you to level up your look with the street style haicut.</Text>
      </View>
      <View style={styles.carousel3}>
        <Text style={styles.title3}>MLV ST.</Text>
        <Text style={styles.text3}>Molave Street Barbers is now closer to you, right on your phone, making it easy to book your appointments anytime, anywhere.</Text>
      </View>
      
    </View>
  )
}

export default Introduction

const styles = StyleSheet.create({
    
})