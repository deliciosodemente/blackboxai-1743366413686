class VoiceSystem {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.motivationalPhrases = [
            "Your power is rising!",
            "Incredible technique!",
            "You're dominating the arena!",
            "Unstoppable force!",
            "Epic move!",
            "Your legend grows!",
            "The crowd is amazed!",
            "Pure skill!",
            "Unleash your power!",
            "Victory awaits!"
        ];
        
        // Combat-specific phrases
        this.combatPhrases = {
            combo: [
                "Perfect combo!",
                "Devastating chain!",
                "Unbreakable sequence!"
            ],
            defense: [
                "Impenetrable defense!",
                "Like a fortress!",
                "They can't touch you!"
            ],
            special: [
                "Ultimate power unleashed!",
                "Legendary move!",
                "The arena trembles!"
            ]
        };
        
        // Initialize voices when they're available
        speechSynthesis.addEventListener('voiceschanged', () => {
            this.voices = this.synth.getVoices();
            // Select a deep, commanding voice if available
            this.currentVoice = this.voices.find(voice => 
                voice.name.toLowerCase().includes('male') || 
                voice.name.toLowerCase().includes('deep')
            ) || this.voices[0];
        });
    }

    speak(text, priority = false) {
        // Cancel previous non-priority speech if this is a priority message
        if (priority && this.synth.speaking) {
            this.synth.cancel();
        }
        // Don't interrupt priority messages with non-priority ones
        else if (!priority && this.synth.speaking) {
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.currentVoice;
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;
        
        this.synth.speak(utterance);
    }

    // Motivational feedback based on player performance
    provideCombatFeedback(action, intensity = 1) {
        let phrases;
        switch(action) {
            case 'combo':
                phrases = this.combatPhrases.combo;
                break;
            case 'defense':
                phrases = this.combatPhrases.defense;
                break;
            case 'special':
                phrases = this.combatPhrases.special;
                break;
            default:
                phrases = this.motivationalPhrases;
        }
        
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.speak(phrase, intensity > 0.8); // Priority for high-intensity moments
    }

    // Announce major events
    announceEvent(event) {
        const eventMessages = {
            matchStart: "The battle begins! Show them your power!",
            victory: "Glorious victory! Your legend grows stronger!",
            defeat: "A warrior learns from every battle. Rise again!",
            specialUnlocked: "New power unlocked! The arena awaits your might!",
            achievement: "Achievement unlocked! Your name echoes through the arena!",
            levelUp: "Your power grows! A new level of might achieved!"
        };

        const message = eventMessages[event] || "The battle continues!";
        this.speak(message, true); // Events are always priority
    }

    // Contextual combat commentary
    provideCombatCommentary(playerStats) {
        if (playerStats.health < 30) {
            this.speak("Your warrior spirit burns bright! Fight on!", true);
        }
        if (playerStats.combo > 5) {
            this.speak("Unstoppable combination!", true);
        }
        if (playerStats.perfectBlock) {
            this.speak("Perfect defense!", false);
        }
    }

    // Region-wide event announcements
    announceRegionalEvent(eventType) {
        const regionalMessages = {
            battleRoyaleStart: "Warriors of the region! The grand battle begins!",
            lastSurvivors: "Only the mightiest remain! Glory awaits!",
            champion: "A new champion rises! The region bears witness to greatness!",
            specialEvent: "A legendary event begins! Show your might!"
        };

        const message = regionalMessages[eventType] || "The region watches!";
        this.speak(message, true);
    }
}

// Export the voice system
window.VoiceSystem = VoiceSystem;