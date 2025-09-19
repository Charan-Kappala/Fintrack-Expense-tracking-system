import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';
import { Expense, Category } from '../types';

interface ExpenseFormProps {
  expenseToEdit: Expense | null;
  visible: boolean;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expenseToEdit,
  visible,
  onClose,
}) => {
  const { addExpense, updateExpense } = useAppContext();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.Food);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [receiptUri, setReceiptUri] = useState<string>('');

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDate(new Date(expenseToEdit.date));
      setNotes(expenseToEdit.notes);
      setReceiptUri(expenseToEdit.receiptUrl || '');
    } else {
      resetForm();
    }
  }, [expenseToEdit, visible]);

  const resetForm = () => {
    setAmount('');
    setCategory(Category.Food);
    setDate(new Date());
    setNotes('');
    setReceiptUri('');
  };

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (!notes.trim()) {
      Alert.alert('Missing Notes', 'Please add a note for the expense.');
      return;
    }

    const expenseData = {
      amount: parsedAmount,
      category,
      date: date.toISOString(),
      notes: notes.trim(),
      receiptUrl: receiptUri || undefined,
    };

    if (expenseToEdit) {
      updateExpense({ ...expenseData, id: expenseToEdit.id });
    } else {
      addExpense(expenseData);
    }
    
    onClose();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {expenseToEdit ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={styles.iconBackground}
            >
              <Text style={styles.iconText}>$</Text>
            </LinearGradient>
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Category Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
                dropdownIconColor="#374151"
                itemStyle={Platform.OS === 'ios' ? { fontSize: 18, height: 64 } : undefined}
                mode={Platform.OS === 'android' ? 'dialog' : 'dropdown'}
              >
                {Object.values(Category).map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} color='#1f2937' />
                ))}
              </Picker>
            </View>
          </View>

          {/* Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="What was this expense for?"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Receipt Photo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Receipt (Optional)</Text>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#3b82f6" />
              <Text style={styles.photoButtonText}>
                {receiptUri ? 'Change Photo' : 'Add Receipt Photo'}
              </Text>
            </TouchableOpacity>
            {receiptUri ? (
              <Text style={styles.photoSelectedText}>Photo selected</Text>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              style={styles.submitButtonWrapper}
            >
              <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>
                  {expenseToEdit ? 'Save Changes' : 'Add Expense'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: '#1f2937',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    height: 64,
    minHeight: 64,
    width: '100%',
    color: '#1f2937', // Ensure text is visible
    fontSize: 18,     // Ensure font size is readable
    paddingVertical: 0,
    marginVertical: 0,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    height: 56,
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  photoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  photoSelectedText: {
    marginTop: 8,
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButtonWrapper: {
    flex: 1,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ExpenseForm;