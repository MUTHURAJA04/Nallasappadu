import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function LandingScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <View className="items-center">
        <Text className="text-4xl font-extrabold text-emerald-400 tracking-wider mb-2">
          Nallasappadu
        </Text>
        <Text className="text-slate-400 text-base mb-8">
          Authentic Taste, Served Fast
        </Text>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    </View>
  );
}