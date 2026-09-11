import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Search,
  Mic,
  Filter,
  ChevronDown,
  Package,
  Check,
  X,
  MapPin,
  Clock,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const TIME_PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'Next 7 Days', value: 'next7days' },
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'All Orders', value: 'all' },
];

const FILTER_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchText, setSearchText] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      console.log('[Orders.js] Fetching user orders from Supabase...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.warn('[Orders.js] No active session found.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*, addresses(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Orders.js] Supabase orders fetch error:', error.message);
      } else {
        console.log(`[Orders.js] Loaded ${data?.length || 0} orders successfully.`);
        setOrders(data || []);
      }
    } catch (err) {
      console.error('[Orders.js] Unexpected error loading orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const currentPeriodLabel =
    TIME_PERIODS.find((p) => p.value === selectedPeriod)?.label || 'Select';

  const toggleFilter = (value) => {
    setSelectedFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const clearFilters = () => setSelectedFilters([]);

  // Compute Stats Dynamically from loaded user orders
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let todayCount = 0;
    let thisWeekCount = 0;
    let totalRevenue = 0;

    orders.forEach((o) => {
      const orderDateStr = o.order_date || o.created_at?.split('T')[0];
      const orderDateTime = new Date(o.created_at || o.order_date);

      if (orderDateStr === todayStr) {
        todayCount += 1;
      }
      if (orderDateTime >= oneWeekAgo) {
        thisWeekCount += 1;
      }
      totalRevenue += Number(o.total_amount || 0);
    });

    return {
      todayCount,
      thisWeekCount,
      totalRevenue: Math.round(totalRevenue),
    };
  }, [orders]);

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);

    return orders.filter((order) => {
      const orderDateStr = order.order_date || order.created_at?.split('T')[0];
      const orderDateObj = new Date(orderDateStr);

      // Period Filter
      if (selectedPeriod === 'today' && orderDateStr !== todayStr) return false;
      if (selectedPeriod === 'tomorrow' && orderDateStr !== tomorrowStr) return false;
      if (selectedPeriod === 'next7days') {
        if (orderDateObj <= today || orderDateObj > next7Days) return false;
      }
      if (selectedPeriod === 'last7days') {
        if (orderDateObj >= today || orderDateObj < last7Days) return false;
      }

      // Status Filter
      if (selectedFilters.length > 0) {
        const orderStatus = (order.status || 'pending').toLowerCase();
        if (!selectedFilters.includes(orderStatus)) return false;
      }

      // Search Filter
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const sessionMatch = order.session?.toLowerCase().includes(q);
        const statusMatch = order.status?.toLowerCase().includes(q);
        const localityMatch = order.addresses?.locality?.toLowerCase().includes(q);
        const areaMatch = order.addresses?.area?.toLowerCase().includes(q);

        // Check inside item objects
        const itemsObj = order.items || {};
        const itemIdsMatch = Object.keys(itemsObj).some((k) => k.toLowerCase().includes(q));

        if (!sessionMatch && !statusMatch && !localityMatch && !areaMatch && !itemIdsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedPeriod, selectedFilters, searchText]);

  return (
    <View className="flex-1 bg-[#F1F8F2]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />
        }
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
          <StatItem value={stats.todayCount.toString()} label="Today" color="#1B5E20" />
          <StatItem value={stats.thisWeekCount.toString()} label="This Week" color="#8B4513" />
          <StatItem value={`₹${stats.totalRevenue}`} label="Total" color="#1B5E20" />
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
          <View className="flex-row items-center gap-2.5">
            <View className="flex-1 flex-row items-center border border-[#C8E6C9] rounded-xl px-3 h-12 bg-white">
              <Search size={18} color="#666" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search orders..."
                placeholderTextColor="#999"
                className="flex-1 ml-2 text-[15px] text-black"
                style={{
                  paddingVertical: 0,
                  includeFontPadding: false,
                  textAlignVertical: "center",
                }}
              />
              {searchText ? (
                <TouchableOpacity
                  onPress={() => setSearchText("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              className="w-12 h-12 rounded-2xl bg-[#E53935] items-center justify-center shadow-xs"
              activeOpacity={0.8}
            >
              <Mic size={20} color="#fff" />
            </TouchableOpacity>
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
                  {selectedFilters.length} Active
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Dynamic Orders List OR Empty State */}
        {loading ? (
          <View className="mx-4 mt-5 bg-white rounded-2xl border border-[#C8E6C9] py-14 items-center">
            <ActivityIndicator size="large" color="#1B5E20" />
            <Text className="text-xs font-semibold text-slate-500 mt-3">Loading orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="mx-4 mt-5 bg-white rounded-2xl border border-[#C8E6C9] py-14 items-center">
            <Package size={64} color="#B0BEC5" strokeWidth={1.5} />
            <Text className="text-[18px] font-bold text-black mt-5">
              No orders yet
            </Text>
            <Text className="text-[14px] text-gray-500 mt-2">
              Start your meal journey with us!
            </Text>
          </View>
        ) : (
          <View className="mx-4 mt-4" style={{ gap: 12 }}>
            {filteredOrders.map((item) => {
              const itemCount = Object.values(item.items || {}).reduce((a, b) => a + b, 0);
              const address = item.addresses;

              return (
                <View
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#C8E6C9] p-4 shadow-xs"
                >
                  <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                    <View className="flex-row items-center">
                      <Clock size={16} color="#1B5E20" />
                      <Text className="ml-1.5 text-xs font-bold text-[#1B5E20] uppercase">
                        {item.session || 'Order'} • {item.order_date || item.created_at?.split('T')[0]}
                      </Text>
                    </View>
                    <View
                      className={`px-2.5 py-0.5 rounded-full ${
                        item.status === 'delivered'
                          ? 'bg-emerald-100'
                          : item.status === 'cancelled'
                          ? 'bg-rose-100'
                          : 'bg-amber-100'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-extrabold capitalize ${
                          item.status === 'delivered'
                            ? 'text-emerald-800'
                            : item.status === 'cancelled'
                            ? 'text-rose-800'
                            : 'text-amber-800'
                        }`}
                      >
                        {item.status || 'Confirmed'}
                      </Text>
                    </View>
                  </View>

                  <View className="py-3">
                    <Text className="text-sm font-bold text-slate-900">
                      {itemCount} {itemCount === 1 ? 'Meal item' : 'Meal items'} ordered
                    </Text>
                    {address && (
                      <View className="flex-row items-center mt-1">
                        <MapPin size={13} color="#64748b" />
                        <Text className="text-xs text-slate-500 ml-1" numberOfLines={1}>
                          {[address.locality, address.area].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
                    <Text className="text-xs text-slate-500 font-medium">Total Paid</Text>
                    <Text className="text-base font-black text-slate-900">
                      ₹{item.total_amount}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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