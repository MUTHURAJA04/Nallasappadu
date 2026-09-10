import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import COUNTRY_CODES from "../data/countryCodes.json";
import { supabase } from "../lib/supabase"; // Adjust path to your supabase.js if needed

const BG_COLOR = "#eef7ee";

export default function LoginScreen({ navigation }) {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_CODES[0] || { code: "IN", dialCode: "+91", name: "India", digits: 10 }
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.dialCode.includes(q) ||
        item.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSendCode = async () => {
    const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
    const requiredDigits = selectedCountry.digits || 7;

    console.log("[LoginScreen.js] Attempting Send OTP with:", {
      country: selectedCountry.name,
      dialCode: selectedCountry.dialCode,
      rawInput: phoneNumber,
      cleanedDigits: cleanedNumber,
      digitsLength: cleanedNumber.length,
      requiredDigits,
    });

    if (!cleanedNumber || cleanedNumber.length < requiredDigits) {
      console.warn(
        `[LoginScreen.js] Validation failed: Phone number length (${cleanedNumber.length}) is less than required (${requiredDigits})`
      );
      Alert.alert(
        "Invalid Number",
        `Please enter a valid ${requiredDigits}-digit mobile number.`
      );
      return;
    }

    Keyboard.dismiss();

    // Standard E.164 phone format for Supabase (e.g. "+916382982621")
    const e164Phone = `${selectedCountry.dialCode}${cleanedNumber}`;
    // Display-friendly format for the next screen (e.g. "+91 6382982621")
    const displayPhone = `${selectedCountry.dialCode} ${cleanedNumber}`;

    setLoading(true);
    console.log("[LoginScreen.js] [supabase.auth.signInWithOtp] -> Dispatching request for:", e164Phone);

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: e164Phone,
      });

      if (error) {
        console.error("[LoginScreen.js] [supabase.auth.signInWithOtp] Error received:", {
          message: error.message,
          status: error.status,
        });
        Alert.alert("Error Sending OTP", error.message);
        setLoading(false);
        return;
      }

      console.log("[LoginScreen.js] [supabase.auth.signInWithOtp] Success response:", data);
      console.log("[LoginScreen.js] Navigating to 'otp' screen with params:", {
        phoneNumber: displayPhone,
        rawPhone: e164Phone,
      });

      setLoading(false);
      navigation.navigate("otp", {
        phoneNumber: displayPhone,
        rawPhone: e164Phone,
      });
    } catch (err) {
      console.error("[LoginScreen.js] Unexpected error during OTP trigger:", err);
      Alert.alert("Unexpected Error", err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  const closeModal = () => {
    console.log("[LoginScreen.js] Closing Country Picker modal");
    setModalVisible(false);
    setSearchQuery("");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: BG_COLOR }}>
      {/* Single source of truth for status bar - no imperative calls fighting this */}
      <StatusBar
        animated
        translucent
        backgroundColor={BG_COLOR}
        barStyle="dark-content"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 justify-center items-center px-5 py-6">
              <View className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl shadow-slate-300/40 border border-slate-100">
                <View className="items-center mb-3">
                  <Text className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
                    Welcome Back! 👋
                  </Text>
                  <Text className="text-slate-600 text-sm mt-0.5 font-medium text-center">
                    Let's get you signed in
                  </Text>
                </View>

                <View className="items-center my-2">
                  <Text className="text-4xl">📱</Text>
                  <Text className="text-base font-bold text-[#78350f] mt-2">
                    Your Phone Number
                  </Text>
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-bold text-slate-800 mb-2">
                    Phone Number
                  </Text>

                  {/* flex instead of fixed w-28, so it scales on narrow screens */}
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => {
                        console.log("[LoginScreen.js] Opening Country Picker modal");
                        Keyboard.dismiss();
                        setModalVisible(true);
                      }}
                      activeOpacity={0.7}
                      className="flex-row items-center justify-between bg-white border border-emerald-300 rounded-xl px-3 h-12"
                      style={{ minWidth: 92 }}
                    >
                      <Text
                        className="text-slate-800 font-bold text-base"
                        numberOfLines={1}
                      >
                        {selectedCountry.code}{" "}
                        <Text className="text-emerald-700">{selectedCountry.dialCode}</Text>
                      </Text>
                      <Search size={14} color="#047857" strokeWidth={2.5} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>

                    <TextInput
                      placeholder="99999 99999"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      maxLength={selectedCountry.digits || 15}
                      value={phoneNumber}
                      onChangeText={(val) => {
                        const cleaned = val.replace(/[^0-9]/g, "");
                        setPhoneNumber(cleaned);
                      }}
                      style={{
                        paddingTop: 0,
                        paddingBottom: 0,
                        includeFontPadding: false,
                        textAlignVertical: "center",
                      }}
                      className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 h-12 text-slate-900 text-base font-bold"
                    />
                  </View>

                  <Text className="text-xs font-medium text-slate-500 mt-1.5 ml-1">
                    {selectedCountry.name} ({selectedCountry.digits} digits)
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleSendCode}
                  disabled={loading}
                  activeOpacity={0.85}
                  className="w-full bg-[#803816] h-12 rounded-xl items-center justify-center shadow-md shadow-amber-950/20 active:bg-[#682c10]"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-base tracking-wide">
                      Send Verification Code
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={closeModal} />

          <View className="bg-white rounded-t-2xl p-5" style={{ maxHeight: "75%" }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-900">Select Country</Text>
              <TouchableOpacity
                onPress={closeModal}
                className="w-8 h-8 items-center justify-center bg-slate-100 rounded-lg"
              >
                <Text className="text-slate-600 font-bold text-base leading-none">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-slate-100 rounded-xl px-3.5 h-11 mb-3 border border-slate-200">
              <Search size={18} color="#64748b" />
              <TextInput
                placeholder="Search by country or code..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ paddingTop: 0, paddingBottom: 0, includeFontPadding: false }}
                className="flex-1 ml-2.5 text-slate-900 text-sm font-medium"
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => `${item.code}-${item.dialCode}`}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={15}
              maxToRenderPerBatch={20}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    console.log("[LoginScreen.js] Country selected:", item);
                    setSelectedCountry(item);
                    closeModal();
                  }}
                  className="flex-row items-center justify-between py-3.5 px-2 border-b border-slate-100 active:bg-slate-50"
                >
                  <Text className="text-slate-900 font-bold text-base" style={{ flexShrink: 1 }}>
                    {item.name} <Text className="text-slate-500 font-normal">({item.code})</Text>
                  </Text>
                  <Text className="text-emerald-700 font-bold text-base">{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}