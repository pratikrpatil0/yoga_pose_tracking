// Speech synthesis with user interaction requirement
let isInitialized = false;
let voices = [];
let isActivated = false;
let isSpeechEnabled = true;

// Initialize voices
const initVoices = () => {
  voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    isInitialized = true;
    console.log(`✅ ${voices.length} voices loaded`);
  }
};

initVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = initVoices;
}
setTimeout(initVoices, 100);
setTimeout(initVoices, 500);

// CRITICAL: Activate speech with user interaction
export const activateSpeech = () => {
  if (isActivated) {
    console.log('✅ Speech already activated');
    return true;
  }

  console.log('🎯 Activating speech synthesis...');
  
  // Speak a silent utterance to "unlock" speech
  const silent = new SpeechSynthesisUtterance('');
  silent.volume = 0;
  speechSynthesis.speak(silent);
  
  isActivated = true;
  console.log('✅ Speech activated!');
  
  // Test with actual speech
  setTimeout(() => {
    const test = new SpeechSynthesisUtterance('Speech is now active');
    test.volume = 1;
    test.rate = 0.9;
    
    if (voices.length > 0) {
      const enVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      test.voice = enVoice;
    }
    
    speechSynthesis.speak(test);
  }, 100);
  
  return true;
};

// Speak function
export const speakFeedback = (text) => {
  return new Promise((resolve) => {
    // Check if speech is enabled
    if (!isSpeechEnabled) {
      console.log('🔇 Speech disabled by user');
      resolve();
      return;
    }

    // Auto-activate if not activated
    if (!isActivated) {
      console.warn('⚠️ Speech not activated yet, activating now...');
      activateSpeech();
      // Wait a bit then try again
      setTimeout(() => {
        speakFeedback(text).then(resolve);
      }, 200);
      return;
    }
    
    console.log(`🔊 Speaking: "${text}"`);
    
    const u = new SpeechSynthesisUtterance(text);
    u.volume = 1.0;
    u.rate = 0.9;
    u.pitch = 1.0;
    u.lang = 'en-US';
    
    if (voices.length > 0) {
      const enVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      u.voice = enVoice;
      console.log(`🎤 Voice: ${enVoice.name}`);
    }
    
    u.onstart = () => console.log('✅ AUDIO PLAYING NOW');
    u.onend = () => {
      console.log('✅ Audio ended');
      resolve();
    };
    u.onerror = (e) => {
      console.error(`❌ Error: ${e.error}`);
      resolve();
    };
    
    speechSynthesis.speak(u);
  });
};

export const cancelSpeech = () => {
  speechSynthesis.cancel();
  console.log('🛑 Speech canceled');
};

export const toggleSpeech = () => {
  isSpeechEnabled = !isSpeechEnabled;
  console.log(`🔄 Speech ${isSpeechEnabled ? 'ENABLED' : 'DISABLED'}`);
  
  if (!isSpeechEnabled) {
    cancelSpeech();
  } else {
    // Speak confirmation when enabling
    if (isActivated) {
      speakFeedback('Audio feedback enabled');
    }
  }
  
  return isSpeechEnabled;
};

export const getSpeechStatus = () => {
  return {
    supported: 'speechSynthesis' in window,
    initialized: isInitialized,
    activated: isActivated,
    enabled: isSpeechEnabled,
    voiceCount: voices.length,
    speaking: speechSynthesis.speaking
  };
};

export const testSpeech = () => {
  if (!isActivated) {
    console.warn('⚠️ Activating speech first...');
    activateSpeech();
    return new Promise(resolve => {
      setTimeout(() => {
        speakFeedback('Speech test successful').then(resolve);
      }, 500);
    });
  }
  return speakFeedback('Speech test successful');
};

// Export individual functions (default export not needed)
export default { 
  speakFeedback, 
  cancelSpeech, 
  toggleSpeech,
  getSpeechStatus, 
  testSpeech, 
  activateSpeech 
};
