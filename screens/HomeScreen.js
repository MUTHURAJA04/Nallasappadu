import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import {
  ShoppingCart,
  ChefHat,
  Star,
  ChevronRight,
  Phone,
  MessageCircle,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const horizontalPadding = 9;

  const handleCall = () => {
    Linking.openURL("tel:+919442623056");
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      "https://wa.me/919442623056?text=Hi%20Nallasappadu!"
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-[#f4f8f1]"
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingTop: Math.max(insets.top + 8, 14),
        paddingBottom: 30,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* PREMIUM */}
      <View className="items-center">
        <View className="bg-[#fff8d6] border border-[#f4d34d] px-3 py-1 rounded-full">
          <Text className="text-[#9a6800] text-[11px] font-semibold">
            ☆ Premium Member
          </Text>
        </View>
      </View>

      {/* TITLE */}
      <Text className="text-[32px] leading-[38px] font-extrabold text-[#07152b] text-center mt-4">
        What's cooking{"\n"}today?
      </Text>

      {/* MAIN CARDS */}
      <View className="mt-5" style={{ gap: 11 }}>

        {/* QUICK ORDERS */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Orders")}
          style={{
            width: "100%",
            height: 79,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={["#2860ed", "#4437c9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: "100%",
              height: "100%",
              paddingHorizontal: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View className="flex-row items-center flex-1">
              <View
                style={{
                  width: 51,
                  height: 51,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.20)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <ShoppingCart
                  size={26}
                  color="#fff"
                  strokeWidth={2.2}
                />
              </View>

              <View className="flex-1">
                <Text className="text-white text-[15px] font-bold">
                  Quick Orders
                </Text>

                <Text className="text-blue-100 text-[10px] mt-[2px]">
                  Next: Fri, Sep 11 • 🌙 Dinner
                </Text>
              </View>
            </View>

            <View className="items-end justify-center">
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.22)",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                  marginBottom: 4,
                }}
              >
                <Text className="text-white text-[9px] font-bold">
                  Fast Order
                </Text>
              </View>

              <ChevronRight
                size={18}
                color="#fff"
                strokeWidth={2.4}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* THIS WEEK'S MENU */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Menu")}
          style={{
            width: "100%",
            height: 79,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={["#0eaa68", "#09975e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: "100%",
              height: "100%",
              paddingHorizontal: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View className="flex-row items-center flex-1">
              <View
                style={{
                  width: 51,
                  height: 51,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.20)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <ChefHat
                  size={26}
                  color="#fff"
                  strokeWidth={2.2}
                />
              </View>

              <View className="flex-1">
                <Text className="text-white text-[15px] font-bold">
                  This Week's Menu
                </Text>

                <Text className="text-emerald-100 text-[10px] mt-[2px]">
                  Authentic Chettinad flavors daily
                </Text>
              </View>
            </View>

            <ChevronRight
              size={18}
              color="#fff"
              strokeWidth={2.4}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* SUBSCRIBE */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Subs")}
          style={{
            width: "100%",
            height: 79,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={["#ffb21b", "#ff7114"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: "100%",
              height: "100%",
              paddingHorizontal: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View className="flex-row items-center flex-1">
              <View
                style={{
                  width: 51,
                  height: 51,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.20)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Star
                  size={26}
                  color="#fff"
                  strokeWidth={2.2}
                />
              </View>

              <View className="flex-1">
                <Text className="text-white text-[15px] font-bold">
                  Subscribe & Save
                </Text>

                <Text className="text-amber-100 text-[10px] mt-[2px]">
                  Save 10% on food • 20% on delivery
                </Text>
              </View>
            </View>

            <ChevronRight
              size={18}
              color="#fff"
              strokeWidth={2.4}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* DELIVERY TITLE */}
      <View className="items-center mt-7 mb-2">
        <Text className="text-[10px] font-semibold text-[#94a3b8] tracking-[2px]">
          WE DELIVER EVERY DAY
        </Text>
      </View>

      {/* DELIVERY CARDS */}
      <View
        className="flex-row"
        style={{
          width: "100%",
          gap: 8,
        }}
      >
        {/* BREAKFAST */}
        <View
          style={{
            flex: 1,
            height: 97,
            backgroundColor: "#fff",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#edf0e8",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-[22px] mb-1">🌅</Text>

          <Text className="text-[12px] font-bold text-[#172033]">
            Breakfast
          </Text>

          <Text className="text-[10px] text-[#64748b] mt-[2px]">
            By 8:00 AM
          </Text>
        </View>

        {/* LUNCH */}
        <View
          style={{
            flex: 1,
            height: 97,
            backgroundColor: "#fff",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#edf0e8",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-[22px] mb-1">☀️</Text>

          <Text className="text-[12px] font-bold text-[#172033]">
            Lunch
          </Text>

          <Text className="text-[10px] text-[#64748b] mt-[2px]">
            By 12:00 PM
          </Text>
        </View>

        {/* DINNER */}
        <View
          style={{
            flex: 1,
            height: 97,
            backgroundColor: "#fff",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#dbe4ee",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-[22px] mb-1">🌙</Text>

          <Text className="text-[12px] font-bold text-[#172033]">
            Dinner
          </Text>

          <Text className="text-[10px] text-[#64748b] mt-[2px]">
            By 6:00 PM
          </Text>
        </View>
      </View>

      {/* NEED HELP */}
      <View
        className="mt-6 rounded-2xl p-5 items-center"
        style={{
          backgroundColor: "#e4f6d9",
          borderWidth: 1,
          borderColor: "#d2edc8",
        }}
      >
        <Text className="text-[15px] font-bold text-[#064e3b] mb-3">
          Need Help?
        </Text>

        <View
          className="flex-row w-full"
          style={{ gap: 8 }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCall}
            className="flex-1 bg-[#075a3f] h-12 rounded-xl flex-row items-center justify-center"
          >
            <Phone
              size={17}
              color="#fff"
              strokeWidth={2.3}
            />

            <Text className="text-white font-bold text-[12px] ml-2">
              Call Us
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleWhatsApp}
            className="flex-1 bg-[#12b978] h-12 rounded-xl flex-row items-center justify-center"
          >
            <MessageCircle
              size={17}
              color="#fff"
              strokeWidth={2.3}
            />

            <Text className="text-white font-bold text-[12px] ml-2">
              WhatsApp Us
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}