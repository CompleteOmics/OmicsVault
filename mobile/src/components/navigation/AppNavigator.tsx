import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';
import { colors } from '../../utils/theme';

// Auth Screens
import { SignInScreen } from '../../screens/auth/SignInScreen';
import { SignUpScreen } from '../../screens/auth/SignUpScreen';

// Main Screens
import { DashboardScreen } from '../../screens/dashboard/DashboardScreen';
import { LabScreen } from '../../screens/labs/LabScreen';
import { ItemDetailScreen } from '../../screens/items/ItemDetailScreen';
import { ItemCreateScreen } from '../../screens/items/ItemCreateScreen';
import { LocationCreateScreen } from '../../screens/locations/LocationCreateScreen';
import { LocationDetailScreen } from '../../screens/locations/LocationDetailScreen';
import { QRScannerScreen } from '../../screens/items/QRScannerScreen';

import { LoadingSpinner } from '../common/LoadingSpinner';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
};

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Lab" component={LabScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="ItemCreate" component={ItemCreateScreen} />
      <Stack.Screen name="LocationCreate" component={LocationCreateScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
