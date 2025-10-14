# Spotinieul - Spotify-like Music Player 🎵

A modern, full-featured music player app built with React Native and Expo. Upload songs, create playlists, and enjoy a rich music playback experience with a beautiful UI inspired by Spotify.

## Features ✨

### 🎵 Music Management
- **Upload Songs**: Import audio files from your device with metadata (title, artist, album)
- **Delete Songs**: Remove songs from your library with confirmation
- **Song Library**: Browse all your uploaded songs in a beautiful grid layout

### 📝 Playlist Management
- **Create Playlists**: Build custom playlists with names and descriptions
- **Delete Playlists**: Remove playlists you no longer need
- **Add/Remove Songs**: Easily manage songs within playlists
- **Play Playlists**: Start playback of entire playlists

### 🎼 Music Player
- **Play/Pause**: Control playback with intuitive buttons
- **Next/Previous**: Navigate through your queue
- **Seek Timeline**: Jump to any position in the current track
- **Repeat Modes**: Off, repeat one, or repeat all
- **Shuffle Mode**: Randomize playback order
- **Mini Player**: Always-visible player bar at the bottom
- **Full Player**: Dedicated full-screen player with album art

### 🎨 Modern UI
- **Spotify-inspired Design**: Clean, modern interface with green accent color (#1DB954)
- **Dark/Light Mode**: Automatic theme switching
- **Album Art Display**: Show album artwork when available
- **Smooth Animations**: Polished user experience
- **Responsive Layout**: Works great on all screen sizes

## Setup & Installation 🚀

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

3. **Run on your device**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app for physical device

## Project Structure 📁

```
spotinieul/
├── app/
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── index.tsx    # Home screen
│   │   ├── library.tsx  # Song library & upload
│   │   ├── playlists.tsx # Playlist management
│   │   ├── explore.tsx  # Explore/search
│   │   └── cast.tsx     # Google Cast integration
│   ├── playlist/
│   │   └── [id].tsx     # Playlist detail screen
│   ├── player.tsx       # Full-screen music player
│   └── _layout.tsx      # Root layout with providers
├── components/
│   ├── music-player.tsx # Main player component
│   ├── mini-player.tsx  # Bottom mini player
│   └── ui/              # Reusable UI components
├── contexts/
│   └── music-context.tsx # Global music state management
├── types/
│   └── music.ts         # TypeScript type definitions
└── hooks/               # Custom React hooks
```

## Key Technologies 🛠️

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **Expo Router** - File-based navigation
- **Expo AV** - Audio playback
- **AsyncStorage** - Persistent data storage
- **Expo Document Picker** - File selection
- **TypeScript** - Type safety

## Usage Guide 📱

### Adding Your First Song

1. Navigate to the **Library** tab
2. Tap the **+** button in the top right
3. Select an audio file from your device
4. Enter song details (title, artist, album)
5. Tap **Save**

### Creating a Playlist

1. Navigate to the **Playlists** tab
2. Tap the **+** button
3. Enter playlist name and description
4. Tap **Create**
5. Open the playlist and tap **Add Songs** to add tracks

### Playing Music

- **Single Song**: Tap any song in your library or playlist
- **Playlist**: Tap the play button on a playlist
- **Mini Player**: Control playback from any screen
- **Full Player**: Tap the mini player to expand to full screen

### Music Controls

- **Play/Pause**: Toggle playback
- **Next/Previous**: Skip tracks
- **Seek Bar**: Drag to jump to any position
- **Repeat**: Cycle through off → repeat all → repeat one
- **Shuffle**: Randomize playback order

## Data Persistence 💾

All songs and playlists are stored locally using AsyncStorage:
- Song metadata and file paths
- Playlist configurations
- Playback preferences

## Future Enhancements 🔮

- Search and filter functionality
- Sort options (name, date, artist)
- Playlist editing (rename, reorder songs)
- Audio metadata extraction from files
- Equalizer and audio effects
- Background playback
- Lyrics display
- Share playlists

## Development Notes 📝

### TypeScript Errors

Some TypeScript router type errors are handled with `as any` casts. These are related to Expo Router's strict typing and don't affect functionality. They'll be resolved when running the app.

### Audio Permissions

The app requires storage/media permissions to:
- Read audio files
- Store songs locally
- Access audio playback features

### Testing

Test the app on physical devices for best audio playback experience. Expo Go may have limitations with certain audio codecs.

## Learn More 📚

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)

## License

MIT
