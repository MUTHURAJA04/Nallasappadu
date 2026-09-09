import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");

  const handleLogin = () => {
    // Navigate to Home once authenticated
    navigation.replace("Home");
  };

  return (
    <View className="flex-1 justify-center bg-slate-950 px-6">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Welcome Back</Text>
        <Text className="text-slate-400 text-base">Sign in to start ordering</Text>
      </View>

      <View className="space-y-4 mb-6">
        <TextInput
          placeholder="Phone or Email"
          placeholderTextColor="#64748b"
          value={phone}
          onChangeText={setPhone}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-white text-base"
        />
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        className="w-full bg-emerald-500 py-3.5 rounded-xl items-center shadow-lg shadow-emerald-500/20"
      >
        <Text className="text-white font-bold text-base">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}