import React, { useEffect, useCallback, useRef } from "react";
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
import { supabase } from "../lib/supabase";

export default function LandingScreen({ navigation }) {
  const bgProgress = useSharedValue(0);
  const targetRouteRef = useRef({ name: "Login", params: null });

  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor("#020617");
      StatusBar.setBarStyle("light-content");

      return () => {
        StatusBar.setTranslucent(false);
      };
    }, [])
  );

  useEffect(() => {
    console.log("[LandingScreen.js] Initializing landing sequence & checking auth session...");

    const resolveInitialRoute = async () => {
      try {
        console.log("[LandingScreen.js] [supabase.auth.getSession] -> Checking AsyncStorage for cached session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[LandingScreen.js] [supabase.auth.getSession] Error:", sessionError.message);
          targetRouteRef.current = { name: "Login", params: null };
          return;
        }

        if (session?.user) {
          console.log("[LandingScreen.js] Active session found for user:", {
            id: session.user.id,
            phone: session.user.phone,
            expires_at: session.expires_at,
          });

          console.log(
            "[LandingScreen.js] [public.users query] -> Fetching profile data matching uid:",
            session.user.id,
            "or phone:",
            session.user.phone
          );

          // Query matching either UUID or Phone to prevent misrouting
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("id, name, phone")
            .or(`id.eq.${session.user.id},phone.eq.${session.user.phone}`)
            .maybeSingle();

          if (profileError) {
            console.error("[LandingScreen.js] [public.users query] Error:", profileError.message);
            targetRouteRef.current = {
              name: "CompleteProfile",
              params: { phone: session.user.phone, userId: session.user.id },
            };
            return;
          }

          console.log("[LandingScreen.js] [public.users query] Result:", profile);

          if (profile && profile.name) {
            console.log("[LandingScreen.js] Existing profile detected. Routing destination set to -> Home");
            targetRouteRef.current = { name: "Home", params: null };
          } else {
            console.log("[LandingScreen.js] Profile incomplete or missing name. Routing destination set to -> CompleteProfile");
            targetRouteRef.current = {
              name: "CompleteProfile",
              params: { phone: session.user.phone, userId: session.user.id },
            };
          }
        } else {
          console.log("[LandingScreen.js] No active session found. Routing destination set to -> Login");
          targetRouteRef.current = { name: "Login", params: null };
        }
      } catch (err) {
        console.error("[LandingScreen.js] Unexpected error in session check:", err);
        targetRouteRef.current = { name: "Login", params: null };
      }
    };

    resolveInitialRoute();

    // Background animation
    bgProgress.value = withDelay(
      500,
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // Status bar switch
    const statusTimer = setTimeout(() => {
      StatusBar.setBackgroundColor("#ffffff");
      StatusBar.setBarStyle("dark-content");
    }, 1700);

    // Navigation trigger
    const navTimer = setTimeout(() => {
      console.log(
        `[LandingScreen.js] Landing timer complete (2000ms) -> Navigating to [${targetRouteRef.current.name}] with params:`,
        targetRouteRef.current.params
      );
      navigation.replace(
        targetRouteRef.current.name,
        targetRouteRef.current.params
      );
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
      <StatusBar translucent={false} animated={true} />

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