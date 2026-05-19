import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function NotesScreen({ onOpen, onNew, onSignOut }) {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, updated_at')
      .order('updated_at', { ascending: false });
    if (!error) setNotes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();

    // Real-time subscription — updates list when note changes on any device
    const channel = supabase
      .channel('notes-list')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        () => fetchNotes()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchNotes]);

  async function deleteNote(id) {
    Alert.alert('Delete note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('notes').delete().eq('id', id);
          setNotes(prev => prev.filter(n => n.id !== id));
        },
      },
    ]);
  }

  function stripHtml(html = '') {
    return html.replace(/<[^>]+>/g, '').slice(0, 60) || '—';
  }

  function relativeDate(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  const filtered = notes.filter(n =>
    (n.title || '').toLowerCase().includes(search.toLowerCase()) ||
    stripHtml(n.content).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.brand}>
          <View style={s.brandIcon}><Text style={s.brandStar}>✦</Text></View>
          <Text style={s.brandName}>Bloc Note</Text>
        </View>
        <TouchableOpacity onPress={onSignOut} style={s.signOutBtn}>
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>⌕</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search notes…"
          placeholderTextColor="#4a4a52"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color="#c8a96e" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={filtered.length === 0 && s.emptyWrap}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyStar}>✦</Text>
              <Text style={s.emptyText}>No notes yet</Text>
              <Text style={s.emptyHint}>Tap + to create your first note</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.noteItem}
              onPress={() => onOpen(item)}
              onLongPress={() => deleteNote(item.id)}
              activeOpacity={0.75}
            >
              <View style={s.noteBody}>
                <Text style={s.noteTitle} numberOfLines={1}>
                  {item.title || 'Untitled'}
                </Text>
                <Text style={s.notePreview} numberOfLines={1}>
                  {stripHtml(item.content)}
                </Text>
              </View>
              <Text style={s.noteMeta}>{relativeDate(item.updated_at)}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={onNew} activeOpacity={0.85}>
        <Text style={s.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>{notes.length} note{notes.length !== 1 ? 's' : ''}</Text>
        <Text style={s.footerSync}>● Synced</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0f' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2e',
    backgroundColor: '#161618',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: {
    width: 32, height: 32, backgroundColor: '#c8a96e',
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  brandStar: { fontSize: 14, color: '#0e0e0f' },
  brandName: { fontSize: 18, fontWeight: '700', color: '#e8e4dc' },
  signOutBtn: { padding: 6 },
  signOutText: { color: '#6b6868', fontSize: 13 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, backgroundColor: '#1e1e21',
    borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2e',
    paddingHorizontal: 12,
  },
  searchIcon: { color: '#4a4a52', fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#e8e4dc', fontSize: 14, paddingVertical: 11 },

  noteItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  noteBody: { flex: 1 },
  noteTitle: { color: '#e8e4dc', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  notePreview: { color: '#6b6868', fontSize: 13 },
  noteMeta: { color: '#4a4a52', fontSize: 11, marginLeft: 12 },
  sep: { height: 1, backgroundColor: '#1e1e21', marginHorizontal: 20 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', gap: 8 },
  emptyStar: { fontSize: 36, color: '#2a2a2e' },
  emptyText: { color: '#6b6868', fontSize: 17, fontWeight: '500' },
  emptyHint: { color: '#4a4a52', fontSize: 13 },

  fab: {
    position: 'absolute', right: 24, bottom: 56,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#c8a96e',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#c8a96e', shadowOpacity: 0.4,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: { color: '#0e0e0f', fontSize: 28, lineHeight: 32, fontWeight: '300' },

  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#1e1e21',
    backgroundColor: '#161618',
  },
  footerText: { color: '#4a4a52', fontSize: 11 },
  footerSync: { color: '#6eb88a', fontSize: 11 },
});
