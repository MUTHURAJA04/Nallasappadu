import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageCircle, Check } from "lucide-react-native";
import { supabase } from "../lib/supabase"; // Adjust path if your file is located elsewhere

const BG_COLOR = "#eef8ef";
const OTP_LENGTH = 6;

export default function OtpVerificationScreen({ navigation, route }) {
  const phoneNumber = route?.params?.phoneNumber || "+91 ••••••8585";
  const rawPhone = route?.params?.rawPhone || phoneNumber.replace(/\s+/g, "");

  const { width } = useWindowDimensions();

  const CARD_PADDING = 24 * 2;
  const SCREEN_PADDING = 16 * 2;
  const GAP = 8;
  const availableWidth = width - CARD_PADDING - SCREEN_PADDING - GAP * (OTP_LENGTH - 1);
  const boxSize = Math.min(52, Math.max(38, Math.floor(availableWidth / OTP_LENGTH)));

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [rememberDevice, setRememberDevice] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const scrollViewRef = useRef(null);
  const isOtpComplete = otp.every((digit) => digit.trim() !== "");

  // Auto-shift the scrollview up when keypad opens
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 140, animated: true });
        }, 50);
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    const cleaned = value.replace(/[^0-9]/g, "");

    if (cleaned.length > 1) {
      const newOtp = [...otp];
      const pasteDigits = cleaned.slice(0, OTP_LENGTH).split("");
      pasteDigits.forEach((digit, i) => {
        if (i < OTP_LENGTH) newOtp[i] = digit;
      });
      setOtp(newOtp);
      console.log("[OtpVerificationScreen.js] OTP pasted:", newOtp.join(""));
      const nextIndex = Math.min(pasteDigits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned.slice(-1);
    setOtp(newOtp);
    console.log(`[OtpVerificationScreen.js] OTP digit [${index}] updated -> ${newOtp[index]}`);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      console.log(`[OtpVerificationScreen.js] Backspace pressed at empty index [${index}] -> focusing index [${index - 1}]`);
      inputRefs.current[index - 1]?.focus();
    }
  };

const handleVerify = async () => {
    if (!isOtpComplete || loading) return;
    Keyboard.dismiss();

    const otpCode = otp.join("");
    console.log("[OtpVerificationScreen.js] Initiating Verify OTP with:", {
      phone: rawPhone,
      token: otpCode,
      rememberDevice,
    });

    setLoading(true);

    try {
      // 1. Submit OTP verification to Supabase
      console.log("[OtpVerificationScreen.js] [supabase.auth.verifyOtp] -> Sending request...");
      const { data, error } = await supabase.auth.verifyOtp({
        phone: rawPhone,
        token: otpCode,
        type: "sms",
      });

      if (error) {
        console.error("[OtpVerificationScreen.js] [supabase.auth.verifyOtp] Verification failed:", {
          message: error.message,
          status: error.status,
        });
        Alert.alert("Invalid Code", error.message || "Failed to verify OTP.");
        setLoading(false);
        return;
      }

      console.log("[OtpVerificationScreen.js] [supabase.auth.verifyOtp] Verified successfully:", {
        userId: data?.user?.id,
        phone: data?.user?.phone,
        hasSession: !!data?.session,
      });

      const userId = data?.user?.id;
      // Get the phone as stored in auth.users or fallback to rawPhone
      const authPhone = data?.user?.phone || rawPhone;

      // 2. Query public.users checking both ID and Phone
      console.log("[OtpVerificationScreen.js] [public.users query] -> Checking for uid:", userId, "or phone:", authPhone);
      
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id, name, email, phone")
        .or(`id.eq.${userId},phone.eq.${authPhone}`)
        .maybeSingle();

      if (profileError) {
        console.warn("[OtpVerificationScreen.js] [public.users query] Warning:", profileError.message);
      }

      console.log("[OtpVerificationScreen.js] [public.users query] Profile result:", profile);

      setLoading(false);

      // 3. Conditional routing based on profile completeness
      if (profile && profile.name) {
        console.log("[OtpVerificationScreen.js] Existing profile detected -> Routing to Home");
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        console.log("[OtpVerificationScreen.js] Profile missing or incomplete -> Routing to CompleteProfile");
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "CompleteProfile",
              params: { phone: authPhone, userId },
            },
          ],
        });
      }
    } catch (err) {
      console.error("[OtpVerificationScreen.js] Unexpected error during verification:", err);
      Alert.alert("Verification Error", err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    console.log("[OtpVerificationScreen.js] Resend OTP clicked for:", rawPhone);

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: rawPhone,
      });

      if (error) {
        console.error("[OtpVerificationScreen.js] [supabase.auth.signInWithOtp Resend] Error:", error.message);
        Alert.alert("Resend Failed", error.message);
        return;
      }

      console.log("[OtpVerificationScreen.js] [supabase.auth.signInWithOtp Resend] OTP resent successfully:", data);
      setTimer(30);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      Alert.alert("Code Sent", "A fresh verification code has been dispatched.");
    } catch (err) {
      console.error("[OtpVerificationScreen.js] Resend unexpected error:", err);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: BG_COLOR }}>
      <StatusBar
        animated
        translucent
        backgroundColor={BG_COLOR}
        barStyle="dark-content"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: isKeyboardVisible ? "flex-start" : "center",
            paddingBottom: isKeyboardVisible ? 120 : 24,
            paddingTop: isKeyboardVisible ? 16 : 0,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="w-full items-center px-4 py-6">
              <View className="w-full max-w-[362px] bg-white rounded-2xl px-6 py-8 border border-slate-100 shadow-xl shadow-slate-400/20">
                <View className="items-center">
                  <Text className="text-[22px] font-black text-slate-900 text-center">
                    Welcome Back! 👋
                  </Text>
                  <Text className="text-sm text-slate-600 text-center mt-1">
                    Let's get you signed in
                  </Text>
                </View>

                <View className="items-center mt-6">
                  <Text className="text-[34px]">🔐</Text>
                  <Text className="text-lg font-bold text-[#5c2a12] text-center mt-2">
                    Enter Verification Code
                  </Text>
                  <Text className="text-sm font-medium text-[#78350f] text-center mt-2">
                    Code sent to{" "}
                    <Text className="font-extrabold text-[#5c2a12]">{phoneNumber}</Text>
                  </Text>
                </View>

                <View className="mt-7">
                  <Text className="text-sm font-bold text-[#5c2a12] mb-3">
                    Verification Code
                  </Text>

                  <View className="flex-row justify-between items-center">
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          inputRefs.current[index] = ref;
                        }}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={(event) => handleKeyPress(event, index)}
                        keyboardType="number-pad"
                        maxLength={Platform.OS === "ios" ? 1 : undefined}
                        selectTextOnFocus
                        style={{
                          includeFontPadding: false,
                          textAlignVertical: "center",
                          width: boxSize,
                          height: boxSize * 1.24,
                        }}
                        className={`rounded-lg border-[1.5px] bg-white text-center text-xl font-bold text-slate-800 p-0 ${
                          digit ? "border-[#4e8d6e]" : "border-[#86dfba]"
                        }`}
                      />
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setRememberDevice((val) => !val)}
                  className="flex-row items-center mt-6"
                >
                  <View
                    className={`w-5 h-5 rounded-[4px] border items-center justify-center ${
                      rememberDevice ? "bg-sky-600 border-sky-600" : "bg-white border-slate-400"
                    }`}
                  >
                    {rememberDevice && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </View>
                  <Text className="ml-3 text-xs text-slate-600 font-medium">
                    Remember this device for 30 days
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!isOtpComplete || loading}
                  onPress={handleVerify}
                  className={`w-full h-12 rounded-xl mt-6 items-center justify-center ${
                    isOtpComplete && !loading ? "bg-green-700" : "bg-[#7db89e]"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white text-sm font-extrabold tracking-wide">
                      Verify Phone Number
                    </Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row justify-center items-center mt-6">
                  <Text className="text-[13px] text-[#78350f] font-medium">
                    Didn't receive a code?{" "}
                  </Text>
                  <TouchableOpacity disabled={timer > 0} onPress={handleResend}>
                    <Text
                      className={`text-[13px] font-semibold ${
                        timer > 0 ? "text-[#5e967a]" : "text-[#008c72] underline"
                      }`}
                    >
                      Resend{timer > 0 ? ` (${timer}s)` : ""}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation?.goBack?.()}
                  className="mt-6 self-center"
                >
                  <Text className="text-sm font-semibold text-[#007b83]">
                    Use a different number
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Hide Floating Chat Button when keyboard is open */}
      {!isKeyboardVisible && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {}}
          className="absolute right-4 bottom-8 w-14 h-14 rounded-full bg-green-700 items-center justify-center shadow-lg shadow-black/30"
        >
          <MessageCircle size={26} color="#ffffff" strokeWidth={2.2} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}