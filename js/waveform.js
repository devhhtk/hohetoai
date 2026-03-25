/**
 * Aumage — Waveform Visualization
 * Real-time audio waveform display during recording.
 */

const AumageWaveform = {
  analyser: null,
  canvas: null,
  ctx: null,
  animationId: null,
  
  start(stream) {
    this.canvas = document.getElementById('waveform-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);
    
    this.draw();
  },
  
  draw() {
    if (!this.analyser) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    
    const { width, height } = this.canvas;
    this.ctx.fillStyle = '#0a0a0f';
    this.ctx.fillRect(0, 0, width, height);
    
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#6366f1';
    this.ctx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
      x += sliceWidth;
    }
    
    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();
    
    this.animationId = requestAnimationFrame(() => this.draw());
  },
  
  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.analyser = null;
  }
};

window.AumageWaveform = AumageWaveform;
