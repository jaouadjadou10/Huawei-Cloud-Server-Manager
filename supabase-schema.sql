import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your Supabase project values
// Found at: https://supabase.com/dashboard → your project → Settings → API
const SUPABASE_URL = 'https://jchhwqjlyadsvxdxdync.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaGh3cWpseWFkc3Z4ZHhkeW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDE2MDksImV4cCI6MjA5NDcxNzYwOX0.WnwxYbuljq4JjAyf1ZNCBwRxNN91RZsMikAJV7pk9-c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
