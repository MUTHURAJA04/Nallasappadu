import React, { useEffect, useCallback } from "react";
import { Image, StatusBar } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function LandingScreen({ navigation }) {
  const bgProgress = useSharedValue(0);

  // Set the initial dark status bar state when the screen mounts
  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor("#020617", true);
      StatusBar.setBarStyle("light-content", true);
    }, [])
  );

  useEffect(() => {
    // 1. Smooth background color transition
    bgProgress.value = withDelay(
      500,
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // 2. Synchronize Status Bar color to white when the fade begins (500ms delay)
    const statusTimer = setTimeout(() => {
      StatusBar.setBackgroundColor("#ffffff", true);
      StatusBar.setBarStyle("dark-content", true);
    }, 500);

    // 3. Navigate to Login
    const navTimer = setTimeout(() => {
      navigation.replace("Login");
    }, 2000);

    return () => {
      clearTimeout(statusTimer);
      clearTimeout(navTimer);
    };
  }, [navigation, bgProgress]);

  const containerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bgProgress.value,
      [0, 1],
      ["#020617", "#ffffff"]
    );
    return { backgroundColor };
  });

  return (
    <Animated.View
      style={[
        { flex: 1, alignItems: "center", justifyContent: "center" },
        containerStyle,
      ]}
    >
      <StatusBar animated={true} />

      <Image
        source={require("../assets/logo.png")}
        style={{ width: 160, height: 160 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}