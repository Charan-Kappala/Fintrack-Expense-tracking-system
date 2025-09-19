import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import BudgetTracker from './BudgetTracker';
import SpendingTimeline from './SpendingTimeline';
import CategoryChart from './CategoryChart';
import { Expense, Category } from '../types';

interface ExpenseListProps {
  onEdit: (expense: Expense) => void;
}

const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => {
  const categoryColors: { [key in Category]: { bg: string; text: string } } = {
    [Category.Food]: { bg: '#dcfce7', text: '#166534' },
    [Category.Travel]: { bg: '#dbeafe', text: '#1d4ed8' },
    [Category.Bills]: { bg: '#fed7aa', text: '#c2410c' },
    [Category.Entertainment]: { bg: '#e9d5ff', text: '#7c3aed' },
    [Category.Shopping]: { bg: '#fce7f3', text: '#be185d' },
    [Category.Health]: { bg: '#fef3c7', text: '#d97706' },
    [Category.Other]: { bg: '#f3f4f6', text: '#374151' },
  };

  const colors = categoryColors[category];

  return (
    <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.categoryBadgeText, { color: colors.text }]}>
        {category}
      </Text>
    </View>
  );
};

const ExpenseList: React.FC<ExpenseListProps> = ({ onEdit }) => {
  const { state, deleteExpense } = useAppContext();
  const [filter, setFilter] = useState<'all' | Category>('all');

  const filteredExpenses = useMemo(() => {
    const sortedExpenses = [...state.expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return filter === 'all'
      ? sortedExpenses
      : sortedExpenses.filter(exp => exp.category === filter);
  }, [state.expenses, filter]);

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.notes}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteExpense(expense.id)
        }
      ]
    );
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseContent}>
        <View style={styles.expenseHeader}>
          <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
          <CategoryBadge category={item.category} />
        </View>
        <Text style={styles.expenseNotes}>{item.notes}</Text>
        <Text style={styles.expenseDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.expenseActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(item)}
        >
          <Ionicons name="pencil" size={18} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      {/* Dashboard cards */}
      <BudgetTracker />
      <SpendingTimeline />
      <CategoryChart />

      {/* Recent expenses header and filter */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Recent Expenses</Text>
        <View style={styles.filterContainer}>
          <Picker
            selectedValue={filter}
            onValueChange={(itemValue) => setFilter(itemValue)}
            style={styles.filterPicker}
            mode={Platform.OS === 'android' ? 'dialog' : 'dropdown'}
            dropdownIconColor="#374151"
            dropdownIconRippleColor={Platform.OS === 'android' ? '#e5e7eb' : undefined}
            itemStyle={Platform.OS === 'ios' ? { fontSize: 18, height: 64 } : undefined}
          >
            <Picker.Item label="All Categories" value="all" />
            {Object.values(Category).map(cat => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No expenses found</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all' 
          ? "Start tracking your expenses by tapping the + button" 
          : "No expenses found for this category"
        }
      </Text>
    </View>
  );

  return (
    <FlatList
      data={filteredExpenses}
      renderItem={renderExpenseItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListEmpty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 100, // Space for FAB
        ...(filteredExpenses.length === 0 ? styles.emptyContent : {})
      }}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listHeader: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  filterContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  filterPicker: {
    height: 64,
    minHeight: 64,
    width: '100%',
    paddingVertical: 0,
    marginVertical: 0,
    color: '#1f2937',
    fontSize: 18,
  },
  expenseItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  expenseNotes: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  expenseActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ExpenseList;