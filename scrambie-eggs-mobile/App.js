import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthStack from './src/navigation/AuthStack';
import TabNavigator from './src/navigation/TabNavigator';

function Root() {
  const { user, loading } = useAuth();
  
  console.log('Auth state:', { 
    user: user, 
    userExists: !!user,
    loading: loading 
  });
  
  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  console.log('Showing screen:', user ? 'TabNavigator' : 'AuthStack');
  return user ? <TabNavigator /> : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
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

