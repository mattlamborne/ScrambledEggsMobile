// src/lib/supabase.js
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Your existing Supabase project credentials
const supabaseUrl = 'https://zepeosswcflerlkrndez.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplcGVvc3N3Y2ZsZXJsa3JuZGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTQwOTgsImV4cCI6MjA1ODE5MDA5OH0.I6j0p-Ixzn56mqyV9fLqJBcza7Byv7sZNkkGrIEF7RM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // Disable realtime subscriptions to avoid WebSocket issues in React Native
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
});