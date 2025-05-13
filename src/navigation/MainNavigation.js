// src/navigation/MainNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import GamePlayScreen from '../screens/GamePlayScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GamePlay" 
        component={GamePlayScreen} 
        options={({ route }) => ({ 
          title: route.params?.game?.courseName || 'New Game',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
        })}
      />
    </Stack.Navigator>
  );
}