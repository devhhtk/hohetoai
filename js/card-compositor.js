/**
 * Aumage Card Compositor — v16 (Viewport Clipping)
 * Canvas-drawn frosted glass plates. No PNG frame.
 * 426x778 native, 2x render.
 *
 * Architecture (from proven v7 approach):
 *   1. Trope gradient fills ENTIRE card edge to edge
 *   2. Creature drawn into CLIPPED VIEWPORT between plates (cover-fit)
 *   3. Vignette darkens edges
 *   4. Glass plates drawn on top
 *   5. Text rendered into plate zones
 *
 * Viewport: x=0, y=0, w=426, h=650 (full width, from top to bottom plate)
 * Creature is ALWAYS fully contained — no cropping off card edges.
 */

var AumageCard = {

  FW: 426, FH: 778, SCALE: 2.0,
  get W() { return Math.round(this.FW * this.SCALE); },
  get H() { return Math.round(this.FH * this.SCALE); },

  // Creature viewport — full width, from card top to where bottom plate starts
  VP: { x: 0, y: 0, w: 426, h: 650 },

  TROPE_BG: {
    Terratrope:  { top: '#0c2a1a', mid: '#1a4a30', bot: '#2a5a3a' },
    Aquatrope:   { top: '#0a1e2e', mid: '#0e3048', bot: '#1a4a60' },
    Aerotrope:   { top: '#0e2830', mid: '#1a4858', bot: '#2a6878' },
    Pyrotrope:   { top: '#1a0e0a', mid: '#3a1a10', bot: '#5a2a1a' },
    Floratrope:  { top: '#0a1e0e', mid: '#1a3820', bot: '#2a5030' },
    Prismatrope: { top: '#1a0e28', mid: '#2a1a40', bot: '#3a2a58' },
  },

  C: {
    gold: '#c8a870', goldBright: '#e0c890', cream: '#e8dcc8', white: '#f0ece4',
    textLight: '#c0dce0', textDim: '#5a9a9e',
  },

  async render(data) {
    var S = this.SCALE;
    var canvas = document.createElement('canvas');
    canvas.width = this.W; canvas.height = this.H;
    canvas.style.width = '100%'; canvas.style.maxWidth = '760px'; canvas.style.height = 'auto';
    var ctx = canvas.getContext('2d');
    ctx.scale(S, S);

    var creatureImg = await this._loadImg(data.creatureUrl);
    var trope = data.trope || 'Aquatrope';
    var bg = this.TROPE_BG[trope] || this.TROPE_BG.Aquatrope;

    // ══════════════════════════════════════════
    // L1: TROPE GRADIENT (fills ENTIRE card edge to edge)
    // ══════════════════════════════════════════
    var grad = ctx.createLinearGradient(0, 0, 0, this.FH);
    grad.addColorStop(0, bg.top); grad.addColorStop(0.5, bg.mid); grad.addColorStop(1, bg.bot);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.FW, this.FH);

    // ══════════════════════════════════════════
    // L2: CREATURE (cover-fit into CLIPPED VIEWPORT)
    // Viewport: full width, top to bottom plate
    // ══════════════════════════════════════════
    if (creatureImg) {
      var vp = this.VP;
      var imgR = creatureImg.width / creatureImg.height;
      var vpR = vp.w / vp.h;
      var sx, sy, sw, sh;
      if (imgR > vpR) {
        sh = creatureImg.height; sw = sh * vpR;
        sx = (creatureImg.width - sw) / 2; sy = 0;
      } else {
        sw = creatureImg.width; sh = sw / vpR;
        sx = 0; sy = (creatureImg.height - sh) / 2;
      }
      // Clip to viewport — creature can never bleed outside this area
      ctx.save();
      ctx.beginPath();
      ctx.rect(vp.x, vp.y, vp.w, vp.h);
      ctx.clip();
      ctx.drawImage(creatureImg, sx, sy, sw, sh, vp.x, vp.y, vp.w, vp.h);
      ctx.restore();
    }

    // ══════════════════════════════════════════
    // L3: VIGNETTE (over creature area)
    // ══════════════════════════════════════════
    var vig = ctx.createRadialGradient(this.FW/2, this.VP.h*0.4, Math.max(this.FW,this.VP.h)*0.15, this.FW/2, this.VP.h*0.4, Math.max(this.FW,this.VP.h)*0.55);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    vig.addColorStop(0.8, 'rgba(0,0,0,0.3)'); vig.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, this.FW, this.VP.h);

    // Top darken (behind top plate)
    var tg = ctx.createLinearGradient(0, 0, 0, 100);
    tg.addColorStop(0, 'rgba(0,0,0,0.55)'); tg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = tg; ctx.fillRect(0, 0, this.FW, 100);

    // Bottom darken (transition to bottom plate)
    var btg = ctx.createLinearGradient(0, this.VP.h - 120, 0, this.VP.h);
    btg.addColorStop(0, 'rgba(0,0,0,0)'); btg.addColorStop(0.5, 'rgba(0,0,0,0.3)'); btg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = btg; ctx.fillRect(0, this.VP.h - 120, this.FW, 120);

    // ══════════════════════════════════════════
    // L4: GLASS PLATES
    // ══════════════════════════════════════════

    // TOP PLATE (name + taxonomy)
    this._glassPlate(ctx, 20, 12, this.FW - 40, 65, 10);
    ctx.strokeStyle = 'rgba(160,210,220,0.3)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(50, 48); ctx.lineTo(this.FW - 50, 48); ctx.stroke();
    ctx.strokeStyle = 'rgba(180,220,230,0.15)'; ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(60, 50); ctx.lineTo(this.FW - 60, 50); ctx.stroke();

    // BOTTOM PANEL (120h, starts at 650)
    this._glassPlate(ctx, 14, 650, this.FW - 28, 120, 10);

    // Panel dividers
    var pL = 28, pR = this.FW - 28;
    ctx.strokeStyle = 'rgba(120,180,185,0.15)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(pL, 676); ctx.lineTo(pR, 676); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pL, 710); ctx.lineTo(pR, 710); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pL, 732); ctx.lineTo(pR, 732); ctx.stroke();

    // Card border
    ctx.strokeStyle = 'rgba(80,160,168,0.3)'; ctx.lineWidth = 1.5;
    this._rrp(ctx, 3, 3, this.FW-6, this.FH-6, 12); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,100,108,0.45)'; ctx.lineWidth = 2;
    this._rrp(ctx, 1, 1, this.FW-2, this.FH-2, 14); ctx.stroke();

    // ══════════════════════════════════════════
    // L5: TEXT
    // ══════════════════════════════════════════
    ctx.textBaseline = 'middle';

    // --- NAME ---
    var dn = (data.name || 'Unknown').toUpperCase();
    ctx.textAlign = 'center';
    var ns = 20;
    ctx.font = '800 ' + ns + 'px Georgia, serif';
    while (ctx.measureText(dn).width > this.FW - 80 && ns > 11) { ns--; ctx.font = '800 ' + ns + 'px Georgia, serif'; }
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillText(dn, this.FW/2+1, 31);
    ctx.fillStyle = this.C.gold; ctx.fillText(dn, this.FW/2, 30);
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = this.C.goldBright; ctx.fillText(dn, this.FW/2, 29); ctx.restore();

    // --- TAXONOMY ---
    ctx.font = '600 13px Arial, sans-serif'; ctx.fillStyle = this.C.textLight; ctx.textAlign = 'center';
    ctx.fillText((data.gen||'Resogen') + '    \u00B7    ' + (data.trope||'Terratrope') + '    \u00B7    ' + (data.rarity||'Abundant'), this.FW/2, 64);

    // ══════════════════════════════════════════
    // BOTTOM PANEL TEXT (y 650–770)
    // ══════════════════════════════════════════

    // --- SPECIES + ID (y≈664) ---
    var sp = data.species || data.morphology || 'Unknown';
    ctx.textAlign = 'left';
    ctx.font = '700 10px Arial, sans-serif'; ctx.fillStyle = this.C.textDim;
    ctx.fillText('SPECIES:', pL, 664);
    ctx.font = '700 12px Arial, sans-serif'; ctx.fillStyle = this.C.cream;
    ctx.fillText(sp, pL + 60, 664);
    ctx.textAlign = 'right';
    ctx.font = '700 10px "Courier New", monospace'; ctx.fillStyle = this.C.cream;
    ctx.fillText(data.specimenId || 'AM-00000', pR, 664);

    // --- STATS (y≈694) ---
    var st = data.stats || { power:50, agility:50, defense:50, arcana:50 };
    var se = [['PWR',st.power||50],['AGI',st.agility||50],['DEF',st.defense||50],['ARC',st.arcana||50]];
    var sW = (pR - pL) / se.length;
    for (var i = 0; i < se.length; i++) {
      var cx = pL + sW * i + sW / 2;
      ctx.textAlign = 'center';
      ctx.font = '800 10px Arial, sans-serif'; ctx.fillStyle = this.C.textDim;
      ctx.fillText(se[i][0], cx - 12, 694);
      ctx.font = '800 16px Arial, sans-serif'; ctx.fillStyle = this.C.white;
      ctx.fillText(String(se[i][1]), cx + 20, 695);
    }
    ctx.strokeStyle = 'rgba(100,170,175,0.2)'; ctx.lineWidth = 0.5;
    for (var j = 1; j < se.length; j++) {
      var dx = pL + sW * j;
      ctx.beginPath(); ctx.moveTo(dx, 684); ctx.lineTo(dx, 706); ctx.stroke();
    }

    // --- FLAVOR TEXT (centered, y≈718) ---
    if (data.flavorText) {
      ctx.textAlign = 'center'; ctx.font = 'italic 8px Georgia, serif';
      ctx.fillStyle = this.C.cream;
      var fl = this._wrap(ctx, data.flavorText, pR - pL - 20);
      for (var k = 0; k < Math.min(fl.length, 2); k++) {
        ctx.fillText(fl[k], this.FW / 2, 718 + k * 10);
      }
    }

    // --- WAVEFORM + GENE SEQUENCE (y≈744) ---
    this._waveform(ctx, pL, 736, (pR-pL) * 0.25, 14, data);
    if (data.geneSequence) {
      ctx.textAlign = 'left'; ctx.font = '400 7px "Courier New", monospace';
      ctx.fillStyle = this.C.gold;
      ctx.fillText(data.geneSequence, pL + (pR-pL)*0.28, 744);
    }

    // --- FOOTER (y≈762) ---
    ctx.font = '500 5.5px Arial, sans-serif'; ctx.fillStyle = 'rgba(168,140,88,0.45)';
    ctx.textAlign = 'left'; ctx.fillText('\u00A9 GeoffMedia', pL, 762);
    ctx.textAlign = 'center'; ctx.font = '600 5.5px Arial, sans-serif';
    ctx.fillText('Hoheto Kai Bestiary', this.FW/2, 762);
    ctx.textAlign = 'right'; ctx.font = '500 5.5px "Courier New", monospace';
    ctx.fillText(data.specimenId || 'AM-00000', pR, 762);

    return canvas;
  },

  // ══════════════════════════════════════════
  // FROSTED GLASS PLATE
  // ══════════════════════════════════════════
  _glassPlate: function(ctx, x, y, w, h, r) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3;
    ctx.fillStyle = 'rgba(0,0,0,0)';
    this._rrp(ctx, x, y, w, h, r); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(180,210,215,0.12)';
    this._rrp(ctx, x, y, w, h, r); ctx.fill();
    ctx.fillStyle = 'rgba(10,35,40,0.25)';
    this._rrp(ctx, x, y, w, h, r); ctx.fill();
    ctx.fillStyle = 'rgba(200,220,225,0.08)';
    this._rrp(ctx, x+2, y+2, w-4, h-4, Math.max(1,r-2)); ctx.fill();
    var sg = ctx.createLinearGradient(x, y, x, y + Math.min(h*0.5, 28));
    sg.addColorStop(0, 'rgba(220,245,250,0.50)'); sg.addColorStop(0.2, 'rgba(220,245,250,0.22)');
    sg.addColorStop(0.5, 'rgba(220,245,250,0.06)'); sg.addColorStop(1, 'rgba(220,245,250,0)');
    ctx.fillStyle = sg;
    this._rrp(ctx, x+1, y+1, w-2, Math.min(h*0.5,28), Math.max(1,r-1)); ctx.fill();
    ctx.strokeStyle = 'rgba(235,252,255,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x+r+3, y+1); ctx.lineTo(x+w-r-3, y+1); ctx.stroke();
    ctx.strokeStyle = 'rgba(220,245,250,0.25)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(x+r+6, y+3); ctx.lineTo(x+w-r-6, y+3); ctx.stroke();
    var th = Math.max(2, h*0.07);
    var tGrad = ctx.createLinearGradient(x, y+h-th, x, y+h);
    tGrad.addColorStop(0, 'rgba(0,0,0,0)'); tGrad.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = tGrad;
    this._rrp(ctx, x, y+h-th, w, th, Math.max(1,r/2)); ctx.fill();
    ctx.strokeStyle = 'rgba(180,220,230,0.15)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x+r+6, y+h-1); ctx.lineTo(x+w-r-6, y+h-1); ctx.stroke();
    ctx.strokeStyle = 'rgba(140,200,210,0.30)'; ctx.lineWidth = 1;
    this._rrp(ctx, x, y, w, h, r); ctx.stroke();
    ctx.strokeStyle = 'rgba(180,220,230,0.15)'; ctx.lineWidth = 0.5;
    this._rrp(ctx, x+1.5, y+1.5, w-3, h-3, Math.max(1,r-1.5)); ctx.stroke();
    ctx.restore();
  },

  _waveform: function(ctx, x, y, w, h, data) {
    var mid = y+h/2, steps = 40, sw = w/steps;
    var g = data.geneSequence || 'ACGTACGTACGTACGTAC';
    ctx.strokeStyle = 'rgba(168,140,88,0.55)'; ctx.lineWidth = 0.8; ctx.beginPath();
    for (var i=0; i<steps; i++) {
      var cc=g.charCodeAt(i%g.length)||65;
      var amp=(h/2-1)*(0.3+0.7*((cc%20)/20));
      var v=Math.sin((i/steps)*Math.PI*8+(0.15+(cc%10)*0.02)*i)*amp;
      if(i===0) ctx.moveTo(x,mid+v); else ctx.lineTo(x+i*sw,mid+v);
    }
    ctx.stroke();
  },

  renderToDataUrl: function(d){return this.render(d).then(function(c){return c.toDataURL('image/png');});},
  _rrp: function(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();},
  _wrap: function(ctx,t,mw){var w=t.replace(/<[^>]*>/g,'').split(' '),ls=[],l='';for(var i=0;i<w.length;i++){var x=l+(l?' ':'')+w[i];if(ctx.measureText(x).width>mw&&l){ls.push(l);l=w[i];}else l=x;}if(l)ls.push(l);return ls;},
  _loadImg: function(src){if(!src)return Promise.resolve(null);return new Promise(function(r){var i=new Image();i.crossOrigin='anonymous';i.onload=function(){r(i);};i.onerror=function(){console.warn('[Card] Failed:',src);r(null);};i.src=src;});},
};
