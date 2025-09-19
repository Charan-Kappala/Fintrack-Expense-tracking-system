import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ClerkProvider } from '@clerk/clerk-expo';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Auth from './components/Auth';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import { Expense } from './types';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

function AppContent() {
  const { isSignedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleOpenModal = (expense: Expense | null = null) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  if (!isSignedIn) {
    return <Auth />;
  }

  return (
    <View style={styles.container}>
      <Header />
      <Dashboard onEditExpense={handleOpenModal} />
      
      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fabContainer}
        onPress={() => handleOpenModal()}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          style={styles.fab}
        >
          <Ionicons name="add" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      <ExpenseForm
        expenseToEdit={editingExpense}
        visible={isModalOpen}
        onClose={handleCloseModal}
      />
    </View>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <AppContent />
            <StatusBar style="dark" />
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
