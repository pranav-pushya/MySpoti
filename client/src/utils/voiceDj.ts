/**
 * Voice DJ Speech Engine using Web Speech API (speechSynthesis)
 */

export const isVoiceDjSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

// Select best natural-sounding voice available on the device
const getBestVoice = (): SpeechSynthesisVoice | null => {
  if (!isVoiceDjSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Priority order for natural voices
  const preferred = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen'))
  );

  if (preferred) return preferred;

  // Fallback to any English voice
  const english = voices.find(v => v.lang.startsWith('en'));
  if (english) return english;

  // Fallback to default voice
  return voices[0] || null;
};

export const stopVoiceDj = (): void => {
  if (!isVoiceDjSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (err) {
    console.warn('Error stopping speech synthesis:', err);
  }
};

export const isVoiceDjSpeaking = (): boolean => {
  if (!isVoiceDjSupported()) return false;
  return window.speechSynthesis.speaking;
};

export const speakText = (text: string, onEnd?: () => void): void => {
  if (!isVoiceDjSupported() || !text.trim()) {
    onEnd?.();
    return;
  }

  try {
    stopVoiceDj();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 1.05; // Slightly upbeat radio DJ cadence
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed to execute:', err);
    onEnd?.();
  }
};

const DJ_PHRASES = [
  (title: string, artist: string, mood?: string) => 
    mood 
      ? `Here's ${title} by ${artist} to set that ${mood} mood. Enjoy!` 
      : `Alright, kicking things off with ${title} by ${artist}. Let's get into it!`,
  (title: string, artist: string) => 
    `Next up in your queue, ${title} by ${artist}. Turn it up!`,
  (title: string, artist: string) => 
    `You're listening to MySpoti DJ. Coming at you with ${title} by ${artist}.`,
  (title: string, artist: string, mood?: string) => 
    mood
      ? `Here's a special pick for your ${mood} session: ${title} by ${artist}. Enjoy the track!`
      : `Up next, here is ${title} by ${artist}.`
];

export const speakDjAnnouncement = (
  trackTitle: string,
  artist: string,
  mood?: string,
  customIntro?: string,
  onEnd?: () => void
): void => {
  let phrase = '';
  if (customIntro && customIntro.trim()) {
    phrase = customIntro.trim();
  } else {
    const generator = DJ_PHRASES[Math.floor(Math.random() * DJ_PHRASES.length)];
    phrase = generator(trackTitle, artist, mood);
  }

  speakText(phrase, onEnd);
};
