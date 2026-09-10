import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Home, Package, Wallet, Repeat, User } from "lucide-react-native";

export default function QuickActionBar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [currentRouteName, setCurrentRouteName] = useState("Home");

  const tabs = [
    { name: "Home", label: "Home", icon: Home },
    { name: "Orders", label: "Orders", icon: Package },
    { name: "Wallet", label: "Wallet", icon: Wallet },
    { name: "Subs", label: "Subs", icon: Repeat },
    { name: "Profile", label: "Profile", icon: User },
  ];

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();

      const updateActiveRoute = () => {
        const route = parent?.getState()?.routes?.find(
          (route) => route.key === parent?.getState()?.key
        );

        const currentRoute = parent?.getCurrentRoute?.();

        if (currentRoute?.name) {
          setCurrentRouteName(currentRoute.name);
        }
      };

      updateActiveRoute();

      const unsubscribe = navigation.addListener("state", updateActiveRoute);

      return unsubscribe;
    }, [navigation])
  );

  const handleTabPress = (tabName) => {
    if (currentRouteName === tabName) {
      return;
    }

    setCurrentRouteName(tabName);
    navigation.navigate(tabName);
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

