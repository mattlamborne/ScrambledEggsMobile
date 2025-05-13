// src/navigation/TabNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useGameContext } from '../context/GameContext';
import React from 'react';

import HomeScreen from '../screens/HomeScreen';
import NewGameScreen from '../screens/NewGameScreen';
import GameHistoryScreen from '../screens/GameHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GamePlayScreen from '../screens/GamePlayScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { activeGame } = useGameContext();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'New Game') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Active Game') {
            iconName = focused ? 'golf' : 'golf-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#AAAAAA',
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        }
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: true }}
      />
      <Tab.Screen name="New Game" component={NewGameScreen} />
      
      {/* Always show the Active Game tab for testing */}
      <Tab.Screen 
        name="Active Game" 
        component={GamePlayScreen}
        options={{ 
          tabBarBadge: activeGame ? '●' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.secondary,
            color: COLORS.secondary,
            fontSize: 10
          }
        }}
      />
      
      <Tab.Screen name="History" component={GameHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}