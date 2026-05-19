import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      let error;
      if (isLogin) {
        ({ error } = await supabase.auth.signInWithPassword({ email, password }));
      } else {
        ({ error } = await supabase.auth.signUp({ email, password }));
        if (!error) Alert.alert('Check your email', 'We sent you a confirmation link.');
      }
      if (error) Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.card}>
        {/* Brand */}
        <View style={s.brand}>
          <View style={s.brandIcon}>
            <Text style={s.brandStar}>✦</Text>
          </View>
          <Text style={s.brandName}>Bloc Note</Text>
        </View>

        <Text style={s.subtitle}>
          {isLogin ? 'Welcome back' : 'Create your account'}
        </Text>

        {/* Inputs */}
        <View style={s.inputWrap}>
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="you@example.com"
            placeholderTextColor="#4a4a52"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
        </View>

        <View style={s.inputWrap}>
          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            placeholder="••••••••"
            placeholderTextColor="#4a4a52"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          onPress={handleAuth}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#0e0e0f" />
            : <Text style={s.btnText}>{isLogin ? 'Sign in' : 'Create account'}</Text>
          }
        </TouchableOpacity>

        {/* Toggle */}
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={s.toggle}>
          <Text style={s.toggleText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Text style={s.toggleAccent}>{isLogin ? 'Sign up' : 'Sign in'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#161618',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: '#2a2a2e',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  brandIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#c8a96e',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandStar: { fontSize: 18, color: '#0e0e0f' },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e8e4dc',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#9b9591',
    marginBottom: 28,
  },
  inputWrap: { marginBottom: 16 },
  label: {
    fontSize: 12,
    color: '#6b6868',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#1e1e21',
    borderWidth: 1,
    borderColor: '#2a2a2e',
    borderRadius: 10,
    padding: 14,
    color: '#e8e4dc',
    fontSize: 15,
  },
  btn: {
    backgroundColor: '#c8a96e',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#0e0e0f', fontWeight: '700', fontSize: 15 },
  toggle: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: '#6b6868', fontSize: 13 },
  toggleAccent: { color: '#c8a96e', fontWeight: '600' },
});
