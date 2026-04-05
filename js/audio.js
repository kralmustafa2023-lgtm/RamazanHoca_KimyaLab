// ============================================
// AUDIO.JS — Synthesized Sound Effects
// Ramazan Hoca'nın KimyaLab
// ============================================

const AUDIO = (() => {
    let ctx = null;
    let enabled = true;
    let isUnlocked = false;

    // Aggressive Init: Can be called safely multiple times
    function init() {
        if (!enabled) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!ctx && AudioContext) {
                ctx = new AudioContext();
            }

            if (ctx) {
                if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
                    ctx.resume().then(() => {
                        if (ctx.state === 'running') isUnlocked = true;
                    });
                } else if (ctx.state === 'running') {
                    isUnlocked = true;
                }
            }
        } catch (e) {
            console.warn("Audio Context init failed:", e);
        }
    }

    // Warm-up function to "pre-load" the engine
    function warmUp() {
        if (!enabled || !ctx || ctx.state !== 'running') return;
        // Play a zero-volume buffer to keep the hardware awake
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
    }

    // Universal Global Interaction Listener (Persistent)
    const unlockEvents = ['click', 'touchstart', 'mousedown', 'keydown', 'touchend'];
    unlockEvents.forEach(evt => {
        window.addEventListener(evt, () => {
            init();
            if (isUnlocked) warmUp();
        }, { passive: true });
    });

    function playTone(freq, type, duration, vol) {
        if (!enabled) return;
        if (!isUnlocked) init();
        if (!ctx || ctx.state !== 'running') return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(vol * 1.8, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            isUnlocked = false; // Reset flag to re-trigger init
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

    function playNotification() {
        playTone(523.25, 'sine', 0.1, 0.2); // C5
        setTimeout(() => playTone(880.00, 'sine', 0.25, 0.25), 100); // A5
        if (enabled && navigator.vibrate) navigator.vibrate([30, 50, 30]);
    }

    function toggleSound() {
        enabled = !enabled;
        if (enabled) playClick();
        return enabled;
    }

    function isEnabled() {
        return enabled;
    }

    return { init, playClick, playCorrect, playWrong, playSuccess, playNotification, toggleSound, isEnabled };
})();
