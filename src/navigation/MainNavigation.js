// src/navigation/MainNavigation.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import GameSummaryScreen from '../screens/GameSummaryScreen';
import GameDetailsScreen from '../screens/GameDetailsScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="GameSummary"
        component={GameSummaryScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="GameDetails"
        component={GameDetailsScreen}
        options={{ 
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}