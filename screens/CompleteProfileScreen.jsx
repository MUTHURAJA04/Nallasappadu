import React, { useState, useEffect, useRef } from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Home, Briefcase, MapPin } from "lucide-react-native";
import { supabase } from "../lib/supabase";

const BG_COLOR = "#eef8ef";

const ADDRESS_LABELS = [
  { id: "Home", label: "Home", icon: Home },
  { id: "Work", label: "Work", icon: Briefcase },
  { id: "Other", label: "Other", icon: MapPin },
];

export default function CompleteProfileScreen({ navigation, route }) {
  const phone = route?.params?.phone || "";
  const userId = route?.params?.userId || "";

  // Personal Info State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Address State (Grouped Inputs)
  const [selectedLabel, setSelectedLabel] = useState("Home");
  const [aptBuildingFloor, setAptBuildingFloor] = useState("");
  const [streetRoadLocality, setStreetRoadLocality] = useState("");
  const [area, setArea] = useState("");

  const [loading, setLoading] = useState(false);
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const scrollViewRef = useRef(null);

  // Dynamically add clearance when keyboard shows on Android or iOS
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardSpace(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardSpace(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleInputFocus = (offset = 320) => {
    // Scrolls view down so the focused field stays comfortably above the keyboard
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: offset, animated: true });
    }, 100);
  };

  const handleSaveProfile = async () => {
    Keyboard.dismiss();

    console.log("[CompleteProfileScreen.js] Form submission triggered:", {
      phone,
      userId,
      fullName,
      email,
      selectedLabel,
      aptBuildingFloor,
      streetRoadLocality,
      area,
    });

    if (!fullName.trim()) {
      Alert.alert("Required Field", "Please enter your full name.");
      return;
    }

    if (!aptBuildingFloor.trim()) {
      Alert.alert("Required Field", "Please enter Flat / Building / Floor details.");
      return;
    }

    if (!streetRoadLocality.trim()) {
      Alert.alert("Required Field", "Please enter Street / Road / Locality.");
      return;
    }

    if (!area.trim()) {
      Alert.alert("Required Field", "Please enter Area / City.");
      return;
    }

    setLoading(true);

    const rpcPayload = {
      p_phone: phone,
      p_name: fullName.trim(),
      p_email: email.trim() || null,
      p_label: selectedLabel,
      p_building: aptBuildingFloor.trim(),
      p_apartment: null,
      p_floor: null,
      p_street: streetRoadLocality.trim(),
      p_road: null,
      p_locality: streetRoadLocality.trim(),
      p_area: area.trim(),
    };

    console.log("[CompleteProfileScreen.js] [supabase.rpc register_user] -> Invoking RPC:", rpcPayload);

    try {
      const { data, error } = await supabase.rpc("register_user", rpcPayload);

      if (error) {
        console.error("[CompleteProfileScreen.js] [supabase.rpc register_user] Error:", error);
        Alert.alert("Registration Error", error.message || "Failed to save profile.");
        setLoading(false);
        return;
      }

      console.log("[CompleteProfileScreen.js] [supabase.rpc register_user] Success:", data);

      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err) {
      console.error("[CompleteProfileScreen.js] Unexpected exception during profile save:", err);
      Alert.alert("Unexpected Error", err.message || "Something went wrong.");
      setLoading(false);
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: keyboardSpace > 0 ? keyboardSpace + 40 : 60,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="w-full items-center">
              <View className="w-full max-w-[362px] bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-400/20">
                {/* Header */}
                <View className="items-center mb-6">
                  <Text className="text-[22px] font-black text-slate-900 text-center">
                    Complete Profile 📋
                  </Text>
                  <Text className="text-sm text-slate-600 text-center mt-1">
                    Set up your details & delivery address
                  </Text>
                </View>

                {/* Personal Information */}
                <View className="mb-5">
                  <Text className="text-xs font-black uppercase tracking-wider text-[#5c2a12] mb-3">
                    Personal Details
                  </Text>

                  {/* Registered Phone (Read-Only) */}
                  <View className="mb-3">
                    <Text className="text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </Text>
                    <TextInput
                      value={phone}
                      editable={false}
                      style={{
                        paddingTop: 0,
                        paddingBottom: 0,
                        includeFontPadding: false,
                        textAlignVertical: "center",
                      }}
                      className="bg-slate-100 border border-slate-200 rounded-xl px-3 h-11 text-slate-500 text-sm font-semibold"
                    />
                  </View>

                  {/* Full Name */}
                  <View className="mb-3">
                    <Text className="text-xs font-bold text-slate-700 mb-1">
                      Full Name <Text className="text-rose-500">*</Text>
                    </Text>
                    <TextInput
                      placeholder="e.g. Raja"
                      placeholderTextColor="#94a3b8"
                      value={fullName}
                      onChangeText={setFullName}
                      style={{
                        paddingTop: 0,
                        paddingBottom: 0,
                        includeFontPadding: false,
                        textAlignVertical: "center",
                      }}
                      className="bg-white border border-emerald-300 rounded-xl px-3 h-11 text-slate-900 text-sm font-bold"
                    />
                  </View>

                  {/* Email */}
                  <View className="mb-2">
                    <Text className="text-xs font-bold text-slate-700 mb-1">
                      Email Address <Text className="text-slate-400 font-normal">(Optional)</Text>
                    </Text>
                    <TextInput
                      placeholder="name@example.com"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      style={{
                        paddingTop: 0,
                        paddingBottom: 0,
                        includeFontPadding: false,
                        textAlignVertical: "center",
                      }}
                      className="bg-white border border-emerald-300 rounded-xl px-3 h-11 text-slate-900 text-sm font-medium"
                    />
                  </View>
                </View>

                <View className="h-[1px] bg-slate-100 my-2" />

                {/* Delivery Address Section */}
                <View className="mb-5 mt-2">
                  <Text className="text-xs font-black uppercase tracking-wider text-[#5c2a12] mb-3">
                    Delivery Address
                  </Text>

                  {/* Address Label Chips */}
                  <Text className="text-xs font-bold text-slate-700 mb-2">
                    Address Label
                  </Text>
                  <View className="flex-row gap-2 mb-4">
                    {ADDRESS_LABELS.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = selectedLabel === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.7}
                          onPress={() => setSelectedLabel(item.id)}
                          className={`flex-1 flex-row items-center justify-center py-2 px-2 rounded-xl border ${
                            isSelected
                              ? "bg-emerald-50 border-[#008c72]"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <IconComp
                            size={14}
                            color={isSelected ? "#008c72" : "#64748b"}
                            strokeWidth={2.2}
                          />
                          <Text
                            className={`ml-1.5 text-xs font-bold ${
                              isSelected ? "text-[#008c72]" : "text-slate-600"
                            }`}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* LINE 1: Apartment / Building / Floor */}
                  <View className="mb-3">
                    <Text className="text-xs font-bold text-slate-700 mb-1">
                      Apartment / Building / Floor <Text className="text-rose-500">*</Text>
                    </Text>
                    <TextInput
                      placeholder="e.g. Flat 402, Tower B, 4th Floor"
                      placeholderTextColor="#94a3b8"
                      value={aptBuildingFloor}
                      onChangeText={setAptBuildingFloor}
                      onFocus={() => handleInputFocus(180)}
                      style={{
                        paddingTop: 0,
                        paddingBottom: 0,
                        includeFontPadding: false,
                        textAlignVertical: "center",
                      }}
                      className="bg-white border border-emerald-300 rounded-xl px-3 h-11 text-slate-900 text-sm font-semibold"
                    />
                  </View>

                  {/* LINE 2: Street / Road / Locality */}
                  <View className="mb-3">
                    <Text className="text-xs font-bold text-slate-700 mb-1">
                      Street / Road / Locality <Text className="text-rose-500">*</Text>
                    </Text>
                    <TextInput
                      placeholder="e.g. 7th Cross Street, College Road, Sekkalai"
                      placeholderTextColor="#94a3b8"
                      value={streetRoadLocality}
                      onChangeText={setStreetRoadLocality}
                      onFocus={() => handleInputFocus(260)}
                      style={{
                        paddingTop: 0,
                        paddingBottom: 0,
                        includeFontPadding: false,
                        textAlignVertical: "center",
                      }}
                      className="bg-white border border-emerald-300 rounded-xl px-3 h-11 text-slate-900 text-sm font-semibold"
                    />
                  </View>

                  {/* LINE 3: Area / City */}
                  <View className="mb-2">
                    <Text className="text-xs font-bold text-slate-700 mb-1">
                      Area / City <Text className="text-rose-500">*</Text>
                    </Text>
                    <TextInput
                      placeholder="e.g. Karaikudi"
                      placeholderTextColor="#94a3b8"
                      value={area}
                      onChangeText={setArea}
                      onFocus={() => handleInputFocus(340)}
                      style={{
                        paddingTop: 0,
                        paddingBottom: 0,
                        includeFontPadding: false,
                        textAlignVertical: "center",
                      }}
                      className="bg-white border border-emerald-300 rounded-xl px-3 h-11 text-slate-900 text-sm font-bold"
                    />
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={loading}
                  onPress={handleSaveProfile}
                  className="w-full bg-[#803816] h-12 rounded-xl mt-3 items-center justify-center shadow-md shadow-amber-950/20 active:bg-[#682c10]"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-base tracking-wide">
                      Complete Registration
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}