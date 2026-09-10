import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import {
  Search,
  Mic,
  Filter,
  ChevronDown,
  Package,
  Check,
  X,
} from 'lucide-react-native';

const TIME_PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'Next 7 Days', value: 'next7days' },
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'All Orders', value: 'all' },
];

const FILTER_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const Orders = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchText, setSearchText] = useState('');

  const currentPeriodLabel =
    TIME_PERIODS.find((p) => p.value === selectedPeriod)?.label || 'Select';

  const toggleFilter = (value) => {
    setSelectedFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const clearFilters = () => setSelectedFilters([]);

  return (
    <View className="flex-1 bg-[#F1F8F2]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center pt-12 pb-6 px-6">
          <Text className="text-[32px] font-extrabold text-black">My Orders</Text>
          <Text className="text-[14px] text-gray-600 mt-2 text-center">
            Track your order history and current orders
          </Text>
        </View>

        {/* Stats Card */}
        <View className="mx-4 bg-white rounded-2xl border border-[#C8E6C9] py-5 flex-row justify-around">
          <StatItem value="0" label="Today" color="#1B5E20" />
          <StatItem value="0" label="This Week" color="#8B4513" />
          <StatItem value="₹0" label="Total" color="#1B5E20" />
        </View>

        {/* Time Period Card */}
        <View className="mx-4 mt-5 bg-white rounded-2xl border border-[#C8E6C9] p-4">
          <Text className="text-[15px] font-semibold text-black mb-3">
            Time Period
          </Text>
          <TouchableOpacity
            onPress={() => setPeriodModalVisible(true)}
            className="border border-[#C8E6C9] rounded-xl px-4 py-3.5 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <Text className="text-[15px] text-gray-800">
              {currentPeriodLabel}
            </Text>
            <ChevronDown size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Search + Filters Card */}
        <View className="mx-4 mt-5 bg-white rounded-2xl border border-[#C8E6C9] p-4">
      {/* Search row */}
<View className="flex-row items-center">
  <View className="flex-1 flex-row items-center border border-[#C8E6C9] rounded-xl px-3 py-2.5 mr-3">
    <Search size={18} color="#666" />
    <TextInput
      value={searchText}
      onChangeText={setSearchText}
      placeholder="Search orders..."
      placeholderTextColor="#999"
      className="flex-1 ml-2 text-[15px] text-black"
      style={{ paddingVertical: 0 }}
    />
  </View>

  <View className="relative items-center justify-center pt-5">
    <Text className="absolute -top-0 right-0 text-[#E53935] text-[11px] font-semibold">
      Try voice! ↑
    </Text>
    <TouchableOpacity
      className="w-14 h-14 rounded-full bg-[#E53935] items-center justify-center"
      activeOpacity={0.8}
    >
      <Mic size={24} color="#fff" />
    </TouchableOpacity>
  </View>
</View>
          {/* Filters row */}
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            className="mt-3 border border-[#C8E6C9] rounded-xl py-3.5 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Filter size={18} color="#333" />
            <Text className="ml-2 text-[15px] font-semibold text-black">
              Filters
            </Text>
            {selectedFilters.length > 0 && (
              <View className="ml-2 bg-[#FFC107] rounded-full px-3 py-0.5">
                <Text className="text-[12px] font-bold text-black">
                  Active
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Empty State Card */}
        <View className="mx-4 mt-5 bg-white rounded-2xl border border-[#C8E6C9] py-14 items-center">
          <Package size={64} color="#B0BEC5" strokeWidth={1.5} />
          <Text className="text-[18px] font-bold text-black mt-5">
            No orders yet
          </Text>
          <Text className="text-[14px] text-gray-500 mt-2">
            Start your meal journey with us!
          </Text>
        </View>
      </ScrollView>

      {/* Time Period Modal */}
      <Modal
        visible={periodModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPeriodModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setPeriodModalVisible(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-bold text-black">
                Select Time Period
              </Text>
              <TouchableOpacity onPress={() => setPeriodModalVisible(false)}>
                <X size={22} color="#333" />
              </TouchableOpacity>
            </View>

            {TIME_PERIODS.map((item) => {
              const isSelected = selectedPeriod === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setSelectedPeriod(item.value);
                    setPeriodModalVisible(false);
                  }}
                  className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl mb-2 ${
                    isSelected ? 'bg-[#E8F5E9]' : 'bg-[#F7F7F7]'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-[15px] ${
                      isSelected ? 'text-[#1B5E20] font-semibold' : 'text-black'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {isSelected && <Check size={18} color="#1B5E20" />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setFilterModalVisible(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-bold text-black">Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={FILTER_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = selectedFilters.includes(item.value);
                return (
                  <TouchableOpacity
                    onPress={() => toggleFilter(item.value)}
                    className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl mb-2 ${
                      isSelected ? 'bg-[#E8F5E9]' : 'bg-[#F7F7F7]'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-[15px] ${
                        isSelected ? 'text-[#1B5E20] font-semibold' : 'text-black'
                      }`}
                    >
                      {item.label}
                    </Text>
                    <View
                      className={`w-5 h-5 rounded-md border-2 items-center justify-center ${
                        isSelected
                          ? 'bg-[#1B5E20] border-[#1B5E20]'
                          : 'border-gray-400'
                      }`}
                    >
                      {isSelected && <Check size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            <View className="flex-row mt-4">
              <TouchableOpacity
                onPress={clearFilters}
                className="flex-1 border border-[#C8E6C9] rounded-xl py-3.5 items-center mr-2"
                activeOpacity={0.7}
              >
                <Text className="text-[15px] font-semibold text-black">
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                className="flex-1 bg-[#1B5E20] rounded-xl py-3.5 items-center ml-2"
                activeOpacity={0.8}
              >
                <Text className="text-[15px] font-semibold text-white">
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const StatItem = ({ value, label, color }) => (
  <View className="items-center flex-1">
    <Text className="text-[26px] font-extrabold" style={{ color }}>
      {value}
    </Text>
    <Text className="text-[13px] text-gray-500 mt-1">{label}</Text>
  </View>
);

export default Orders;