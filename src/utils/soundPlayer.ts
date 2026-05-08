import Sound from 'react-native-sound';
import { Platform } from 'react-native';

// Enable playback in silence mode - try 'true' for mixWithOthers and add safety check
if (Platform.OS === 'ios') {
  try {
    Sound.setCategory('Playback', true);
  } catch (e) {
    console.log('[SoundPlayer] setCategory error:', e);
  }
}

let notificationSound: Sound | null = null;

/**
 * Plays the notification sound.
 * On Android, it looks for 'ringtone_notification' in res/raw.
 * On iOS, it looks for 'ringtone_notification.mp3' in the app bundle.
 */
export const playNotificationSound = () => {
  // If already playing, stop it first to restart
  if (notificationSound) {
    notificationSound.stop();
    notificationSound.release();
    notificationSound = null;
  }

  const soundFile = Platform.OS === 'android' ? 'ringtone_notification' : 'ringtone_notification.mp3';

  console.log('[SoundPlayer] Attempting to play:', soundFile);

  notificationSound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('[SoundPlayer] ❌ Failed to load sound:', error);
      // Try loading without Sound.MAIN_BUNDLE
      notificationSound = new Sound(soundFile, '', (err) => {
        if (err) {
          console.log('[SoundPlayer] ❌ Fallback load failed:', err);
          return;
        }
        notificationSound?.setVolume(1.0);
        notificationSound?.setNumberOfLoops(-1);
        notificationSound?.play();
      });
      return;
    }

    if (!notificationSound) return;

    console.log('[SoundPlayer] ✅ Sound loaded, starting playback');

    notificationSound.setVolume(1.0);
    notificationSound.setNumberOfLoops(-1); // Loop indefinitely until stopNotificationSound is called

    notificationSound.play((success) => {
      if (success) {
        console.log('[SoundPlayer] Finished playing successfully');
      } else {
        console.log('[SoundPlayer] ❌ Playback failed');
        notificationSound?.release();
        notificationSound = null;
      }
    });
  });
};

export const stopNotificationSound = () => {
  if (notificationSound) {
    console.log('[SoundPlayer] Stopping sound');
    notificationSound.stop(() => {
      notificationSound?.release();
      notificationSound = null;
    });
  }
};
