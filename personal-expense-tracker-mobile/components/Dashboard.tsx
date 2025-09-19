import React from 'react';
import { View, StyleSheet } from 'react-native';
import ExpenseList from './ExpenseList';
import { Expense } from '../types';

interface DashboardProps {
  onEditExpense: (expense: Expense) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onEditExpense }) => {
  return (
    <View style={styles.container}>
      <ExpenseList onEdit={onEditExpense} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});

export default Dashboard;