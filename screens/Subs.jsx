import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";

import {
  Plus,
  ChevronDown,
  Check,
  CalendarDays,
  Repeat2,
} from "lucide-react-native";

const Subs = () => {
  const [subscriptions, setSubscriptions] = useState([]);

  const [timePeriod, setTimePeriod] = useState("Active Subscriptions");
  const [status, setStatus] = useState("All Statuses");

  const [showTimePeriod, setShowTimePeriod] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const [showSubscriptionModal, setShowSubscriptionModal] =
    useState(false);

  const timePeriodOptions = [
    "Last 30 Days",
    "Last 3 Month",
    "Last 6 Month",
    "All time",
  ];

  const statusOptions = [
    "All Statuses",
    "Active Only",
    "Completed Only",
    "Cancelled Only",
    "Pending Only",
  ];

  const openTimePeriodDropdown = () => {
    setShowTimePeriod((prev) => !prev);
    setShowStatus(false);
  };

  const openStatusDropdown = () => {
    setShowStatus((prev) => !prev);
    setShowTimePeriod(false);
  };

  const closeSubscriptionModal = () => {
    setShowSubscriptionModal(false);
  };

  const handleCreateSubscription = () => {
    closeSubscriptionModal();

    setSubscriptions([
      {
        id: Date.now(),
        status: "Active",
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#f4fbf7]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ================= HEADER ================= */}
        <View className="flex-row items-center justify-between px-4 pt-6">
          <Text className="text-[23px] font-bold text-slate-900">
            My Subscriptions
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowSubscriptionModal(true)}
            className="h-11 flex-row items-center rounded-lg bg-green-700 px-4"
          >
            <Plus
              size={17}
              color="white"
              strokeWidth={2}
            />

            <Text className="ml-2 text-[13px] font-bold text-white">
              Subscription
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= COUNT CARD ================= */}
        <View className="mx-4 mt-5 rounded-lg border border-emerald-200 bg-white px-4 py-4">
          <Text className="text-[21px] font-bold text-green-600">
            {subscriptions.length}
          </Text>

          <Text className="mt-1 text-[13px] text-slate-500">
            Ongoing Subscriptions
          </Text>
        </View>

        {/* ================= TIME PERIOD ================= */}
        <View className="mx-4 mt-5 rounded-lg border border-emerald-200 bg-white p-4">
          <Text className="text-[13px] font-semibold text-slate-700">
            Time Period
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openTimePeriodDropdown}
            className="mt-3 h-11 flex-row items-center justify-between rounded-md border border-emerald-300 bg-white px-3"
          >
            <Text className="text-[13px] text-orange-950">
              {timePeriod}
            </Text>

            <ChevronDown
              size={17}
              color="#9a8174"
            />
          </TouchableOpacity>

          {/* Time Period Dropdown */}
          {showTimePeriod && (
            <View className="mt-1 overflow-hidden rounded-md border border-emerald-200 bg-white">
              {timePeriodOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.7}
                  onPress={() => {
                    setTimePeriod(item);
                    setShowTimePeriod(false);
                  }}
                  className={`px-3 py-3 ${
                    timePeriod === item
                      ? "bg-emerald-50"
                      : "bg-white"
                  }`}
                >
                  <Text
                    className={`text-[13px] ${
                      timePeriod === item
                        ? "font-semibold text-green-600"
                        : "text-slate-700"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ================= STATUS FILTER ================= */}
        <View className="mx-4 mt-3 rounded-lg border border-emerald-200 bg-white p-4">
          <Text className="text-[13px] font-semibold text-slate-700">
            Filter by Status
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openStatusDropdown}
            className="mt-3 h-11 flex-row items-center justify-between rounded-md border border-emerald-300 bg-white px-3"
          >
            <Text className="text-[13px] text-orange-950">
              {status}
            </Text>

            <ChevronDown
              size={17}
              color="#9a8174"
            />
          </TouchableOpacity>

          {/* Status Dropdown */}
          {showStatus && (
            <View className="mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              {statusOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.7}
                  onPress={() => {
                    setStatus(item);
                    setShowStatus(false);
                  }}
                  className={`flex-row items-center px-3 py-3 ${
                    status === item
                      ? "bg-emerald-500"
                      : "bg-white"
                  }`}
                >
                  {status === item && (
                    <Check
                      size={16}
                      color="white"
                      strokeWidth={2.5}
                    />
                  )}

                  <Text
                    className={`text-[13px] ${
                      status === item
                        ? "ml-2 font-semibold text-white"
                        : "ml-7 text-slate-700"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ================= EMPTY / SUBSCRIPTION LIST ================= */}
        {subscriptions.length === 0 ? (
          <View className="mx-4 mt-5 items-center bg-white px-6 py-8">
            {/* Repeat Icon */}
            <Repeat2
              size={52}
              color="#9CA3AF"
              strokeWidth={2}
            />

            {/* Title */}
            <Text className="mt-4 text-[16px] font-bold text-slate-800">
              No subscriptions yet
            </Text>

            {/* Description */}
            <Text className="mt-2 text-center text-[14px] leading-5 text-slate-500">
              Start a meal subscription to enjoy{"\n"}
              regular fresh food delivery
            </Text>

            {/* Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowSubscriptionModal(true)}
              className="mt-4 h-10 items-center justify-center rounded-md bg-green-700 px-4"
            >
              <Text className="text-[13px] font-bold text-white">
                Start Your First Subscription
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mx-4 mt-5">
            {/* Subscription cards will appear here */}
          </View>
        )}
      </ScrollView>

      {/* ================================================= */}
      {/*              ADD SUBSCRIPTION MODAL               */}
      {/* ================================================= */}

      <Modal
        visible={showSubscriptionModal}
        transparent
        animationType="slide"
        onRequestClose={closeSubscriptionModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          {/* Close modal when tapping outside */}
          <Pressable
            className="flex-1"
            onPress={closeSubscriptionModal}
          />

          {/* Modal Content */}
          <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[21px] font-bold text-slate-900">
                  Start Subscription
                </Text>

                <Text className="mt-1 text-[13px] text-slate-500">
                  Choose your meal subscription
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={closeSubscriptionModal}
                className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
              >
                <Text className="text-[18px] text-slate-600">
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Subscription Plan */}
            <View className="mt-5">
              <Text className="mb-2 text-[14px] font-semibold text-slate-700">
                Subscription Plan
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                className="h-12 flex-row items-center justify-between rounded-lg border border-emerald-300 px-4"
              >
                <Text className="text-[14px] text-orange-950">
                  Select a plan
                </Text>

                <ChevronDown
                  size={17}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>

            {/* Delivery Period */}
            <View className="mt-4">
              <Text className="mb-2 text-[14px] font-semibold text-slate-700">
                Delivery Period
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                className="h-12 flex-row items-center justify-between rounded-lg border border-emerald-300 px-4"
              >
                <Text className="text-[14px] text-orange-950">
                  Select duration
                </Text>

                <CalendarDays
                  size={18}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Continue */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateSubscription}
              className="mt-6 h-12 items-center justify-center rounded-lg bg-green-700"
            >
              <Text className="text-[15px] font-bold text-white">
                Continue
              </Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={closeSubscriptionModal}
              className="mt-2 h-10 items-center justify-center"
            >
              <Text className="text-[14px] font-semibold text-slate-500">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Subs;