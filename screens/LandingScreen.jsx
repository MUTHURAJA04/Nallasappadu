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

  useFocusEffect(
    useCallback(() => {
      // Initial state
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor("#020617");
      StatusBar.setBarStyle("light-content");

      return () => {
        // Restore normal state when leaving Landing
        StatusBar.setTranslucent(false);
      };
    }, [])
  );

  useEffect(() => {
    // Animate background
    bgProgress.value = withDelay(
      500,
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // Change status bar when background becomes light
    const statusTimer = setTimeout(() => {
      StatusBar.setBackgroundColor("#ffffff");
      StatusBar.setBarStyle("dark-content");
    }, 1700);

    // Navigate after animation
    const navTimer = setTimeout(() => {
      navigation.replace("Home");
    }, 2000);

    return () => {
      clearTimeout(statusTimer);
      clearTimeout(navTimer);
    };
  }, [navigation]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        bgProgress.value,
        [0, 1],
        ["#020617", "#ffffff"]
      ),
    };
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
        containerStyle,
      ]}
    >
      <StatusBar
        translucent={false}
        animated={true}
      />

      <Image
        source={require("../assets/logo.png")}
        style={{
          width: 160,
          height: 160,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}