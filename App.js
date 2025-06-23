import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GameProvider } from './src/context/GameContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  console.log("Rendering main App component");
  
  return (
    <AuthProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </GameProvider>
    </AuthProvider>
  );
}
