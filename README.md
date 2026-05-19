Bloc Note — Mobile & Desktop App
A beautiful notepad app built with Expo (React Native) + Supabase.
Runs on iOS, Android, Windows, Mac, and Linux from a single codebase.
Features
Email/password authentication
Notes synced in real-time across all your devices
Auto-save (1.5s after last keystroke)
Works offline — saves locally, syncs when back online
Long-press a note to delete it
---
1. Supabase Setup (5 min)
Create a free account at https://supabase.com
Create a new project
Go to SQL Editor and run the contents of `supabase-schema.sql`
Go to Database → Replication and enable real-time for the `notes` table
Go to Settings → API and copy:
`Project URL`
`anon / public` key
---
2. Configure the app
Open `lib/supabase.js` and replace:
```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```
---
3. Run locally
```bash
npm install
npx expo start
```
Then:
Press `i` for iOS simulator
Press `a` for Android emulator
Press `w` for web browser
To run on your physical phone, install the Expo Go app and scan the QR code.
---
4. Build for production
Mobile (iOS & Android)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # APK / AAB
eas build --platform ios       # IPA (requires Apple Developer account)
```
Desktop (Windows / Mac / Linux)
```bash
npx expo run:macos     # Mac
npx expo run:windows   # Windows (requires Expo for desktop setup)
```
Or export as a web app and wrap with Electron:
```bash
npx expo export -p web
```
---
Project structure
```
blocnote/
├── App.js                  # Root — auth state + navigation
├── lib/
│   └── supabase.js         # Supabase client
├── screens/
│   ├── AuthScreen.js       # Login / signup
│   ├── NotesScreen.js      # Notes list with real-time sync
│   └── EditorScreen.js     # Note editor with auto-save
└── supabase-schema.sql     # Run once in Supabase SQL editor
```
