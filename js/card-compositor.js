/**
 * Aumage Card Compositor — v24 (High-Fidelity DNA Frame)
 * Render engine for premium schematic cards.
 */

var AumageCard = {
  // Dimension constants based on img/frame.png
  FW: 929, 
  FH: 1348,
  SCALE: 1.0,

  // Color constants
  C: {
    cyan: '#08D2C1',
    cyanGlow: 'rgba(8, 210, 193, 0.4)',
    textMain: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    gold: '#ffd700',
    orange: '#f97316',
    pink: '#ec4899',
    blue: '#3b82f6',
    yellow: '#eab308',
    red: '#ef4444'
  },

  async render(data) {
    const canvas = document.createElement('canvas');
    canvas.width = this.FW;
    canvas.height = this.FH;
    const ctx = canvas.getContext('2d');

    // 0. Proxy the creature URL
    const originalUrl = data.creatureUrl;
    const proxiedUrl = this._proxyUrl(originalUrl);
    console.log('[AumageCard] Original URL:', originalUrl);
    console.log('[AumageCard] Proxied URL:', proxiedUrl);

    // 1. Load Assets
    const [frameImg, creatureImg] = await Promise.all([
      this._loadImg('../img/frame.png'),
      this._loadImg(proxiedUrl)
    ]);

    if (frameImg) console.log('[AumageCard] Frame loaded successfully.');
    else console.warn('[AumageCard] Frame failed to load: ../img/frame.png');

    if (creatureImg) console.log('[AumageCard] Creature loaded successfully.');
    else console.warn('[AumageCard] Creature failed to load:', proxiedUrl);

    // 2. Clear Canvas
    ctx.clearRect(0, 0, this.FW, this.FH);
    console.log('[AumageCard] Canvas cleared, size:', this.FW, 'x', this.FH);

    // 3. Draw Creature in Viewport (Behind Frame)
    if (creatureImg) {
      const vpx = 125, vpy = 285, vpw = 675, vph = 500;
      this._drawCoverImg(ctx, creatureImg, vpx, vpy, vpw, vph);
    } else {
      console.warn('[AumageCard] No creature image to draw.');
      // Optional: Draw placeholder background
      ctx.fillStyle = '#011616';
      ctx.fillRect(125, 285, 675, 500);
    }

    // 4. Draw Frame (Overlay)
    if (frameImg) {
      ctx.drawImage(frameImg, 0, 0, this.FW, this.FH);
    } else {
      console.warn('[AumageCard] No frame image to draw.');
    }

    // 5. Render Text & Components (on top)
    this._drawMainText(ctx, data);
    this._drawTaxonomy(ctx, data);
    this._drawSpecimenID(ctx, data);
    this._drawHertzData(ctx, data);

    // 5. Render DNA / Stats Bars
    this._drawDnaBars(ctx, data);

    return canvas;
  },

  _drawMainText(ctx, data) {
    const name = (data.name || 'UNNAMED SPECIMEN').toUpperCase();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Auto-scale font size for long names
    let fontSize = 52;
    if (name.length > 12) fontSize = 42;
    if (name.length > 18) fontSize = 32;

    // Positioned in the top title slot
    ctx.font = `800 ${fontSize}px "Exo 2", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.C.cyanGlow;
    ctx.fillText(name, this.FW / 2, 105);
    ctx.shadowBlur = 0;
  },

  _drawTaxonomy(ctx, data) {
    const tax = `${data.trope || 'TERRATROPE'} — ${data.rarity || 'ABUNDANT'}`.toUpperCase();
    ctx.font = '700 24px "Instrument Sans", sans-serif';
    ctx.fillStyle = this.C.cyan;
    ctx.fillText(tax, this.FW / 2, 155);
    
    const subTax = `${data.gen || 'RESOGEN'} — ${data.element || 'SHADOW'}`.toUpperCase();
    ctx.font = '600 18px "Instrument Sans", sans-serif';
    ctx.fillStyle = this.C.textMuted;
    ctx.fillText(subTax, this.FW / 2, 185);
  },

  _drawSpecimenID(ctx, data) {
    const sid = `SPECIMEN ${data.specimenId || 'HK-MA50EG'}`.toUpperCase();
    ctx.textAlign = 'right';
    ctx.font = '700 16px monospace';
    ctx.fillStyle = this.C.textMuted;
    ctx.fillText(sid, this.FW - 130, 1145);
  },

  _drawHertzData(ctx, data) {
    // Hertz Number at bottom left
    const hertz = data.hertzNumber || 7;
    ctx.textAlign = 'left';
    ctx.font = '800 28px "Exo 2", sans-serif';
    ctx.fillStyle = this.C.gold;
    ctx.fillText(hertz, 180, 1265);

    // Gene sequence at bottom right
    const gene = data.geneSequence || 'AGCT-TCGA-GATC-CTAG';
    ctx.textAlign = 'left';
    ctx.font = '600 14px monospace';
    ctx.fillStyle = this.C.cyan;
    ctx.fillText(gene, 730, 1265);
  },

  _drawDnaBars(ctx, data) {
    const stats = data.stats || {};
    // Mapping slots in the bottom panel
    // Left side slots (4)
    const leftSlots = [
      { label: 'COMPLEXITY', val: stats.complexity || 30, color: this.C.orange },
      { label: 'INTENSITY', val: stats.intensity || 38, color: this.C.pink },
      { label: 'HARMONY', val: stats.harmony || 50, color: this.C.blue },
      { label: 'WARMTH', val: stats.warmth || 80, color: this.C.orange }
    ];
    // Right side slots (4)
    const rightSlots = [
      { label: 'ROUGHNESS', val: stats.roughness || 29, color: this.C.red },
      { label: 'BRIGHTNESS', val: stats.brightness || 20, color: this.C.yellow },
      { label: 'AGILITY', val: stats.agility || 45, color: this.C.cyan },
      { label: 'DEFENSE', val: stats.defense || 60, color: this.C.blue }
    ];

    const drawSlots = (slots, startX, startY) => {
      slots.forEach((s, i) => {
        const y = startY + (i * 35.5);
        const w = 310;
        const h = 8;
        
        // Label (optional on card? No, usually just the bar)
        // Check image: the labels might be embedded in the frame. Yes they are!
        // We just draw the bar fill.
        
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = s.color;
        const fillW = (s.val / 100) * w;
        ctx.fillRect(startX, y, fillW, h);
        ctx.shadowBlur = 0;
      });
    };

    drawSlots(leftSlots, 142, 1035);
    drawSlots(rightSlots, 510, 1035);
  },

  _drawCoverImg(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sx, sy, sw, sh;

    if (imgRatio > boxRatio) {
      sh = img.height;
      sw = sh * boxRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  },

  _proxyUrl(url) {
    if (!url) return url;
    // Proxy B2 URLs to avoid CORS issues
    if (url.includes('backblazeb2.com') || url.includes('cards.aumage.ai')) {
      const match = url.match(/aumage-cards\/(.+)$/) || url.match(/cards\.aumage\.ai\/(.+)$/);
      if (match) return 'https://hohetai-api.devhhtk.workers.dev/api/image/' + match[1];
    }
    return url;
  },

  _loadImg(src) {
    if (!src) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn('[AumageCard] Failed to load:', src);
        resolve(null);
      };
      img.src = src;
    });
  },

  async renderToBlob(data) {
    const canvas = await this.render(data);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  }
};
