// src/navigation/AuthStack.js - Completely revised version
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import PasswordResetScreen from '../screens/PasswordResetScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  console.log("Rendering AuthStack");
  
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen} 
      />
      <Stack.Screen 
        name="PasswordReset" 
        component={PasswordResetScreen} 
      />
    </Stack.Navigator>
  );
}