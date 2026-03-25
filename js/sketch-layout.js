/**
 * Aumage — Sketch Layout Engine
 *
 * Positions 3 sketch zones on the creature panel based on
 * where the main creature sits. Picks a random layout each time
 * so cards never look the same.
 *
 * Called after result-image loads so we know panel dimensions.
 */

const AumageSketchLayout = {

  // 6 layout configs — (cx,cy) is creature center as fraction of panel
  // Each layout describes where the 3 sketches go relative to the creature
  LAYOUTS: [
    // Creature upper-left → sketches right + lower-left
    [
      { top: 0.04, right: 0.03, w: 0.28, h: 0.22 },
      { top: 0.30, right: 0.03, w: 0.26, h: 0.20 },
      { bottom: 0.04, left: 0.04, w: 0.26, h: 0.20 },
    ],
    // Creature upper-right → sketches left + lower-right
    [
      { top: 0.04, left: 0.03, w: 0.28, h: 0.22 },
      { top: 0.30, left: 0.03, w: 0.26, h: 0.20 },
      { bottom: 0.04, right: 0.04, w: 0.26, h: 0.20 },
    ],
    // Creature upper-center → sketches in bottom corners + center-bottom
    [
      { bottom: 0.04, left: 0.03, w: 0.26, h: 0.20 },
      { bottom: 0.04, left: '50%', transform: 'translateX(-50%)', w: 0.24, h: 0.19 },
      { bottom: 0.04, right: 0.03, w: 0.26, h: 0.20 },
    ],
    // Creature center-left → sketches right column
    [
      { top: 0.04, right: 0.03, w: 0.28, h: 0.22 },
      { top: '50%', transform: 'translateY(-50%)', right: 0.03, w: 0.26, h: 0.20 },
      { bottom: 0.04, right: 0.03, w: 0.28, h: 0.22 },
    ],
    // Creature center-right → sketches left column
    [
      { top: 0.04, left: 0.03, w: 0.28, h: 0.22 },
      { top: '50%', transform: 'translateY(-50%)', left: 0.03, w: 0.26, h: 0.20 },
      { bottom: 0.04, left: 0.03, w: 0.28, h: 0.22 },
    ],
    // Creature center compact → sketches in three corners
    [
      { top: 0.04, left: 0.03, w: 0.26, h: 0.21 },
      { top: 0.04, right: 0.03, w: 0.26, h: 0.21 },
      { bottom: 0.04, left: '50%', transform: 'translateX(-50%)', w: 0.26, h: 0.21 },
    ],
  ],

  /**
   * Position the 3 sketch zones on the panel.
   * Called once after result-image loads.
   */
  position() {
    const panel = document.getElementById('result-image')?.parentElement;
    if (!panel) return;

    const W = panel.offsetWidth;
    const H = panel.offsetHeight;
    if (!W || !H) {
      console.warn('[SketchLayout] Panel has no dimensions, retrying...');
      setTimeout(() => this.position(), 200);
      return;
    }
    console.log('[SketchLayout] Positioning sketches on panel', W, 'x', H);

    const layout = this.LAYOUTS[Math.floor(Math.random() * this.LAYOUTS.length)];

    for (let i = 0; i < 3; i++) {
      const zone = document.getElementById(`sketch-${i}`);
      if (!zone) continue;

      const cfg = layout[i];
      const zW = Math.round(cfg.w * W);
      const zH = Math.round(cfg.h * H);

      zone.style.display = 'block';
      zone.style.width  = zW + 'px';
      zone.style.height = zH + 'px';

      // Reset positioning
      zone.style.top = zone.style.bottom = zone.style.left = zone.style.right = 'auto';
      zone.style.transform = cfg.transform || '';

      if (cfg.top    !== undefined) zone.style.top    = typeof cfg.top    === 'number' ? Math.round(cfg.top    * H) + 'px' : cfg.top;
      if (cfg.bottom !== undefined) zone.style.bottom = typeof cfg.bottom === 'number' ? Math.round(cfg.bottom * H) + 'px' : cfg.bottom;
      if (cfg.left   !== undefined) zone.style.left   = typeof cfg.left   === 'number' ? Math.round(cfg.left   * W) + 'px' : cfg.left;
      if (cfg.right  !== undefined) zone.style.right  = typeof cfg.right  === 'number' ? Math.round(cfg.right  * W) + 'px' : cfg.right;

      // Show shimmer while loading
      zone.classList.add('loading');
      zone.classList.remove('loaded');
      zone.innerHTML = '';
    }
  },

  /**
   * Load a sketch image into a zone slot (0, 1, or 2).
   * @param {number} index  - Slot index
   * @param {string} url    - Image URL from FLUX
   */
  loadSketch(index, url) {
    const zone = document.getElementById(`sketch-${index}`);
    if (!zone) return;

    const img = new Image();
    img.onload = () => {
      zone.classList.remove('loading');
      zone.innerHTML = '';
      zone.appendChild(img);
      // Small stagger so they don't all pop at once
      setTimeout(() => zone.classList.add('loaded'), index * 120);
    };
    img.onerror = () => {
      // Hide zone silently if sketch failed
      zone.style.display = 'none';
    };
    img.src = url;
  },

  /**
   * Hide all sketch zones (call on new generation start).
   */
  reset() {
    for (let i = 0; i < 3; i++) {
      const zone = document.getElementById(`sketch-${i}`);
      if (zone) {
        zone.style.display = 'none';
        zone.classList.remove('loading', 'loaded');
        zone.innerHTML = '';
      }
    }
  },
};

if (typeof window !== 'undefined') window.AumageSketchLayout = AumageSketchLayout;
