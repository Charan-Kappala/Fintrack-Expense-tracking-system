import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const BudgetTracker: React.FC = () => {
  const { state, setBudget } = useAppContext();
  const { expenses, budget } = state;
  const [newBudget, setNewBudget] = useState(budget.toString());
  const [isEditing, setIsEditing] = useState(false);

  const totalExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const remainingBudget = budget - totalExpenses;
  const budgetUsagePercentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;

  const handleBudgetSave = () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
      return;
    }
    setBudget(amount);
    setIsEditing(false);
  };

  const getProgressBarColor = (): [string, string] => {
    if (budgetUsagePercentage > 80) return ['#ef4444', '#dc2626'];
    if (budgetUsagePercentage > 50) return ['#f59e0b', '#d97706'];
    return ['#10b981', '#059669'];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Budget</Text>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.budgetInput}
              value={newBudget}
              onChangeText={setNewBudget}
              keyboardType="decimal-pad"
              placeholder="Enter budget"
              autoFocus
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleBudgetSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.budgetAmount}>${budget.toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={getProgressBarColor()}
            style={[
              styles.progressBar,
              { width: `${Math.min(budgetUsagePercentage, 100)}%` }
            ]}
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={styles.statValue}>
            ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text style={[
            styles.statValue,
            { color: remainingBudget < 0 ? '#ef4444' : '#10b981' }
          ]}>
            ${remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Usage</Text>
          <Text style={styles.statValue}>
            {budgetUsagePercentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Warning */}
      {budgetUsagePercentage > 80 && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#ef4444" />
          <Text style={styles.warningText}>
            You've used over 80% of your budget this month!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minWidth: 100,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#dc2626',
    flex: 1,
  },
});

export default BudgetTracker;