import { View, Text, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-4">
      <Text className="text-2xl font-bold text-white mb-4">Home Screen</Text>
      <TouchableOpacity 
        className="bg-slate-800 px-5 py-3 rounded-xl border border-slate-700"
        onPress={() => navigation.navigate("Checkout")}
      >
        <Text className="text-slate-200">Go to Checkout (Hides Bar)</Text>
      </TouchableOpacity>
    </View>
  );
}