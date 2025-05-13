// App.js (update your existing file)
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthStack from './src/navigation/AuthStack';
import TabNavigator from './src/navigation/TabNavigator';

function Root() {
  const { user, loading } = useAuth();
  
  console.log('ROOT RENDER - Auth state:', { 
    user: user ? 'User exists' : 'No user', 
    userDetails: user,
    loading 
  });
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading authentication...</Text>
      </View>
    );
  }
  
  if (!user) {
    console.log('SHOWING AUTH STACK - No user found');
    return <AuthStack />;
  } else {
    console.log('SHOWING TAB NAVIGATOR - User found:', user.email);
    return <TabNavigator />;
  }
}

export default function App() {
  console.log('APP COMPONENT RENDER');
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Root />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});