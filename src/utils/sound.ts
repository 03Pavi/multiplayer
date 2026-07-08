/**
 * Synthetic Audio Generator for game sounds.
 * Synthesizes gaming click notes using the Web Audio API.
 */
export const playSound = (type: "click" | "success" | "countdown") => {
  if (typeof window === "undefined") return;
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === "click") {
      osc.frequency.setValueAtTime(600, audioContext.currentTime);
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
      osc.start();
      osc.stop(audioContext.currentTime + 0.08);
    } else if (type === "success") {
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      osc.start();
      osc.stop(audioContext.currentTime + 0.3);
    } else if (type === "countdown") {
      osc.frequency.setValueAtTime(400, audioContext.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      osc.start();
      osc.stop(audioContext.currentTime + 0.15);
    }
  } catch (error) {
    console.warn("Web Audio API not supported or context blocked by user interaction policy", error);
  }
};
