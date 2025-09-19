# FinTrack Lite Mobile

A beautiful and feature-rich mobile expense tracking app built with Expo and React Native.

## 🚀 Features

### Core Features
- **Modern UI**: Clean, mobile-optimized interface with smooth animations
- **Expense Management**: Add, edit, and delete expenses with ease
- **Budget Tracking**: Set monthly budgets with visual progress indicators
- **Category Management**: Organize expenses by categories (Food, Travel, Bills, etc.)
- **Data Persistence**: All data is saved locally using AsyncStorage
- **Mock Authentication**: Simple sign-in/out functionality

### Mobile-Specific Features
- **Native Modals**: Full-screen expense forms with smooth animations
- **Touch Gestures**: Intuitive swipe and tap interactions
- **Native Date Picker**: Platform-specific date selection
- **Category Picker**: Native dropdown for expense categories
- **Receipt Photos**: Camera integration for receipt capture (optional)
- **Responsive Design**: Optimized for all screen sizes
- **Offline-First**: Works completely offline

## 🏗 Architecture

- **React Native + Expo**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **Context API**: State management with useReducer
- **AsyncStorage**: Local data persistence
- **Linear Gradients**: Beautiful visual effects
- **Ionicons**: Consistent iconography

## 📱 Getting Started

### Prerequisites
- Node.js (14 or later)
- Expo CLI
- Expo Go app on your phone, or iOS/Android simulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Open the app:
   - **iOS**: Scan the QR code with your Camera app
   - **Android**: Scan the QR code with the Expo Go app
   - **Simulator**: Press 'i' for iOS or 'a' for Android in the terminal

## 🎨 Design Features

### Color Scheme
- **Primary Blue**: `#3b82f6` to `#1d4ed8` (gradients)
- **Success Green**: `#10b981` to `#059669`
- **Warning Amber**: `#f59e0b` to `#d97706`
- **Danger Red**: `#ef4444` to `#dc2626`

### UI Components
- **Floating Action Button**: Quick expense creation
- **Card-based Layout**: Clean component separation
- **Progress Bars**: Visual budget tracking
- **Category Badges**: Color-coded expense categories
- **Native Inputs**: Platform-specific form controls

## 📊 App Structure

```
components/
├── Auth.tsx           # Authentication screen
├── Header.tsx         # App header with user info
├── Dashboard.tsx      # Main dashboard layout
├── BudgetTracker.tsx  # Budget overview component
├── ExpenseList.tsx    # Expense list with filtering
└── ExpenseForm.tsx    # Add/edit expense modal

context/
├── AuthContext.tsx    # Authentication state
└── AppContext.tsx     # App state with AsyncStorage

types.ts              # TypeScript type definitions
App.tsx              # Main app component
```

## 🔧 Development

The app uses:
- **Hot Reloading**: Changes appear instantly
- **TypeScript**: Full type safety
- **ESLint**: Code quality
- **Prettier**: Code formatting

## 📱 Mobile Features

### Native Components Used
- `Modal` - Full-screen expense forms
- `FlatList` - Optimized expense list
- `TouchableOpacity` - Interactive buttons
- `Alert` - Native confirmation dialogs
- `DateTimePicker` - Platform date selection
- `ImagePicker` - Camera/gallery access
- `AsyncStorage` - Local data storage

### Performance Optimizations
- Memoized components with `useMemo`
- Optimized FlatList rendering
- Efficient state updates
- Minimal re-renders

## 🎯 Future Enhancements

- Push notifications for budget alerts
- Export data to CSV
- Charts and analytics
- Multiple currency support
- Cloud sync capabilities
- Recurring expenses
- Split expenses
- Receipt text extraction (OCR)

## 🧪 Testing

To test the app:
1. Run `npx expo start`
2. Test on physical device with Expo Go
3. Test budget calculations
4. Test data persistence (close/reopen app)
5. Test expense CRUD operations
6. Test category filtering

## 📄 License

This is a demo project for learning purposes.