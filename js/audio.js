// ============================================
// AUDIO.JS — Synthesized Sound Effects
// Ramazan Hoca'nın KimyaLab
// ============================================

const AUDIO = (() => {
    let ctx = null;
    let enabled = true;

    function init() {
        try {
            if (!ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    ctx = new AudioContext();
                    console.log("AudioContext Created:", ctx.state);
                }
            }
            if (ctx && ctx.state === 'suspended') {
                ctx.resume().then(() => {
                    console.log("AudioContext Resumed:", ctx.state);
                });
            }
        } catch (e) {
            console.error("Audio Init Error:", e);
        }
    }

    // ULTRA ROBUST UNLOCK: Prime the pump with a silent sound on FIRST interaction
    function unlockAudio() {
        init();
        if (!ctx || !enabled) return;

        // Play a silent note to satisfy browser requirements for "user-initiated play"
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001; // Effectively silent
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(0.1);
        
        console.log("Audio Primed & Unlocked ✅");

        // Remove listeners
        ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
            window.removeEventListener(evt, unlockAudio);
        });
    }

    ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { once: false }); // keep trying until success
    });

    function playTone(freq, type, duration, vol) {
        if (!enabled) return;
        init(); // Ensure ctx is created/resumed
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            gain.gain.setValueAtTime(vol * 1.5, ctx.currentTime); // Slight boost
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio play failed:", e);
        }
    }

    function playClick() {
        playTone(600, 'sine', 0.1, 0.15);
        if (enabled && navigator.vibrate) navigator.vibrate(10);
    }

    function playCorrect() {
        playTone(440, 'sine', 0.1, 0.25);
        setTimeout(() => playTone(554, 'sine', 0.1, 0.25), 100);
        setTimeout(() => playTone(659, 'sine', 0.2, 0.25), 200);
        if (enabled && navigator.vibrate) navigator.vibrate([20, 50, 20]);
    }

    function playWrong() {
        playTone(300, 'sawtooth', 0.1, 0.2);
        setTimeout(() => playTone(250, 'sawtooth', 0.2, 0.2), 100);
        if (enabled && navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }

    function playSuccess() {
        playTone(261.63, 'square', 0.15, 0.15);
        setTimeout(() => playTone(329.63, 'square', 0.15, 0.15), 150);
        setTimeout(() => playTone(392.00, 'square', 0.15, 0.15), 300);
        setTimeout(() => playTone(523.25, 'square', 0.3, 0.2), 450);
        if (enabled && navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 100]);
    }

    function toggleSound() {
        enabled = !enabled;
        if (enabled) playClick();
        return enabled;
    }

    function isEnabled() {
        return enabled;
    }

    return { init, playClick, playCorrect, playWrong, playSuccess, toggleSound, isEnabled };
})();
