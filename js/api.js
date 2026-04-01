/**
 * Aumage — Frontend API Wrapper
 */
const AumageAPI = {
  /**
   * Extract signal from an image file.
   * @param {File} file 
   */
  async extractImage(file) {
    const arrayBuffer = await file.arrayBuffer();
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/extract-image`, {
      method: 'POST',
      body: arrayBuffer,
      headers: {
        'Content-Type': 'image/png', // The worker handles PNG/JPG
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract image signal');
    }

    return await response.json();
  },


/**
 * Extract signal from audio recording.
 * @param {Blob} file 
 */
async extractAudio(file) {
  const arrayBuffer = await file.arrayBuffer();

  const response = await fetch(`${CONFIG.API_BASE_URL}/api/extract`, {
    method: 'POST',
    body: arrayBuffer,
    headers: {
      'Content-Type': 'audio/webm', // matches MediaRecorder output
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract audio signal');
  }

  return await response.json();
},


/**
 * Extract signal from a URL (YouTube / Spotify)
 */
async extractFromUrl(url) {
  const response = await fetch(`${CONFIG.API_BASE_URL}/api/extract-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract from URL');
  }

  return await response.json();
}
  

  /**
   * Generate a creature from a signed signal.
   * @param {Object} signal 
   * @param {string} signature 
   */
  async generateCreature(signal, signature) {
    const userId = window.AumageDB?.user?.id || 'anonymous';
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signal,
        signature,
        userId,
        cardStyle: 'tween', // Default style
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate creature');
    }

    return await response.json();
  },

  /**
   * Get creature details by ID.
   * @param {string} id 
   */
  async getCreature(id) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/creatures/${id}`);
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch creature details');
    }
    return await response.json();
  }
};

window.AumageAPI = AumageAPI;
