/**
 * Aumage — Share & Download Module
 * Handles image download, video download, and Web Share API.
 */

const AumageShare = {
  async shareNative(imageUrl, title) {
    if (!navigator.share) return false;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'aumage.png', { type: 'image/png' });
      
      await navigator.share({
        title: title || 'My Aumage',
        text: 'See what my sound looks like! Made with aumage.ai',
        url: 'https://aumage.ai',
        files: [file]
      });
      return true;
    } catch (err) {
      console.log('Share cancelled or failed:', err);
      return false;
    }
  }
};

window.AumageShare = AumageShare;
