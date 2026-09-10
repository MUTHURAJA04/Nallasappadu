import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Package, Wallet, Repeat, User } from "lucide-react-native";
import { navigationRef } from "../App"; // Adjust path to your App file

export default function QuickActionBar() {
  const insets = useSafeAreaInsets();
  const [currentRouteName, setCurrentRouteName] = useState("Home");

  useEffect(() => {
    if (navigationRef.isReady()) {
      const activeScreen = navigationRef.getCurrentRoute()?.name;
      if (activeScreen) {
        setCurrentRouteName(activeScreen);
      }
    }
  }, []);

  const tabs = [
    { name: "Home", label: "Home", icon: Home },
    { name: "Orders", label: "Orders", icon: Package },
    { name: "Wallet", label: "Wallet", icon: Wallet },
    { name: "Subs", label: "Subs", icon: Repeat },
    { name: "Profile", label: "Profile", icon: User },
  ];

  const handleTabPress = (tabName) => {
    console.log(`${tabName} icon tapped`);
    setCurrentRouteName(tabName);

    if (navigationRef.isReady()) {
      navigationRef.navigate(tabName);
    }
  };

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      className="flex-row items-center justify-around bg-white border-t border-gray-200 pt-2 px-2"
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = currentRouteName === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            activeOpacity={0.7}
            className="flex-1 items-center justify-center py-1"
            onPress={() => handleTabPress(tab.name)}
          >
            <IconComponent
              size={24}
              color={isActive ? "#059669" : "#6b7280"}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text
              numberOfLines={1}
              className={`text-xs mt-1 ${
                isActive
                  ? "text-emerald-700 font-bold"
                  : "text-gray-500 font-medium"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}