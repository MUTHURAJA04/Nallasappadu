import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  Wallet as WalletIcon,
  Plus,
  Filter,
  ChevronDown,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
} from "lucide-react-native";

// Import your configured Supabase client instance
import { supabase } from "../lib/supabase"; 

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [amount, setAmount] = useState("");

  const [transactionType, setTransactionType] = useState("All");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Fetch balance and transactions
  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Authentication required", "Please sign in to view your wallet.");
        return;
      }

      // 1. Fetch balance
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (walletError) throw walletError;

      // Create wallet row if user doesn't have one yet
      if (!walletData) {
        await supabase.from("wallets").insert({ user_id: user.id, balance: 0 });
        setBalance(0);
      } else {
        setBalance(Number(walletData.balance));
      }

      // 2. Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("id, type, amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (err) {
      Alert.alert("Error fetching wallet", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Insert transaction into Supabase
  const handleAddMoney = async () => {
    const value = parseFloat(amount);

    if (!value || value <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than zero.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("No authenticated user found.");

      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            type: "Credit",
            amount: value,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Optimistic balance & state update
      setBalance((prev) => prev + value);
      setTransactions((prev) => [data, ...prev]);

      setAmount("");
      setShowAddMoneyModal(false);
    } catch (err) {
      Alert.alert("Transaction Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions =
    transactionType === "All"
      ? transactions
      : transactions.filter(
          (item) => item.type.toLowerCase() === transactionType.toLowerCase()
        );

  return (
    <View className="flex-1 bg-[#f4fbf7]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="items-center px-5 pt-7">
          <Text className="text-[28px] font-bold text-slate-900">My Wallet</Text>
          <Text className="mt-1 text-center text-[16px] leading-6 text-slate-600">
            Manage your wallet balance and transaction{"\n"}history
          </Text>
        </View>

        {/* Wallet Card */}
        <View className="mx-4 mt-5 rounded-xl border border-emerald-200 bg-white p-5">
          <View className="items-center rounded-xl border border-emerald-200 bg-emerald-50/40 py-8">
            <WalletIcon size={42} color="#16a34a" strokeWidth={2} />

            {loading ? (
              <ActivityIndicator size="small" color="#16a34a" className="mt-4" />
            ) : (
              <Text className="mt-4 text-[32px] font-bold text-green-800">
                ₹{balance.toFixed(2)}
              </Text>
            )}

            <Text className="mt-1 text-[16px] font-semibold text-green-600">
              Available Balance
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowAddMoneyModal(true)}
            className="mt-5 h-12 flex-row items-center justify-center rounded-lg bg-green-600"
          >
            <Plus size={19} color="white" strokeWidth={2.5} />
            <Text className="ml-2 text-[16px] font-bold text-white">
              Add Money to Wallet
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Ledger */}
        <View className="mx-4 mt-5 rounded-xl bg-white p-5">
          <View className="flex-row items-center">
            <View className="h-5 w-5 items-center justify-center">
              <WalletIcon size={19} color="#2563eb" strokeWidth={2} />
            </View>
            <Text className="ml-2 text-[17px] font-medium text-orange-950">
              Wallet Ledger
            </Text>
          </View>

          {/* Counts */}
          <View className="mt-3 flex-row items-center">
            <View className="rounded-full border border-green-500 px-3 py-0.5">
              <Text className="text-[11px] font-medium text-green-600">
                {transactions.filter((item) => item.type === "Credit").length} Credits
              </Text>
            </View>

            <View className="ml-2 rounded-full border border-red-400 px-3 py-0.5">
              <Text className="text-[11px] font-medium text-red-500">
                {transactions.filter((item) => item.type === "Debit").length} Debits
              </Text>
            </View>
          </View>

          {/* Filters */}
          <View className="mt-3 rounded-lg bg-slate-50 p-4">
            <View className="flex-row items-center">
              <Filter size={17} color="#475569" />
              <Text className="ml-2 text-[14px] font-medium text-slate-700">Filters:</Text>
            </View>

            {/* Type */}
            <View className="mt-3">
              <Text className="mb-2 text-[13px] font-medium text-orange-950">Type:</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowTypeDropdown((prev) => !prev)}
                className="h-10 flex-row items-center justify-between rounded-md border border-emerald-200 bg-white px-3"
              >
                <Text className="text-[13px] text-slate-700">{transactionType}</Text>
                <ChevronDown size={17} color="#94a3b8" />
              </TouchableOpacity>

              {showTypeDropdown && (
                <View className="mt-1 overflow-hidden rounded-md border border-emerald-200 bg-white">
                  {["All", "Credit", "Debit"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        setTransactionType(type);
                        setShowTypeDropdown(false);
                      }}
                      className={`px-3 py-3 ${
                        transactionType === type ? "bg-emerald-50" : "bg-white"
                      }`}
                    >
                      <Text
                        className={`text-[13px] ${
                          transactionType === type
                            ? "font-semibold text-green-700"
                            : "text-slate-700"
                        }`}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Transaction Count */}
            <Text className="mt-3 text-[11px] text-slate-500">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </Text>
          </View>

          {/* Transaction List */}
          {loading ? (
            <ActivityIndicator size="small" color="#16a34a" className="py-12" />
          ) : filteredTransactions.length === 0 ? (
            <View className="items-center px-5 py-12">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <WalletIcon size={30} color="#94a3b8" />
              </View>
              <Text className="mt-4 text-[17px] font-semibold text-slate-800">
                No transactions yet
              </Text>
              <Text className="mt-2 text-center text-[13px] leading-5 text-slate-500">
                Your transaction history will appear here
              </Text>
            </View>
          ) : (
            <View className="mt-4">
              {filteredTransactions.map((item) => (
                <View
                  key={item.id}
                  className="mb-3 flex-row items-center rounded-lg border border-slate-100 bg-white p-3"
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      item.type === "Credit" ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    {item.type === "Credit" ? (
                      <ArrowDownToLine size={20} color="#16a34a" />
                    ) : (
                      <ArrowUpFromLine size={20} color="#ef4444" />
                    )}
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-[14px] font-semibold text-slate-800">
                      {item.type}
                    </Text>
                    <Text className="mt-1 text-[11px] text-slate-500">
                      {new Date(item.created_at).toLocaleDateString("en-IN")}
                    </Text>
                  </View>

                  <Text
                    className={`text-[15px] font-bold ${
                      item.type === "Credit" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {item.type === "Credit" ? "+" : "-"}₹
                    {Number(item.amount).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Money Modal */}
      <Modal
        visible={showAddMoneyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMoneyModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={() => setShowAddMoneyModal(false)} />

          <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[21px] font-bold text-slate-900">Add Money</Text>
                <Text className="mt-1 text-[13px] text-slate-500">
                  Add money to your wallet balance
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddMoneyModal(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
              >
                <X size={19} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Current Balance */}
            <View className="mt-5 rounded-xl bg-emerald-50 p-4">
              <Text className="text-[12px] text-slate-600">Current Balance</Text>
              <Text className="mt-1 text-[23px] font-bold text-green-700">
                ₹{balance.toFixed(2)}
              </Text>
            </View>

            {/* Input */}
            <View className="mt-5">
              <Text className="mb-2 text-[14px] font-semibold text-slate-700">
                Enter Amount
              </Text>
              <View className="flex-row items-center rounded-xl border border-emerald-300 bg-white px-4">
                <Text className="text-[22px] font-semibold text-slate-700">₹</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  className="ml-2 h-14 flex-1 text-[20px] text-slate-900"
                />
              </View>
            </View>

            {/* Quick Amounts */}
            <View className="mt-4 flex-row">
              {[100, 500, 1000, 2000].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setAmount(String(val))}
                  className="mr-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2"
                >
                  <Text className="text-[12px] font-semibold text-green-700">₹{val}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isSubmitting}
              onPress={handleAddMoney}
              className="mt-6 h-12 items-center justify-center rounded-xl bg-green-600"
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-[16px] font-bold text-white">Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAddMoneyModal(false)}
              className="mt-3 h-11 items-center justify-center"
            >
              <Text className="text-[14px] font-semibold text-slate-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Wallet;