// App.js
import { Buffer } from '@craftzdog/react-native-buffer';
import 'react-native-url-polyfill/auto';

// Set global objects
global.Buffer = Buffer;
global.process = require('process/browser');

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { GameProvider } from './src/context/GameContext';
import AuthStack from './src/navigation/AuthStack';

export default function App() {
  console.log("Rendering main App component");
  
  return (
    <AuthProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AuthStack />
        </NavigationContainer>
      </GameProvider>
    </AuthProvider>
  );
}