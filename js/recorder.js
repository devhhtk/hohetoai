/**
 * Aumage — Mic Recorder Module
 * Captures audio from user's microphone via Web Audio API.
 * Max duration: 30 seconds. Outputs WAV blob.
 */

const AumageRecorder = {
  mediaRecorder: null,
  audioChunks: [],
  stream: null,
  timerInterval: null,
  startTime: null,
  maxDuration: 30000, // 30 seconds in ms
  
  init() {
    document.getElementById('btn-record')?.addEventListener('click', () => this.start());
    document.getElementById('btn-stop-record')?.addEventListener('click', () => this.stop());
  },
  
  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType()
      });
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      
      this.mediaRecorder.onstop = () => this.onRecordingComplete();
      
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.startTime = Date.now();
      
      // Show recording UI
      document.getElementById('recorder-ui')?.classList.remove('hidden');
      document.getElementById('btn-record')?.classList.add('hidden');
      
      // Start waveform visualization
      if (window.AumageWaveform) {
        window.AumageWaveform.start(this.stream);
      }
      
      // Timer
      this.timerInterval = setInterval(() => this.updateTimer(), 100);
      
      // Auto-stop at max duration
      setTimeout(() => {
        if (this.mediaRecorder?.state === 'recording') this.stop();
      }, this.maxDuration);
      
    } catch (err) {
      console.error('Mic access denied:', err);
      alert('Microphone access is required to record audio. Please allow mic access and try again.');
    }
  },
  
  stop() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    clearInterval(this.timerInterval);
    
    if (window.AumageWaveform) {
      window.AumageWaveform.stop();
    }
  },
  
  onRecordingComplete() {
    const blob = new Blob(this.audioChunks, { type: this.getSupportedMimeType() });
    
    // Reset UI
    document.getElementById('recorder-ui')?.classList.add('hidden');
    document.getElementById('btn-record')?.classList.remove('hidden');
    
    // Pass to main app
    Aumage.onAudioReady(blob, 'record', '');
  },
  
  updateTimer() {
    const elapsed = Date.now() - this.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const display = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')} / 0:30`;
    const timerEl = document.getElementById('record-timer');
    if (timerEl) timerEl.textContent = display;
  },
  
  getSupportedMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || 'audio/webm';
  }
};

document.addEventListener('DOMContentLoaded', () => AumageRecorder.init());
