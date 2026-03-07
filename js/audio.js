// ============================================
// AUDIO.JS — Synthesized Sound Effects
// Ramazan Hoca'nın KimyaLab
// ============================================

const AUDIO = (() => {
    let ctx = null;
    let enabled = true;

    function init() {
        if (!ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                ctx = new AudioContext();
            }
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    function playTone(freq, type, duration, vol) {
        if (!enabled || !ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    function playClick() {
        init();
        playTone(600, 'sine', 0.1, 0.1);
    }

    function playCorrect() {
        init();
        playTone(440, 'sine', 0.1, 0.2);
        setTimeout(() => playTone(554, 'sine', 0.1, 0.2), 100);
        setTimeout(() => playTone(659, 'sine', 0.2, 0.2), 200);
    }

    function playWrong() {
        init();
        playTone(300, 'sawtooth', 0.1, 0.15);
        setTimeout(() => playTone(250, 'sawtooth', 0.2, 0.15), 100);
    }

    function playSuccess() {
        init();
        playTone(261.63, 'square', 0.15, 0.1);
        setTimeout(() => playTone(329.63, 'square', 0.15, 0.1), 150);
        setTimeout(() => playTone(392.00, 'square', 0.15, 0.1), 300);
        setTimeout(() => playTone(523.25, 'square', 0.3, 0.15), 450);
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
