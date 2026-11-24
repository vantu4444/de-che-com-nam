// src/audio.js - Bộ tổng hợp âm thanh thủ tục ASMR Native Web Audio API
// Chuẩn Studio Master Edition: Tích hợp âm thanh bếp nóng, giòn bọc rong biển, ting nhận tiền, còi xe và Mute Toggle

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.lastWarningBeepTime = 0;
        this.lastPoliceSirenTime = 0;
        this.lastHornTime = 0;
        this.isMuted = false;

        // Khôi phục trạng thái tắt tiếng từ LocalStorage nếu có
        try {
            if (typeof localStorage !== 'undefined') {
                this.isMuted = localStorage.getItem('onigiri_audio_muted') === 'true';
            }
        } catch (e) {
            this.isMuted = false;
        }
    }

    init() {
        if (this.ctx) return;
        const AudioContext = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext));
        if (!AudioContext) return;
        try {
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.isMuted ? 0 : 0.85;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            // Safe fallback
        }
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            try {
                this.ctx.resume();
            } catch (e) {}
        }
    }

    // Bật/Tắt âm thanh toàn cục
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            const now = this.ctx.currentTime || 0;
            if (typeof this.masterGain.gain.setValueAtTime === 'function') {
                this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, now);
            } else {
                this.masterGain.gain.value = this.isMuted ? 0 : 0.85;
            }
        }
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('onigiri_audio_muted', this.isMuted ? 'true' : 'false');
            }
        } catch (e) {}
        return this.isMuted;
    }

    // Helper tạo White Noise buffer
    createNoise(duration = 0.3) {
        if (!this.ctx) return null;
        try {
            const bufferSize = Math.floor(this.ctx.sampleRate * duration);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            return buffer;
        } catch (e) {
            return null;
        }
    }

    // 0. Tiếng xào xạc múc cơm ấm nóng (ASMR Soft Scoop Rice)
    playScoopRice() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime || 0;
        try {
            const noise = this.ctx.createBufferSource ? this.ctx.createBufferSource() : null;
            if (noise && this.ctx.createBiquadFilter) {
                const noiseBuf = this.createNoise(0.2);
                if (!noiseBuf) return;
                noise.buffer = noiseBuf;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(800, now);
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.18, now);
                if (gain.gain.exponentialRampToValueAtTime) {
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                }
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);
                noise.start(now);
                noise.stop(now + 0.2);
            }
        } catch (e) {}
    }

    // 0b. Tiếng xèo xèo ấm nóng của xưởng bếp trung tâm (Sizzle Hot Kitchen)
    playSizzleHotKitchen() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime || 0;
        try {
            const noise = this.ctx.createBufferSource();
            const noiseBuf = this.createNoise(0.35);
            if (!noiseBuf) return;
            noise.buffer = noiseBuf;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2200, now);
            filter.Q.setValueAtTime(3.0, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.12, now);
            if (gain.gain.linearRampToValueAtTime) {
                gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            }
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            noise.start(now);
            noise.stop(now + 0.35);
        } catch (e) {}
    }

    // 1. Tiếng nén cơm (Thud trầm ấm + click nén)
    playRiceMolding() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime || 0;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, now);
            if (osc.frequency.exponentialRampToValueAtTime) {
                osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);
            }
            gain.gain.setValueAtTime(0.45, now);
            if (gain.gain.exponentialRampToValueAtTime) {
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            }

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.2);

            const click = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            click.type = 'triangle';
            click.frequency.setValueAtTime(800, now);
            if (click.frequency.exponentialRampToValueAtTime) {
                click.frequency.exponentialRampToValueAtTime(150, now + 0.05);
            }
            clickGain.gain.setValueAtTime(0.2, now);
            if (clickGain.gain.exponentialRampToValueAtTime) {
                clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            }

            click.connect(clickGain);
            clickGain.connect(this.masterGain);
            click.start(now);
            click.stop(now + 0.07);
        } catch (e) {}
    }

    // 2. Tiếng sột soạt giòn rụm khi bọc lá rong biển Nori (Crunch / Wrap)
    playSeaweedCrisp() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime || 0;
        try {
            const noise = this.ctx.createBufferSource();
            const noiseBuf = this.createNoise(0.28);
            if (!noiseBuf) return;
            noise.buffer = noiseBuf;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2400, now);
            if (filter.frequency.linearRampToValueAtTime) {
                filter.frequency.linearRampToValueAtTime(3200, now + 0.15);
            }

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            if (gain.gain.linearRampToValueAtTime) {
                gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
            }
            if (gain.gain.exponentialRampToValueAtTime) {
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            }

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            noise.start(now);
            noise.stop(now + 0.28);
        } catch (e) {}
    }

    // 3. Tiếng "Ting!" leng keng trong trẻo khi hoàn thành 1 nắm cơm
    playTingComplete() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime || 0;
        try {
            const notes = [1046.5, 1318.5]; // C6 & E6
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                gain.gain.setValueAtTime(0.3, now + idx * 0.08);
                if (gain.gain.exponentialRampToValueAtTime) {
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.55);
                }

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.6);
            });
        } catch (e) {}
    }

    // 4. Tiếng "Keng!" vui tai khi bán được hàng (Cash register / Đồng xu leng keng)
    playCoinKeng() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime || 0;
        try {
            const freqs = [1318.5, 1975.5, 2637];
            freqs.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.04);

                gain.gain.setValueAtTime(0.28, now + i * 0.04);
                if (gain.gain.exponentialRampToValueAtTime) {
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.45);
                }

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now + i * 0.04);
                osc.stop(now + i * 0.04 + 0.5);
            });
        } catch (e) {}
    }

    playMoneyChime() {
        return this.playCoinKeng();
    }

    playCoinClink() {
        return this.playCoinKeng();
    }

    playCoin() {
        return this.playCoinKeng();
    }

    // Tiếng chuông báo thông báo nhẹ nhàng (Gentle Dual Chime / Bell)
    playBellNotification() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime || 0;
        try {
            const bellNotes = [880, 1318.5]; // A5 -> E6
            bellNotes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.12);

                gain.gain.setValueAtTime(0.3, now + i * 0.12);
                if (gain.gain.exponentialRampToValueAtTime) {
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);
                }

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now + i * 0.12);
                osc.stop(now + i * 0.12 + 0.65);
            });
        } catch (e) {}
    }

    playChime() {
        return this.playBellNotification();
    }

    // 5. Tiếng Chúc Mừng Lên Cấp (Level Up Fanfare Arpeggio)
    playLevelUp() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime || 0;
        try {
            const arpeggio = [523.25, 659.25, 783.99, 1046.5];
            arpeggio.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.1);

                gain.gain.setValueAtTime(0.25, now + i * 0.1);
                if (gain.gain.exponentialRampToValueAtTime) {
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);
                }

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.65);
            });
        } catch (e) {}
    }

    // 6. Tiếng Cảnh báo nhẹ khi hết hàng hoặc lỗi
    playError() {
        if (this.isMuted) return;
        try {
            this.resume();
            if (!this.ctx || !this.masterGain) return;
            const now = this.ctx.currentTime || 0;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            if (typeof osc.frequency.linearRampToValueAtTime === 'function') {
                osc.frequency.linearRampToValueAtTime(140, now + 0.12);
            }

            gain.gain.setValueAtTime(0.18, now);
            if (typeof gain.gain.exponentialRampToValueAtTime === 'function') {
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            }

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {}
    }

    // Tiếng click nút UI nhẹ nhàng
    playClick() {
        if (this.isMuted) return;
        try {
            this.resume();
            if (!this.ctx || !this.masterGain) return;
            const now = this.ctx.currentTime || 0;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            if (typeof osc.frequency.exponentialRampToValueAtTime === 'function') {
                osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);
            }
            gain.gain.setValueAtTime(0.12, now);
            if (typeof gain.gain.exponentialRampToValueAtTime === 'function') {
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            }
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {}
    }

    // 7. Tiếng còi xe máy đô thị Sài Gòn (Urban Horn Beep)
    playUrbanHorn() {
        if (this.isMuted) return;
        try {
            const wallNow = Date.now();
            if (wallNow - this.lastHornTime < 600) return;
            this.lastHornTime = wallNow;

            this.resume();
            if (!this.ctx || !this.masterGain) return;
            const now = this.ctx.currentTime || 0;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, now);
            if (typeof osc.frequency.setValueAtTime === 'function') {
                osc.frequency.setValueAtTime(466, now + 0.05);
            }
            gain.gain.setValueAtTime(0.15, now);
            if (typeof gain.gain.exponentialRampToValueAtTime === 'function') {
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            }
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.18);
        } catch (e) {}
    }

    // 8. Tiếng còi cảnh báo Trật Tự Đô Thị (Double Beep)
    playWarningBeep() {
        if (this.isMuted) return;
        try {
            const wallNow = Date.now();
            if (wallNow - this.lastWarningBeepTime < 800) return;
            this.lastWarningBeepTime = wallNow;

            this.resume();
            if (!this.ctx || !this.masterGain) return;
            const now = this.ctx.currentTime || 0;

            [0, 0.14].forEach(delay => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(880, now + delay);
                gain.gain.setValueAtTime(0.15, now + delay);
                if (typeof gain.gain.exponentialRampToValueAtTime === 'function') {
                    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);
                }
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now + delay);
                osc.stop(now + delay + 0.1);
            });
        } catch (e) {}
    }

    // 9. Tiếng còi hụ cảnh sát / phạt vi phạm
    playPoliceSiren() {
        if (this.isMuted) return;
        try {
            const wallNow = Date.now();
            if (wallNow - this.lastPoliceSirenTime < 1800) return;
            this.lastPoliceSirenTime = wallNow;

            this.resume();
            if (!this.ctx || !this.masterGain) return;
            const now = this.ctx.currentTime || 0;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(650, now);
            if (typeof osc.frequency.linearRampToValueAtTime === 'function') {
                osc.frequency.linearRampToValueAtTime(950, now + 0.25);
                osc.frequency.linearRampToValueAtTime(550, now + 0.55);
                osc.frequency.linearRampToValueAtTime(950, now + 0.85);
                osc.frequency.linearRampToValueAtTime(600, now + 1.15);
            }

            gain.gain.setValueAtTime(0.28, now);
            if (typeof gain.gain.exponentialRampToValueAtTime === 'function') {
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
            }

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 1.3);
        } catch (e) {}
    }

    // Các hàm alias tương thích
    playWarning() {
        return this.playWarningBeep();
    }

    playSiren() {
        return this.playPoliceSiren();
    }

    playAlarm() {
        return this.playPoliceSiren();
    }
}

export const audio = new AudioManager();
