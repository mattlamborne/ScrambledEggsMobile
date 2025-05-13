// App.js
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import TabNavigator from './src/navigation/TabNavigator';
import { GameProvider } from './src/context/GameContext';
// Add to your app's entry point (App.js or index.js)
import { Buffer } from '@craftzdog/react-native-buffer';
global.Buffer = Buffer;
global.process = require('process/browser');

export default function App() {
  return (
    <GameProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <TabNavigator />
      </NavigationContainer>
    </GameProvider>
  );
}