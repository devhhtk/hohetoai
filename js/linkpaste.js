/**
 * Aumage — Link Paste Module
 * Handles Spotify and YouTube link input.
 * Validates URL format. Audio extraction happens server-side.
 */

const AumageLinkPaste = {
  patterns: {
    spotify: /^https?:\/\/(open\.)?spotify\.com\/(track|album|playlist)\//,
    youtube: /^https?:\/\/(www\.)?(youtube\.com\/watch|youtu\.be\/)/
  },
  
  init() {
    document.getElementById('btn-submit-link')?.addEventListener('click', () => this.submit());
    document.getElementById('link-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submit();
    });
  },
  
  submit() {
    const input = document.getElementById('link-input');
    const url = input?.value?.trim();
    
    if (!url) { alert('Please paste a Spotify or YouTube link.'); return; }
    if (!this.isValidLink(url)) { alert('Please paste a valid Spotify or YouTube link.'); return; }
    
    Aumage.onLinkReady(url);
  },
  
  isValidLink(url) {
    return this.patterns.spotify.test(url) || this.patterns.youtube.test(url);
  }
};

document.addEventListener('DOMContentLoaded', () => AumageLinkPaste.init());
