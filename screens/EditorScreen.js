import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

const SAVE_DELAY = 1500; // ms after last keystroke

export default function EditorScreen({ note, onBack }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(
    note?.content ? note.content.replace(/<[^>]+>/g, '') : ''
  );
  const [saveStatus, setSaveStatus] = useState('saved'); // saved | saving | offline
  const [wordCount, setWordCount] = useState(0);
  const saveTimer = useRef(null);
  const noteId = useRef(note?.id || null);
  const userId = useRef(null);

  // Get user id once
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      userId.current = data?.user?.id;
    });
    countWords(content);
  }, []);

  function countWords(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }

  const save = useCallback(async (t, c) => {
    setSaveStatus('saving');
    try {
      if (noteId.current) {
        // Update existing
        await supabase.from('notes').update({
          title: t || 'Untitled',
          content: c,
          updated_at: new Date().toISOString(),
        }).eq('id', noteId.current);
      } else {
        // Create new
        const { data, error } = await supabase.from('notes').insert({
          title: t || 'Untitled',
          content: c,
          user_id: userId.current,
        }).select().single();
        if (!error && data) noteId.current = data.id;
      }
      setSaveStatus('saved');
    } catch {
      setSaveStatus('offline');
    }
  }, []);

  function onTitleChange(val) {
    setTitle(val);
    scheduleAutoSave(val, content);
  }

  function onContentChange(val) {
    setContent(val);
    countWords(val);
    scheduleAutoSave(title, val);
  }

  function scheduleAutoSave(t, c) {
    setSaveStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(t, c), SAVE_DELAY);
  }

  // Save on unmount (back press)
  useEffect(() => {
    return () => {
      clearTimeout(saveTimer.current);
      save(title, content);
    };
  }, [title, content]);

  // ── Formatting helpers (wraps selection with markdown-style markers) ──
  // Since React Native TextInput doesn't support rich HTML editing,
  // we use plain text with lightweight markers that render as plain text.
  // For full rich text, this is the recommended foundation to swap in
  // a WebView-based editor later.

  function statusColor() {
    if (saveStatus === 'saved') return '#6eb88a';
    if (saveStatus === 'saving') return '#c8a96e';
    return '#c06060';
  }

  function statusLabel() {
    if (saveStatus === 'saved') return '✦ Saved';
    if (saveStatus === 'saving') return '… Saving';
    return '⚠ Offline';
  }

  return (
    <View style={s.container}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backText}>Notes</Text>
        </TouchableOpacity>
        <Text style={[s.saveStatus, { color: statusColor() }]}>{statusLabel()}</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardDismissMode="interactive"
      >
        {/* Title */}
        <TextInput
          style={s.title}
          placeholder="Untitled note…"
          placeholderTextColor="#3a3a42"
          value={title}
          onChangeText={onTitleChange}
          multiline
          returnKeyType="next"
          blurOnSubmit
        />
        <View style={s.titleUnderline} />

        {/* Body */}
        <TextInput
          style={s.body}
          placeholder="Start writing…"
          placeholderTextColor="#3a3a42"
          value={content}
          onChangeText={onContentChange}
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
          autoCorrect
          autoCapitalize="sentences"
        />
      </ScrollView>

      {/* Bottom bar */}
      <View style={s.bottomBar}>
        <Text style={s.metaText}>{wordCount} words · {content.length} chars</Text>
        <Text style={s.metaText}>
          {note?.updated_at
            ? 'Edited ' + new Date(note.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
            : 'New note'}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0f' },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 14,
    backgroundColor: '#161618',
    borderBottomWidth: 1, borderBottomColor: '#2a2a2e',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow: { color: '#c8a96e', fontSize: 20 },
  backText: { color: '#c8a96e', fontSize: 15, fontWeight: '500' },
  saveStatus: { fontSize: 12 },

  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 32, paddingBottom: 60 },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#e8e4dc',
    marginBottom: 10,
    lineHeight: 38,
  },
  titleUnderline: {
    height: 1,
    backgroundColor: '#c8a96e',
    opacity: 0.3,
    marginBottom: 24,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: '#9b9591',
    minHeight: 300,
  },

  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#1e1e21',
    backgroundColor: '#161618',
  },
  metaText: { color: '#4a4a52', fontSize: 11 },
});
