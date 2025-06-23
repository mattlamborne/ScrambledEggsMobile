import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainNavigation from './MainNavigation';
import { View, ActivityIndicator } from 'react-native';

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return session && session.user ? <MainNavigation /> : <AuthStack />;
} 