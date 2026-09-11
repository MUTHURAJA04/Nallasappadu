import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ShoppingCart,
  X,
  ChevronDown,
  ChevronLeft,
  Plus,
  Minus,
  AlertCircle,
  MapPin,
  Check,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";
import foodData from "../data/foodData.json"; // Your dynamic menu source

// Helper to generate dynamic 7 calendar days
const getDynamicUpcomingDates = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    const dayNum = d.getDate();
    return {
      id: d.toISOString().split("T")[0],
      isToday: i === 0,
      label: i === 0 ? `Today (${dayName}, ${monthName} ${dayNum})` : `${dayName}, ${monthName} ${dayNum}`,
      rawDate: d.toISOString().split("T")[0],
    };
  });
};

const BASE_SESSIONS = [
  { id: "breakfast", label: "Breakfast", icon: "🌅", cutOffHour: 10, cutOffMinute: 30 },
  { id: "lunch", label: "Lunch", icon: "☀️", cutOffHour: 15, cutOffMinute: 30 },
  { id: "dinner", label: "Dinner", icon: "🌙", cutOffHour: 22, cutOffMinute: 30 },
];

export default function QuickOrdersScreen({ navigation }) {
  const upcomingDates = useMemo(() => getDynamicUpcomingDates(), []);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(upcomingDates[0]);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState("dinner");
  const [cart, setCart] = useState({});

  // Address & Server state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamically extract meals mapped by session key from foodData.json
  const sessionMealsMap = useMemo(() => {
    const mapping = { breakfast: [], lunch: [], dinner: [] };

    if (foodData?.categories && Array.isArray(foodData.categories)) {
      foodData.categories.forEach((category) => {
        const catId = category.id?.toLowerCase();
        const targetSession = catId.includes("break")
          ? "breakfast"
          : catId.includes("lunch")
          ? "lunch"
          : catId.includes("dinner")
          ? "dinner"
          : null;

        if (targetSession && Array.isArray(category.items)) {
          mapping[targetSession].push(...category.items);
        }
      });
    }

    // Fallback if foodData format differs
    if (mapping.dinner.length === 0) {
      mapping.dinner = [
        { id: "d1", name: "Dinner (Thattu Idly - 2)", price: 110 },
        { id: "d2", name: "Extra Sidedish", price: 30 },
      ];
    }
    if (mapping.breakfast.length === 0) {
      mapping.breakfast = [
        { id: "b1", name: "Breakfast Combo (Pongal & Vada)", price: 90 },
      ];
    }
    if (mapping.lunch.length === 0) {
      mapping.lunch = [
        { id: "l1", name: "Full Meals (South Indian)", price: 140 },
      ];
    }

    return mapping;
  }, []);

  // Compute live session availability based on current time & selected date
  const availableSessions = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isOrderForToday = selectedDate.isToday;

    return BASE_SESSIONS.map((sess) => {
      let isAvailable = true;

      if (isOrderForToday) {
        // Cut-off rule:
        // Before 10:30 AM -> breakfast, lunch, dinner available
        // 10:30 AM to 3:30 PM -> lunch, dinner available
        // After 3:30 PM -> only dinner available
        if (sess.id === "breakfast") {
          isAvailable = currentHour < 10 || (currentHour === 10 && currentMinute <= 30);
        } else if (sess.id === "lunch") {
          isAvailable = currentHour < 15 || (currentHour === 15 && currentMinute <= 30);
        } else if (sess.id === "dinner") {
          isAvailable = currentHour < 22 || (currentHour === 22 && currentMinute <= 30);
        }
      }

      return {
        ...sess,
        available: isAvailable,
      };
    });
  }, [selectedDate]);

  // Ensure selectedSession automatically switches to an available slot if current becomes disabled
  useEffect(() => {
    const currentSessionValid = availableSessions.find(
      (s) => s.id === selectedSession && s.available
    );
    if (!currentSessionValid) {
      const firstAvailable = availableSessions.find((s) => s.available);
      if (firstAvailable) {
        setSelectedSession(firstAvailable.id);
      }
    }
  }, [availableSessions, selectedSession]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoadingAddress(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", session.user.id);

      if (!error && data) {
        setAddresses(data);
        const defaultAddr = data.find((a) => a.is_default) || data[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      }
    } catch (e) {
      console.error("[QuickOrders] Error fetching addresses:", e);
    } finally {
      setLoadingAddress(false);
    }
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: updated };
    });
  };

  const currentMeals = sessionMealsMap[selectedSession] || [];

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  }, [cart]);

  const allMealsFlat = useMemo(() => {
    return Object.values(sessionMealsMap).flat();
  }, [sessionMealsMap]);

  const subtotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = allMealsFlat.find((m) => m.id === itemId);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [cart, allMealsFlat]);

  const deliveryFee = 30;
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee : 0;

  const handleNext = () => {
    if (step === 1) {
      if (totalItems === 0) {
        Alert.alert("Select Items", "Please add at least one meal to continue.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedAddressId) {
        Alert.alert("Select Address", "Please pick a delivery address.");
        return;
      }
      setStep(3);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          address_id: selectedAddressId,
          order_date: selectedDate.rawDate,
          session: selectedSession,
          total_amount: grandTotal,
          delivery_fee: deliveryFee,
          status: "confirmed",
          items: cart,
        });

      if (error) {
        console.warn("[QuickOrders] DB insert error:", error.message);
      }

      Alert.alert(
        "Order Confirmed! 🎉",
        `Your quick order for ${selectedSession.toUpperCase()} on ${selectedDate.label} has been placed.`,
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    } catch (err) {
      Alert.alert("Order Error", "Could not complete quick order.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAddressObj = addresses.find((a) => a.id === selectedAddressId);

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100">
        <View className="flex-row items-center">
          {step > 1 ? (
            <TouchableOpacity
              onPress={handleBackStep}
              className="mr-2.5 p-1 rounded-full bg-slate-100"
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color="#0f172a" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <ShoppingCart size={22} color="#2563eb" strokeWidth={2.4} style={{ marginRight: 8 }} />
          )}
          <Text className="text-lg font-bold text-slate-900">
            {step === 1 ? "Quick Orders" : step === 2 ? "Select Address" : "Review Order"}
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <X size={22} color="#64748b" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* Stepper Wizard */}
      <View className="flex-row items-center justify-center py-4 px-8 border-b border-slate-100">
        {/* Step 1 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setStep(1)}
          className="items-center"
        >
          <View
            className={`w-9 h-9 rounded-full items-center justify-center ${
              step === 1 ? "bg-blue-600" : step > 1 ? "bg-emerald-600" : "bg-slate-200"
            }`}
          >
            {step > 1 ? (
              <Check size={18} color="#fff" strokeWidth={2.5} />
            ) : (
              <Text className="text-white font-bold text-sm">1</Text>
            )}
          </View>
          <Text
            className={`text-xs mt-1 ${
              step === 1
                ? "font-bold text-blue-600"
                : step > 1
                ? "font-bold text-emerald-600"
                : "text-slate-400 font-medium"
            }`}
          >
            Select
          </Text>
        </TouchableOpacity>

        <View className="h-[2px] w-12 bg-slate-200 mx-2 mb-4" />

        {/* Step 2 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (totalItems > 0) setStep(2);
          }}
          className="items-center"
        >
          <View
            className={`w-9 h-9 rounded-full items-center justify-center ${
              step === 2 ? "bg-blue-600" : step > 2 ? "bg-emerald-600" : "bg-slate-200"
            }`}
          >
            {step > 2 ? (
              <Check size={18} color="#fff" strokeWidth={2.5} />
            ) : (
              <Text
                className={`font-bold text-sm ${
                  step >= 2 ? "text-white" : "text-slate-600"
                }`}
              >
                2
              </Text>
            )}
          </View>
          <Text
            className={`text-xs mt-1 ${
              step === 2
                ? "font-bold text-blue-600"
                : step > 2
                ? "font-bold text-emerald-600"
                : "text-slate-400 font-medium"
            }`}
          >
            Address
          </Text>
        </TouchableOpacity>

        <View className="h-[2px] w-12 bg-slate-200 mx-2 mb-4" />

        {/* Step 3 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (totalItems > 0 && selectedAddressId) setStep(3);
          }}
          className="items-center"
        >
          <View
            className={`w-9 h-9 rounded-full items-center justify-center ${
              step === 3 ? "bg-blue-600" : "bg-slate-200"
            }`}
          >
            <Text
              className={`font-bold text-sm ${
                step === 3 ? "text-white" : "text-slate-600"
              }`}
            >
              3
            </Text>
          </View>
          <Text
            className={`text-xs mt-1 ${
              step === 3 ? "font-bold text-blue-600" : "text-slate-400 font-medium"
            }`}
          >
            Review
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= STEP 1: DYNAMIC MEAL SELECTION ================= */}
        {step === 1 && (
          <View>
            <View className="flex-row items-center bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
              <Text className="text-xl mr-2.5">🗓️</Text>
              <Text className="text-xs text-blue-800 font-medium flex-1 leading-4">
                Mix sessions — add Breakfast, Lunch & Dinner in one order
              </Text>
            </View>

            {/* Select Date Dropdown Field */}
            <Text className="text-sm font-bold text-slate-900 mb-2">Select Date</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDateModalVisible(true)}
              className="flex-row items-center justify-between h-12 px-3.5 rounded-xl border border-blue-600 bg-white mb-5"
            >
              <Text className="text-sm font-semibold text-slate-900">{selectedDate.label}</Text>
              <ChevronDown size={18} color="#2563eb" />
            </TouchableOpacity>

            {/* Dynamic Sessions with Availability Windows */}
            <Text className="text-sm font-bold text-slate-900 mb-2">Select Session</Text>
            <View className="flex-row gap-2.5 mb-6">
              {availableSessions.map((sess) => {
                const isSelected = selectedSession === sess.id;
                return (
                  <TouchableOpacity
                    key={sess.id}
                    disabled={!sess.available}
                    activeOpacity={0.8}
                    onPress={() => setSelectedSession(sess.id)}
                    className={`flex-1 flex-row items-center justify-center py-2.5 px-2 rounded-xl border ${
                      isSelected
                        ? "bg-emerald-800 border-emerald-800"
                        : sess.available
                        ? "bg-white border-slate-200"
                        : "bg-slate-50 border-slate-200 opacity-50"
                    }`}
                  >
                    <Text className="mr-1 text-sm">{sess.icon}</Text>
                    <Text
                      className={`text-xs font-bold ${
                        isSelected
                          ? "text-white"
                          : sess.available
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {sess.label}
                    </Text>
                    {!sess.available && (
                      <AlertCircle size={12} color="#94a3b8" style={{ marginLeft: 3 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dynamic Meal Items */}
            <Text className="text-sm font-bold text-slate-900 mb-3">Available Meals</Text>
            <View style={{ gap: 12 }}>
              {currentMeals.length === 0 ? (
                <View className="p-5 items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
                  <Text className="text-xs font-medium text-slate-500">
                    No meals scheduled for this session.
                  </Text>
                </View>
              ) : (
                currentMeals.map((item) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <View
                      key={item.id}
                      className="flex-row items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-xs"
                    >
                      <View className="flex-1 pr-2">
                        <Text className="text-sm font-extrabold text-slate-900">
                          {item.name}{" "}
                          {item.subtitle ? (
                            <Text className="font-normal text-slate-500 text-xs">
                              {item.subtitle}
                            </Text>
                          ) : null}
                        </Text>
                        <Text className="text-base font-extrabold text-blue-600 mt-1">
                          ₹{item.price}
                        </Text>
                      </View>

                      {qty === 0 ? (
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.id, 1)}
                          className="w-10 h-10 rounded-xl border border-emerald-400 items-center justify-center bg-white"
                        >
                          <Plus size={18} color="#047857" strokeWidth={2.4} />
                        </TouchableOpacity>
                      ) : (
                        <View className="flex-row items-center bg-emerald-50 border border-emerald-400 rounded-xl px-2 py-1">
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 items-center justify-center"
                          >
                            <Minus size={16} color="#047857" strokeWidth={2.4} />
                          </TouchableOpacity>
                          <Text className="mx-2 font-bold text-sm text-emerald-900">
                            {qty}
                          </Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 items-center justify-center"
                          >
                            <Plus size={16} color="#047857" strokeWidth={2.4} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* ================= STEP 2: ADDRESS SELECTION ================= */}
        {step === 2 && (
          <View>
            <Text className="text-base font-bold text-slate-900 mb-1">
              Select Delivery Address
            </Text>
            <Text className="text-xs text-slate-500 mb-4">
              Where should we deliver your {selectedSession} meal?
            </Text>

            {loadingAddress ? (
              <ActivityIndicator size="small" color="#047857" />
            ) : addresses.length === 0 ? (
              <View className="p-4 bg-slate-50 rounded-xl border border-slate-200 items-center">
                <Text className="text-xs text-slate-600 mb-2">No saved address found.</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Profile")}
                  className="bg-emerald-700 px-3 py-2 rounded-lg"
                >
                  <Text className="text-xs font-bold text-white">Add in Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {addresses.map((addr) => {
                  const isChosen = selectedAddressId === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border ${
                        isChosen
                          ? "bg-emerald-50 border-emerald-600"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <View className="flex-row items-center justify-between mb-1.5">
                        <View className="flex-row items-center">
                          <MapPin
                            size={16}
                            color={isChosen ? "#047857" : "#64748b"}
                            strokeWidth={2.2}
                          />
                          <Text
                            className={`ml-1.5 text-xs font-bold uppercase tracking-wider ${
                              isChosen ? "text-emerald-800" : "text-slate-700"
                            }`}
                          >
                            {addr.label || "Address"}
                          </Text>
                        </View>
                        {isChosen && (
                          <View className="w-5 h-5 rounded-full bg-emerald-600 items-center justify-center">
                            <Check size={12} color="#fff" strokeWidth={3} />
                          </View>
                        )}
                      </View>

                      <Text className="text-xs font-medium text-slate-700 leading-snug">
                        {[addr.building, addr.street, addr.locality, addr.area]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ================= STEP 3: REVIEW & SUMMARY ================= */}
        {step === 3 && (
          <View>
            <Text className="text-base font-bold text-slate-900 mb-3">Order Summary</Text>

            {/* Delivery Info */}
            <View className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4">
              <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                Delivering To ({selectedAddressObj?.label || "Home"})
              </Text>
              <Text className="text-xs font-bold text-slate-800">
                {[selectedAddressObj?.building, selectedAddressObj?.locality, selectedAddressObj?.area]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              <Text className="text-[11px] text-emerald-700 font-semibold mt-1">
                Scheduled for {selectedDate.label} • {selectedSession.toUpperCase()}
              </Text>
            </View>

            {/* Items Breakdown */}
            <View className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-2.5">Items Selected</Text>
              {Object.entries(cart).map(([itemId, qty]) => {
                const item = allMealsFlat.find((m) => m.id === itemId);
                if (!item) return null;
                return (
                  <View key={itemId} className="flex-row justify-between py-1.5 border-b border-slate-100">
                    <Text className="text-xs text-slate-800 font-medium">
                      {item.name} × {qty}
                    </Text>
                    <Text className="text-xs font-bold text-slate-900">
                      ₹{item.price * qty}
                    </Text>
                  </View>
                );
              })}

              <View className="flex-row justify-between py-1.5 mt-2">
                <Text className="text-xs text-slate-500">Delivery Fee</Text>
                <Text className="text-xs font-semibold text-slate-800">₹{deliveryFee}</Text>
              </View>

              <View className="flex-row justify-between pt-2.5 mt-2 border-t border-slate-200">
                <Text className="text-sm font-extrabold text-slate-900">Total Payable</Text>
                <Text className="text-base font-black text-emerald-700">₹{grandTotal}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Date Picker Bottom Sheet Modal */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setDateModalVisible(false)}
          />
          <View className="bg-white rounded-t-2xl p-5" style={{ maxHeight: "50%" }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-bold text-slate-900">Select Delivery Date</Text>
              <TouchableOpacity
                onPress={() => setDateModalVisible(false)}
                className="w-8 h-8 items-center justify-center bg-slate-100 rounded-lg"
              >
                <Text className="text-slate-600 font-bold text-base leading-none">✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={upcomingDates}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedDate.id === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDate(item);
                      setDateModalVisible(false);
                    }}
                    className={`flex-row items-center justify-between py-3.5 px-3 rounded-xl mb-1.5 ${
                      isSelected ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        isSelected ? "font-bold text-blue-700" : "font-medium text-slate-800"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Check size={18} color="#1d4ed8" strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom Bar */}
      {totalItems > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-5 py-3.5 flex-row items-center justify-between shadow-lg">
          <View>
            <Text className="text-[11px] font-semibold text-slate-500">
              {totalItems} {totalItems === 1 ? "Item" : "Items"} • ₹{subtotal}
            </Text>
            <Text className="text-lg font-black text-slate-900">₹{grandTotal}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={submitting}
            onPress={step === 3 ? handlePlaceOrder : handleNext}
            className="bg-emerald-700 px-6 py-3 rounded-xl items-center justify-center min-w-[150px]"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-sm font-extrabold tracking-wide">
                {step === 1 ? "Proceed to Address" : step === 2 ? "Review Order" : "Place Order"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}