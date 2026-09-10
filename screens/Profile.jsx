import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  UserRound,
  Mail,
  Phone,
  Save,
  MapPin,
  Home,
  Edit2,
  Trash2,
  ChefHat,
  AlertCircle,
  Plus,
  X,
  LogOut,
  Info,
} from "lucide-react-native";

import foodData from "../data/foodData.json";

export default function Profile() {
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState({
    fullName: "raja",
    email: "kingsai108@gmail.com",
    phone: "+916382982621",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
  });

  const [restrictions, setRestrictions] = useState(["b1", "b3"]);

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const toggleRestriction = (id) => {
    setRestrictions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const validateProfile = () => {
    const newErrors = { fullName: "", email: "" };

    if (!profile.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!profile.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return !newErrors.fullName && !newErrors.email;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfile()) return;

    try {
      setIsUpdating(true);
      console.log("Profile update:", profile);
    } catch (error) {
      console.log("Profile update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderDietaryItem = (item) => {
    const isSelected = restrictions.includes(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.7}
        onPress={() => toggleRestriction(item.id)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          borderWidth: 1.5,
          marginBottom: 10,
          backgroundColor: isSelected ? "#fff1f2" : "#ffffff",
          borderColor: isSelected ? "#ef4444" : "#e2e8f0",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: isSelected ? "700" : "500",
            color: isSelected ? "#b91c1c" : "#334155",
            flex: 1,
          }}
        >
          {item.name}
        </Text>

        {isSelected ? (
          <View
            style={{ backgroundColor: "#ef4444", borderRadius: 12, padding: 2 }}
          >
            <X size={16} color="#ffffff" strokeWidth={3} />
          </View>
        ) : (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 1.5,
              borderColor: "#cbd5e1",
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#f4f7f2]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 6, 20),
          paddingBottom: Math.max(insets.bottom + 24, 40),
          paddingHorizontal: 16,
        }}
      >
        <View className="items-center px-4 mb-5">
          <Text className="text-3xl font-extrabold text-[#0f172a] text-center tracking-tight">
            My Profile
          </Text>
          <Text className="mt-1 text-center text-sm text-[#64748b] leading-5">
            Manage your personal information, addresses, and preferences
          </Text>
        </View>

        <View className="overflow-hidden rounded-2xl bg-white border border-[#e2e8f0] shadow-sm mb-5">
          <View className="bg-[#14532d] px-5 py-4">
            <View className="flex-row items-center">
              <UserRound size={20} color="#ffffff" strokeWidth={2.2} />
              <Text className="ml-2.5 text-base font-bold text-white tracking-tight">
                Personal Information
              </Text>
            </View>
            <Text className="mt-0.5 text-xs text-emerald-100">
              Update your profile details
            </Text>
          </View>

          <View className="p-4" style={{ gap: 14 }}>
            <View>
              <Text className="text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </Text>
              <View
                className={`h-11 rounded-xl border bg-white px-3 justify-center ${
                  errors.fullName ? "border-red-400" : "border-slate-200"
                }`}
              >
                <TextInput
                  value={profile.fullName}
                  onChangeText={(val) => updateField("fullName", val)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  className="text-sm text-slate-800 p-0"
                />
              </View>
              {errors.fullName ? (
                <Text className="mt-1 text-[11px] text-red-500">
                  {errors.fullName}
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </Text>
              <View
                className={`h-11 flex-row items-center rounded-xl border bg-white px-3 ${
                  errors.email ? "border-red-400" : "border-slate-200"
                }`}
              >
                <TextInput
                  value={profile.email}
                  onChangeText={(val) => updateField("email", val)}
                  placeholder="Enter your email"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-sm text-slate-800 p-0"
                />
                <Mail size={16} color="#059669" strokeWidth={2} />
              </View>
              {errors.email ? (
                <Text className="mt-1 text-[11px] text-red-500">
                  {errors.email}
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </Text>
              <View className="h-11 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <Phone
                  size={16}
                  color="#94a3b8"
                  strokeWidth={2}
                  className="mr-2"
                />
                <TextInput
                  value={profile.phone}
                  editable={false}
                  className="flex-1 text-sm text-slate-500 p-0"
                />
              </View>
              <Text className="mt-1 text-[11px] text-slate-400">
                Phone number cannot be changed
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isUpdating}
              onPress={handleUpdateProfile}
              className={`h-11 flex-row items-center justify-center rounded-xl ${
                isUpdating ? "bg-emerald-700" : "bg-[#14532d]"
              }`}
            >
              <Save size={16} color="#ffffff" strokeWidth={2.2} />
              <Text className="ml-2 text-xs font-bold text-white">
                {isUpdating ? "Updating..." : "Update Profile"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="overflow-hidden rounded-2xl bg-white border border-[#e2e8f0] shadow-sm mb-5">
          <View className="bg-[#78350f] px-4 py-3.5 flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <View className="flex-row items-center">
                <MapPin size={18} color="#ffffff" strokeWidth={2.2} />
                <Text className="ml-2 text-base font-bold text-white tracking-tight">
                  Delivery Addresses
                </Text>
              </View>
              <Text className="mt-0.5 text-xs text-amber-100">
                Manage your delivery locations
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => console.log("Add Address pressed")}
              className="flex-row items-center bg-white px-3 py-3 rounded-lg shadow-xs"
            >
              <Plus size={15} color="#78350f" strokeWidth={2.6} />
              <Text className="ml-1 text-xs font-bold text-[#78350f]">
                Add Address
              </Text>
            </TouchableOpacity>
          </View>

          <View className="p-3.5">
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#fed7aa",
                backgroundColor: "#ffffff",
                padding: 14,
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-2.5">
                    <Home size={16} color="#059669" strokeWidth={2.2} />
                  </View>
                  <Text className="text-base font-bold text-slate-800">
                    Home
                  </Text>
                </View>

                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={() => console.log("Edit Address")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Edit2 size={16} color="#64748b" strokeWidth={2} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => console.log("Delete Address")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={16} color="#ef4444" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-xs text-slate-700 leading-4">
                KB Dasan Road, Lubdhi Colony, Deputy High Commission of
                Bangladesh Chennai
              </Text>
              <Text className="text-xs text-slate-500 mt-1">
                Alwarpet, Tamil Nadu - 600018
              </Text>
              <Text className="text-xs text-slate-600 mt-1">
                📞 +916382982621
              </Text>

              <View className="h-[1px] bg-slate-100 my-3" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                  <Text className="text-xs font-semibold text-emerald-700">
                    ₹30.00 delivery
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => console.log("Set Default pressed")}
                  className="border border-amber-600 px-2.5 py-1 rounded-md"
                >
                  <Text className="text-[11px] font-semibold text-[#92400e]">
                    Set as Default
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 mb-5">
          <LinearGradient
            colors={["#dcfce7", "#fef9c3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View className="flex-row items-start flex-1 pr-3">
              <ChefHat
                size={22}
                color="#166534"
                strokeWidth={2.2}
                style={{ marginTop: 2, marginRight: 10 }}
              />
              <View className="flex-1">
                <Text className="text-[16px] font-bold text-[#78350f] leading-tight">
                  Dietary Restrictions ({restrictions.length})
                </Text>
                <Text className="mt-0.5 text-xs text-[#78350f] font-medium">
                  Customize your meal preferences
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => console.log("Save Changes pressed")}
              style={{
                backgroundColor: "#047857",
                paddingHorizontal: 17,
                paddingVertical: 14,
                borderRadius: 6,
              }}
            >
              <Text className="text-xs font-extrabold text-white tracking-wide">
                Save Changes
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <View className="p-4 bg-white">
            <LinearGradient
              colors={["#d1fae5", "#fef9c3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 8,
                borderLeftWidth: 5,
                borderLeftColor: "#047857",
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderColor: "#fde047",
                paddingVertical: 14,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <AlertCircle
                size={22}
                color="#047857"
                strokeWidth={2.4}
                style={{ marginTop: 2, marginRight: 10, flexShrink: 0 }}
              />
              <Text className="flex-1 text-[13px] text-[#292524] leading-5 font-normal">
                Any dietary restriction item selected below will be replaced by{" "}
                <Text className="font-extrabold text-[#78350f]">IDLY</Text> for
                that selected dish. Items you select here will be avoided being
                sent to you. Please make sure you are only choosing dishes that
                you don't like and have dietary restrictions on.
              </Text>
            </LinearGradient>

            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            >
              {foodData.categories.map((category) => (
                <View key={category.id} style={{ marginBottom: 24 }}>
                  <View className="flex-row items-center mb-4">
                    <Text style={{ fontSize: 20, marginRight: 8 }}>
                      {category.emoji}
                    </Text>
                    <Text className="text-[16px] font-bold text-slate-800">
                      {category.title}{" "}
                      <Text className="text-slate-400 font-medium text-sm">
                        ({category.items.length} items)
                      </Text>
                    </Text>
                  </View>
                  {category.items.map(renderDietaryItem)}
                </View>
              ))}

              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#bbf7d0",
                  backgroundColor: "#f0fdf4",
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 10 }}>💡</Text>
                <Text className="flex-1 text-[13px] text-[#166534] leading-5 font-medium">
                  Tip: Select dishes that don't match your dietary preferences
                  or that you want to avoid. These will automatically be
                  replaced with IDLY in your meal plans.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* ================= APP VERSION & SIGN OUT CARD ================= */}
        <View className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 mb-5">
          <View className=" px-4 py-3.5 flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <View className="flex-row items-center">
                <Info size={18} color="#475569" strokeWidth={2.2} />
                <Text className="ml-2 text-base font-bold text-slate-600 tracking-tight">
                  App Version 1.0.28
                </Text>
              </View>
              <Text className="mt-0.5 text-xs text-slate-600-100">
               Updated 20 Jun 2026, 2:37 pm
              </Text>
            </View>
          </View>

          <View className="p-2 bg-white">

            <View className="h-[1px] bg-slate-100 my-3.5" />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => console.log("Sign Out pressed")}
              className="h-11 flex-row items-center justify-center rounded-xl border border-red-200 bg-white"
            >
              <LogOut size={16} color="#ef4444" strokeWidth={2.2} />
              <Text className="ml-2 text-sm font-bold text-red-600">
                Sign Out
              </Text>
            </TouchableOpacity>

            <Text className="mt-2 text-center text-[11px] text-slate-400 font-medium">
              You'll be redirected to the login page
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}