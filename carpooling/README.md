# CarPooling React Native App

A comprehensive carpooling application built with React Native that connects drivers with passengers for cost-effective and eco-friendly commuting.

## 🚀 Features

### Current Implementation (Phase 1)
- ✅ **Authentication System**
  - Welcome screen with beautiful UI
  - Login with email/password
  - Signup with user details
  - Mock authentication service (ready for .NET backend)

- ✅ **Core Navigation**
  - Bottom tab navigation
  - Auth flow navigation
  - Conditional rendering based on auth state

- ✅ **Main Screens**
  - Home screen with quick actions
  - Rides screen with upcoming/past tabs
  - Profile screen with user info and settings

- ✅ **Design System**
  - Vibrant color palette
  - Consistent typography
  - Reusable components (Button, Input, Card)
  - Responsive layouts

- ✅ **State Management**
  - Redux Toolkit setup
  - Auth slice
  - Rides slice
  - Bookings slice
  - Notifications slice

- ✅ **Utilities**
  - Date formatting
  - Location calculations
  - Fare calculator
  - Form validators

### Planned Features (Phase 2+)
- 🔄 **Driver Features**
  - Post ride flow (7+ screens)
  - Manage ride requests
  - View earnings
  - Recurring rides

- 🔄 **Passenger Features**
  - Search rides with filters
  - Book rides
  - Payment integration
  - Real-time tracking

- 🔄 **Shared Features**
  - In-app chat
  - Rating & reviews
  - Push notifications
  - Ride history

## 📁 Project Structure

```
carpooling/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── rides/           # Ride-specific components
│   │   ├── map/             # Map components
│   │   ├── location/        # Location components
│   │   └── payment/         # Payment components
│   │
│   ├── screens/
│   │   ├── auth/            # Authentication screens
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── driver/          # Driver-specific screens
│   │   ├── passenger/       # Passenger-specific screens
│   │   ├── shared/          # Shared screens
│   │   ├── HomeScreen.tsx
│   │   ├── RidesScreen.tsx
│   │   └── ProfileScreen.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx # Root navigator
│   │   ├── AuthStack.tsx    # Auth flow
│   │   └── MainTabs.tsx     # Main app tabs
│   │
│   ├── store/
│   │   ├── index.ts         # Redux store config
│   │   └── slices/          # Redux slices
│   │       ├── authSlice.ts
│   │       ├── ridesSlice.ts
│   │       ├── bookingsSlice.ts
│   │       └── notificationsSlice.ts
│   │
│   ├── services/
│   │   └── mockAuth.ts      # Mock authentication service
│   │
│   ├── utils/
│   │   ├── dateUtils.ts     # Date formatting utilities
│   │   ├── locationUtils.ts # Location calculations
│   │   ├── fareCalculator.ts# Fare calculations
│   │   └── validators.ts    # Form validation
│   │
│   ├── theme/
│   │   ├── colors.ts        # Color palette
│   │   ├── typography.ts    # Typography system
│   │   ├── spacing.ts       # Spacing scale
│   │   ├── shadows.ts       # Shadow styles
│   │   └── index.ts         # Theme config
│   │
│   └── types/
│       └── index.ts         # TypeScript types
│
├── App.tsx                  # App entry point
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: React Native 0.83.1
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Storage**: AsyncStorage
- **Date Handling**: date-fns
- **Maps**: React Native Maps (Planned for Phase 4)

> **Note**: `react-native-maps` and `react-native-reanimated` are currently excluded from the initial build to ensure stability. They will be integrated in later phases.

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **iOS Setup** (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Run the app**:
   
   **Android**:
   ```bash
   npm run android
   ```
   
   **iOS**:
   ```bash
   npm run ios
   ```

## 🎨 Design System

### Colors
- **Primary**: #0066FF (Vibrant Blue)
- **Secondary**: #FF6B35 (Orange)
- **Accent**: #00D9A3 (Teal)
- **Success**: #10B981
- **Warning**: #F59E0B
- **Error**: #EF4444

### Typography
- Font sizes: xs (12px) to 5xl (48px)
- Font weights: regular, medium, semiBold, bold

### Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Input**: With label, error states, icons
- **Card**: With elevation levels

## 🔌 Backend Integration Points

All mock services are designed to be easily replaced with real .NET API calls:

### Authentication (`src/services/mockAuth.ts`)
- `login(email, password)` → POST `/api/auth/login`
- `signup(...)` → POST `/api/auth/signup`
- `getCurrentUser()` → GET `/api/auth/me`
- `logout()` → POST `/api/auth/logout`

### Rides (To be implemented)
- `postRide(rideData)` → POST `/api/rides`
- `searchRides(filters)` → GET `/api/rides/search`
- `getRideDetails(id)` → GET `/api/rides/:id`

### Bookings (To be implemented)
- `createBooking(bookingData)` → POST `/api/bookings`
- `acceptBooking(id)` → PUT `/api/bookings/:id/accept`
- `rejectBooking(id)` → PUT `/api/bookings/:id/reject`

### Payments (To be implemented)
- `processPayment(paymentData)` → POST `/api/payments`
- `getPaymentMethods()` → GET `/api/payments/methods`

## 🧪 Testing

```bash
npm test
```

## 📱 Screenshots

(Screenshots will be added after UI is complete)

## 🚧 Next Steps

1. **Complete Driver Flow**
   - Implement all 7 screens for posting a ride
   - Add ride management features
   - Implement passenger request handling

2. **Complete Passenger Flow**
   - Build search interface with filters
   - Create booking flow
   - Add payment screens

3. **Add Real-time Features**
   - Integrate Socket.io for live updates
   - Add push notifications
   - Implement chat functionality

4. **Maps Integration**
   - Add Google Maps API
   - Implement route display
   - Add live tracking

5. **.NET Backend Integration**
   - Replace all mock services
   - Add API client configuration
   - Implement error handling

## 📄 License

MIT

## 👥 Contributors

- Your Name

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
