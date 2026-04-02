/**
 * Gestionnaire des sons du jeu
 */
export class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Crée et joue un son simple avec l'API Web Audio
   */
  play(soundType) {
    if (!this.enabled) return;

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = this.audioContext;
      const now = ctx.currentTime;

      switch (soundType) {
        case 'bet':
          this.playTone(ctx, now, 800, 0.1, 0.1);
          break;
        case 'card':
          this.playTone(ctx, now, 600, 0.08, 0.08);
          break;
        case 'stand':
          this.playTone(ctx, now, 1000, 0.15, 0.2);
          break;
        case 'bust':
          this.playTone(ctx, now, 200, 0.3, 0.5);
          break;
        case 'win':
          this.playWinSound(ctx, now);
          break;
        case 'loss':
          this.playLossSound(ctx, now);
          break;
        case 'push':
          this.playPushSound(ctx, now);
          break;
        case 'blackjack':
          this.playBlackjackSound(ctx, now);
          break;
      }
    } catch (e) {
      // Ignorer les erreurs Audio
    }
  }

  /**
   * Joue une tonalité simple
   */
  playTone(ctx, startTime, frequency, duration, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Son de victoire (montée de notes)
   */
  playWinSound(ctx, startTime) {
    const frequencies = [523.25, 659.25, 783.99]; // Do, Mi, Sol
    frequencies.forEach((freq, i) => {
      this.playTone(ctx, startTime + (i * 0.15), freq, 0.2, 0.3);
    });
  }

  /**
   * Son de défaite (descente de notes)
   */
  playLossSound(ctx, startTime) {
    const frequencies = [400, 350, 300];
    frequencies.forEach((freq, i) => {
      this.playTone(ctx, startTime + (i * 0.15), freq, 0.2, 0.3);
    });
  }

  /**
   * Son d'égalité
   */
  playPushSound(ctx, startTime) {
    this.playTone(ctx, startTime, 440, 0.1, 0.2);
    this.playTone(ctx, startTime + 0.15, 440, 0.1, 0.2);
  }

  /**
   * Son de blackjack
   */
  playBlackjackSound(ctx, startTime) {
    const frequencies = [523.25, 659.25, 783.99, 523.25];
    frequencies.forEach((freq, i) => {
      this.playTone(ctx, startTime + (i * 0.12), freq, 0.2, 0.4);
    });
  }
}
