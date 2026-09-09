import "./global.css";
import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import QuickActionBar from "./components/QuickActionBar";
import LandingScreen from "./screens/LandingScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import CheckoutScreen from "./screens/CheckoutScreen";

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export default function App() {
  const [showQuickAction, setShowQuickAction] = useState(false);

  const handleStateChange = () => {
    if (navigationRef.isReady()) {
      const options = navigationRef.getCurrentOptions();
      // Defaults to true unless explicitly set to false in screen options
      setShowQuickAction(options?.quickAction !== false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        className="flex-1 bg-slate-950"
        edges={["top", "left", "right"]}
      >
        <NavigationContainer
          ref={navigationRef}
          onReady={handleStateChange}
          onStateChange={handleStateChange}
        >
          <View className="flex-1">
            <Stack.Navigator
              initialRouteName="Landing"
              screenOptions={{
                headerShown: false,
                quickAction: true, // Default: show on all main app screens
              }}
            >
              {/* Auth / Onboarding flows (No QuickActionBar) */}
              <Stack.Screen
                name="Landing"
                component={LandingScreen}
                options={{ quickAction: false }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ quickAction: false }}
              />

              {/* Main App flows */}
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{ quickAction: false }}
              />
            </Stack.Navigator>
          </View>

          {/* Persistent global bottom bar */}
          {showQuickAction && <QuickActionBar />}
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}