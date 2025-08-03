import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { Image } from 'expo-image';




interface CustomSplashScreenProps {
  onFinish: () => void;
  duration?: number;
  customImage?: any; 
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function CustomSplashScreen({
  onFinish,
  duration = 3000,
  customImage,
  title = "Lambo Mobile",
  subtitle = "Resident Management System",
  backgroundColor = "#ffffff",
  textColor = "#1e40af"
}: CustomSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    const animationSequence = async () => {
      // 1. Fade in and scale up the logo
      await new Promise(resolve => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start(resolve);
      });

      // 2. Slide in and fade in text
      await new Promise(resolve => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(textFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(resolve);
      });

      // 3. Wait for the remaining duration
      await new Promise(resolve => setTimeout(resolve, duration - 1400));

      // 4. Fade out everything
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    };

    animationSequence();
  }, [fadeAnim, scaleAnim, slideAnim, textFadeAnim, onFinish, duration]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo/Image Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={customImage}
            style={{ width: 200, height: 200 }}
            contentFit="contain"
            priority="high"
            cachePolicy="memory-disk"
            placeholder={null}
            transition={0} // No transition for splash screens
            />
        </Animated.View>

        {/* Text Section */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: textColor }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: textColor + '80' }]}>
            {subtitle}
          </Text>
        </Animated.View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    // Ensure crisp rendering
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    marginTop: 20,
  },

}); 