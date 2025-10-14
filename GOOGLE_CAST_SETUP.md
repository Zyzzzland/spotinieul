# Google Cast Audio Setup Guide

This guide explains how to cast audio from your React Native Expo app to Google Home or Chromecast Audio devices.

## 📦 What's Been Added

### 1. **Package & Configuration**
- Added `react-native-google-cast` to `package.json`
- Configured the Google Cast plugin in `app.json`
- Uses default receiver app ID (CC1AD845) - you can customize this if you have your own receiver app

### 2. **Custom Hook: `useGoogleCast`**
**Location:** `hooks/use-google-cast.ts`

A convenient hook that provides:
- Connection state management
- Audio casting functionality
- Playback controls (play, pause, stop, seek)
- Progress tracking
- Device name detection

### 3. **Audio Player Component**
**Location:** `components/audio-cast-player.tsx`

A ready-to-use component with:
- Cast button integration
- Album art display
- Playback controls
- Progress bar
- Connection status

### 4. **Example Screen**
**Location:** `app/(tabs)/cast.tsx`

A complete example showing how to use the audio casting functionality.

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Prebuild Native Code

Since Google Cast requires custom native code, you need to prebuild your app:

```bash
npx expo prebuild
```

This will generate the native iOS and Android projects with the Google Cast SDK integrated.

### Step 3: Build and Run

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

**Important:** This will NOT work with Expo Go. You need a custom development build.

---

## 📱 How to Use

### Basic Usage with the Hook

```typescript
import { useGoogleCast } from '@/hooks/use-google-cast';

function MyMusicPlayer() {
  const { isConnected, isPlaying, castAudio, play, pause } = useGoogleCast();

  const handleCastSong = async () => {
    await castAudio({
      contentUrl: 'https://example.com/song.mp3',
      title: 'My Song',
      artist: 'Artist Name',
      albumArt: 'https://example.com/cover.jpg',
      contentType: 'audio/mp3',
    });
  };

  return (
    <View>
      <CastButton style={{ width: 24, height: 24 }} />
      {isConnected && (
        <>
          <Button title="Cast Song" onPress={handleCastSong} />
          <Button title={isPlaying ? "Pause" : "Play"} 
                  onPress={isPlaying ? pause : play} />
        </>
      )}
    </View>
  );
}
```

### Using the AudioCastPlayer Component

```typescript
import { AudioCastPlayer } from '@/components/audio-cast-player';

function MyScreen() {
  return (
    <AudioCastPlayer
      audioUrl="https://example.com/song.mp3"
      title="My Favorite Song"
      artist="Artist Name"
      albumArt="https://example.com/cover.jpg"
      contentType="audio/mp3"
    />
  );
}
```

---

## 🔧 Advanced Configuration

### Custom Receiver App ID

If you have your own Google Cast receiver app, update `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-cast",
        {
          "receiverAppId": "YOUR_CUSTOM_APP_ID",
          "iosStartDiscoveryAfterFirstTapOnCastButton": true
        }
      ]
    ]
  }
}
```

### Supported Audio Formats

The Google Cast SDK supports various audio formats:
- MP3 (`audio/mp3`)
- AAC (`audio/aac`)
- WAV (`audio/wav`)
- OGG Vorbis (`audio/ogg`)
- FLAC (`audio/flac`)
- WebM (`audio/webm`)

### Background Audio

To keep casting in the background, the configuration already includes:
```json
"iosSuspendSessionsWhenBackgrounded": true
```

For Android, the Cast SDK handles background sessions automatically.

---

## 🎯 Hook API Reference

### `useGoogleCast()`

**Returns:**

```typescript
{
  // State
  isConnected: boolean;        // Is connected to a Cast device
  isPlaying: boolean;          // Is currently playing
  currentPosition: number;     // Current playback position (seconds)
  duration: number;            // Total duration (seconds)
  deviceName: string | null;   // Connected device name

  // Methods
  castAudio: (options: AudioCastOptions) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (position: number) => Promise<void>;
}
```

**AudioCastOptions:**

```typescript
interface AudioCastOptions {
  contentUrl: string;          // Required: URL to audio file
  contentType?: string;        // Default: 'audio/mp3'
  title?: string;              // Track title
  subtitle?: string;           // Track subtitle
  artist?: string;             // Artist name
  albumArt?: string;           // Album art URL
  streamDuration?: number;     // Duration in seconds
  startTime?: number;          // Start position in seconds
}
```

---

## 🐛 Troubleshooting

### Issue: "No cast client available"
**Solution:** Make sure you're connected to a Cast device. Tap the Cast button and select a device first.

### Issue: "Cast button not showing devices"
**Solution:** 
- Ensure your phone and Google Home are on the same Wi-Fi network
- Check that your Google Home is set up and powered on
- Try restarting your app

### Issue: "Module not found: react-native-google-cast"
**Solution:** 
1. Run `npm install`
2. Run `npx expo prebuild --clean`
3. Rebuild your app

### Issue: "Audio not playing on Google Home"
**Solution:**
- Verify the audio URL is publicly accessible
- Check that the contentType matches the actual file format
- Ensure the audio file is not DRM-protected

### Issue: "Works on Android but not iOS"
**Solution:**
- Make sure you've run `pod install` in the iOS directory
- iOS requires iOS 14 or newer
- Check that your Info.plist has the necessary permissions

---

## 📚 Additional Resources

- [react-native-google-cast Documentation](https://react-native-google-cast.github.io/)
- [Google Cast SDK Documentation](https://developers.google.com/cast)
- [Expo Custom Native Code Guide](https://docs.expo.dev/workflow/continuous-native-generation/)

---

## 🔒 Network Requirements

- Your mobile device and Cast device must be on the same local network
- The audio files must be accessible via HTTP/HTTPS
- Audio URLs must be publicly accessible (Cast devices fetch the content directly)
- For local files, you'll need to host them on a local server

---

## 🎵 Example Audio Sources (for testing)

Free audio files you can use for testing:
- `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`
- `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3`

**Note:** Replace these with your actual audio content URLs in production.
