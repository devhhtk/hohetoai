/**
 * Aumage — File Upload Module
 * Handles drag-drop and file picker for audio uploads.
 * Validates format and duration. Max 30 seconds, 10MB.
 */

const AumageUploader = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxDuration: 30, // seconds
  acceptedTypes: ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/flac'],
  
  init() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    
    if (dropZone) {
      dropZone.addEventListener('click', () => fileInput?.click());
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); this.handleFile(e.dataTransfer.files[0]); });
    }
    
    fileInput?.addEventListener('change', (e) => {
      if (e.target.files[0]) this.handleFile(e.target.files[0]);
    });
  },
  
  async handleFile(file) {
    if (!file) return;
    
    // Validate size
    if (file.size > this.maxSize) {
      alert(`File too large. Maximum size is ${this.maxSize / 1024 / 1024}MB.`);
      return;
    }
    
    // Validate duration
    try {
      const duration = await this.getAudioDuration(file);
      if (duration > this.maxDuration) {
        alert(`Audio is ${Math.round(duration)} seconds. Maximum is ${this.maxDuration} seconds. Please trim your clip.`);
        return;
      }
    } catch (err) {
      console.warn('Could not validate duration, proceeding anyway:', err);
    }
    
    // Pass to main app
    Aumage.onAudioReady(file, 'upload', file.name);
  },
  
  getAudioDuration(file) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => resolve(audio.duration));
      audio.addEventListener('error', reject);
      audio.src = URL.createObjectURL(file);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => AumageUploader.init());
