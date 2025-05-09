import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import NewGameScreen from '../screens/NewGameScreen';
import CurrentGameScreen from '../screens/CurrentGameScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'New Game') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Current Game') {
            iconName = focused ? 'golf' : 'golf-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.disabled,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="New Game" component={NewGameScreen} />
      <Tab.Screen 
        name="Current Game" 
        component={CurrentGameScreen}
        options={{
          tabBarButton: () => null, // This disables the tab
        }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
} 