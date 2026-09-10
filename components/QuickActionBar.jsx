import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function QuickActionBar() {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center justify-around bg-slate-900 border-t border-slate-800 py-11 px-4">
      <TouchableOpacity 
        className="items-center" 
        onPress={() => navigation.navigate("Home")}
      >
        <Text className="text-emerald-400 font-bold text-sm">Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="items-center bg-emerald-600 px-4 py-2 rounded-full" 
        onPress={() => navigation.navigate("Order")}
      >
        <Text className="text-white font-bold text-sm">+ Quick Action</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="items-center" 
        onPress={() => navigation.navigate("Profile")}
      >
        <Text className="text-slate-400 font-semibold text-sm">Profile</Text>
      </TouchableOpacity>
    </View>
  );
}