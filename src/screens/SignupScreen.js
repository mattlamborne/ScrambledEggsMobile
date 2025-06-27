// src/screens/SignupScreen.js
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.replace('Onboarding');
  }, [navigation]);
  return null;
}