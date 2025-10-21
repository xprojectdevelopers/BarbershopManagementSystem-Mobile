import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Introduction from '../../components/Carousel/Introduction';

type GetStartedNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoginOptions' | 'SignUpOptions'
>;

export default function GetStarted() {
  const navigation = useNavigation<GetStartedNavigationProp>();
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(require('../../../assets/img/bg.mp4'));

  player.loop = true;
  player.muted = true;
  player.play();

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Brightness Filter Overlay */}
      <View style={[StyleSheet.absoluteFill, styles.brightnessOverlay]} />
      
      <Introduction />
      {/* Buttons Overlay */}
      <View style={[styles.logRegButton, { bottom: 120 + insets.bottom }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('LoginOptions')}
          style={styles.loginBtn}
        >
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUpOptions')}
          style={styles.signUpBtn}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brightnessOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logRegButton: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  loginBtn: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 15,
    width: 320,
    height: 50,
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  signUpBtn: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 30,
    width: 320,
    height: 50,
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
});
