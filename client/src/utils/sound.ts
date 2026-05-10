/**
 * Sound Service
 * Handles playing app audio cues with volume and mute support.
 */


// Publicly available sound assets
const SOUND_URLS = {
  success: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Pop/Success
  notification: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', // Subtle ping
  complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Achievement chime
};

export const playSound = (type: keyof typeof SOUND_URLS) => {
  // We need to access the store outside of React for global utility
  // This is a simplified approach; in a real app we might use a context or direct store access
  const settingsStr = localStorage.getItem('clamber-settings');
  if (!settingsStr) return;

  try {
    const settings = JSON.parse(settingsStr);
    const { soundEnabled = true, volume = 0.5 } = settings.state || {};

    if (!soundEnabled) return;

    const audio = new Audio(SOUND_URLS[type]);
    audio.volume = volume;
    audio.play().catch(err => console.warn('Audio playback failed:', err));
  } catch (e) {
    console.error('Sound playback error:', e);
  }
};
