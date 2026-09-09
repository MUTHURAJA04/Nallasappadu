import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-4">
      <Text className="text-3xl font-extrabold text-white mb-2">
        Home Screen
      </Text>
      <Text className="text-slate-400 text-center text-base mb-8">
        Welcome to Nallasappadu! Browse top meals below.
      </Text>

      {/* 🔘 Login Button */}
      <TouchableOpacity
        className="bg-emerald-500 py-3 px-8 rounded-full active:opacity-80"
        onPress={handleLoginPress}
      >
        <Text className="text-white text-base font-bold">Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}