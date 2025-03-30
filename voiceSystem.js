class VoiceSystem {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.isReady = false;

        // Initialize voices
        this.initVoices();

        // Retry initialization if voices aren't immediately available
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.initVoices();
            };
        }
    }

    initVoices() {
        try {
            this.voices = this.synth.getVoices();
            if (this.voices.length > 0) {
                // Try to find a suitable voice
                this.currentVoice = this.voices.find(voice => 
                    voice.lang.includes('en') && (
                        voice.name.toLowerCase().includes('male') ||
                        voice.name.toLowerCase().includes('deep')
                    )
                ) || this.voices[0];
                
                this.isReady = true;
                console.log('Voice system ready:', this.currentVoice.name);
                
                // Initial test
                this.speak("System online", true);
            }
        } catch (error) {
            console.warn('Voice initialization error:', error);
        }
    }

    speak(text, priority = false) {
        if (!this.isReady || !this.synth) {
            console.warn('Voice system not ready');
            return;
        }

        try {
            // Cancel any ongoing speech for priority messages
            if (priority && this.synth.speaking) {
                this.synth.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.currentVoice;
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            this.synth.speak(utterance);
            this.showFeedback(text);
        } catch (error) {
            console.warn('Speech error:', error);
        }
    }

    showFeedback(text) {
        const feedback = document.getElementById('voiceFeedback');
        if (feedback) {
            feedback.textContent = text;
            feedback.classList.add('active');
            setTimeout(() => feedback.classList.remove('active'), 2000);
        }
    }

    // Game-specific voice commands
    announceStart() {
        this.speak("Welcome warrior. Enter the arena.", true);
    }

    announceAction(action) {
        const messages = {
            block: "Perfect block!",
            combo: "Excellent combo!",
            special: "Special move activated!"
        };
        this.speak(messages[action] || "Good move!", false);
    }

    announceVictory() {
        this.speak("Victory is yours!", true);
    }

    announceDefeat() {
        this.speak("Battle concluded.", true);
    }
}

// Initialize voice system
document.addEventListener('DOMContentLoaded', () => {
    window.voiceSystem = new VoiceSystem();
});