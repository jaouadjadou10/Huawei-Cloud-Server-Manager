import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './lib/supabase';
import AuthScreen from './screens/AuthScreen';
import NotesScreen from './screens/NotesScreen';
import EditorScreen from './screens/EditorScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('notes');
  const [activeNote, setActiveNote] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  function openNote(note) { setActiveNote(note); setScreen('editor'); }
  function newNote() { setActiveNote(null); setScreen('editor'); }
  function goBack() { setActiveNote(null); setScreen('notes'); }
  async function signOut() {
    await supabase.auth.signOut();
    setScreen('notes'); setActiveNote(null);
  }

  if (loading) return null;

  if (!session) return (
    <>
      <StatusBar style="light" />
      <AuthScreen />
    </>
  );

  return (
    <>
      <StatusBar style="light" />
      {screen === 'notes' && (
        <NotesScreen onOpen={openNote} onNew={newNote} onSignOut={signOut} />
      )}
      {screen === 'editor' && (
        <EditorScreen note={activeNote} onBack={goBack} />
      )}
    </>
  );
}
