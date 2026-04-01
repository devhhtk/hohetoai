/**
 * Aumage — Main Application Controller
 * Orchestrates: Input → Generate → Reveal → Result → Save → Share
 * Creature-only mode. Supabase for auth + storage.
 */

var Aumage = {
  // State
  currentStep: 'hero',
  audioBlob: null,
  audioSource: null,
  selectedMode: 'creature',
  selectedStyle: 'realistic',
  cardStyle: 'tween',
  generationId: null,
  lastCreatureRecord: null,

  API_BASE: '',
  // PIPELINE_URL: 'https://aumage-pipeline.admin-it-e6e.workers.dev',
  PIPELINE_URL: 'https://hohetai-api.devhhtk.workers.dev',

  // Build payload for pipeline Worker from frontend creature engine data
  buildPipelinePayload(visuals, features, fingerprint) {
    const primary = visuals.primary || {};
    const morph = primary.morph || {};
    const element = visuals.element || {};
    const trope = visuals.trope || {};
    const palette = visuals.palette || {};

    const colors = palette.base
      ? [palette.base, palette.second, palette.accent].filter(Boolean)
      : ['deep gray', 'midnight blue', 'silver'];

    // Locked taxonomy — 6 Tropes + Origen from input type
    // Frontend creature engine produces trope keys like 'sonatrope', 'aquatrope' etc.
    // Map them to the 6 locked Trope names
    const tropeMap = {
      terratrope: 'Terratrope',
      aquatrope: 'Aquatrope',
      aerotrope: 'Aerotrope',
      pyrotrope: 'Pyrotrope',
      floratrope: 'Floratrope',
      prismatrope: 'Prismatrope',
      // Legacy names → closest match
      sonatrope: 'Terratrope',
      umbratrope: 'Prismatrope',
      lumotrope: 'Aerotrope',
      lumitrope: 'Aerotrope',
      chronotrope: 'Terratrope',
      primatrope: 'Floratrope',
      megatrope: 'Terratrope',
    };
    const tropeRaw = (trope.key || '').toLowerCase();
    const creatureTrope = tropeMap[tropeRaw] || 'Terratrope';

    // Origen is always Resogen for audio input
    const creatureOrigen = 'Resogen';

    // 3-tier rarity: Abundant / Endemic / Holotype (locked taxonomy)
    // ⚠️ TESTING MODE: Equal distribution (33/33/33) — REVERT FOR PRODUCTION
    const rarityRoll = Math.random();
    let rarity = 'Abundant';
    if (rarityRoll >= 0.667) rarity = 'Holotype';
    else if (rarityRoll >= 0.333) rarity = 'Endemic';

    const traits = [morph.tier || '', element.primary?.name || '', creatureTrope.toLowerCase().replace('trope', '')].filter(Boolean);

    return {
      userId: window.AumageDB?.user?.id || 'anonymous',
      morphology: morph.name || 'Unknown Creature',
      trope: creatureTrope,
      origen: creatureOrigen,
      // Legacy fields for Worker compatibility
      audiotropeType: creatureTrope,
      genType: creatureOrigen,
      rarity: rarity,
      colorPalette: colors,
      traits: traits,
      audioFeatures: {
        energy: features.intensity || 0.5,
        bassEnergy: features.warmth || 0.5,
        midEnergy: features.harmonic_ratio || 0.5,
        highEnergy: features.brightness || 0.5,
        zeroCrossingRate: (features.roughness || 0.5) * 0.1,
        duration: features.duration_sec || 3,
        tempo: features.tempo || 100,
        rms: (features.intensity || 0.5) * 0.5,
        spectralCentroid: ((features.brightness || 0.5) * 6000) + 500,
      },
      audio: {
        complexity: features.complexity || 0.5,
        intensity: features.intensity || 0.5,
        harmonic_ratio: features.harmonic_ratio || 0.5,
        timbre_complexity: features.timbre_complexity || 0.3,
        brightness: features.brightness || 0.5,
        duration_sec: features.duration_sec || 10,
        duration_ms: Math.round((features.duration_sec || 10) * 1000),
        waveform_hash: fingerprint || 'web-' + Date.now().toString(36),
      },
      engine: {
        primary: { morph: { name: morph.name, tier: morph.tier } },
        element: { primary: { name: element.primary?.name || 'storm' } },
        palette: { colors },
        trope: { key: trope.key || 'sonatrope' },
        domain: visuals.creatureDomain?.desc || '',
      },
    };
  },

  init() {
    if (window.AumageDB) AumageDB.init();
    this.bindEvents(); // Always bind — even on share routes
    if (this.checkShareRoute()) return;

    // Skip hero if coming from share page CTA
    if (new URLSearchParams(window.location.search).get('create') === '1') {
      window.history.replaceState({}, '', '/'); // Clean up URL
      this.showStep('input');
    }

    console.log('Aumage initialized');
  },

  bindEvents() {
    document.getElementById('btn-start')?.addEventListener('click', () => this.showStep('input'));
    document.getElementById('btn-download-image')?.addEventListener('click', () => this.downloadImage());
    document.getElementById('btn-download-video')?.addEventListener('click', () => this.downloadVideo());
    document.getElementById('btn-share')?.addEventListener('click', () => this.shareCreature());
    document.getElementById('btn-start-over')?.addEventListener('click', () => this.reset());
    document.getElementById('btn-collection')?.addEventListener('click', () => this.toggleSidebar());
    document.getElementById('btn-sidebar-close')?.addEventListener('click', () => this.closeSidebar());
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());
    document.getElementById('btn-create-own')?.addEventListener('click', () => {
      // If already on home page, just show input step
      if (window.location.pathname === '/') {
        this.showStep('input');
      } else {
        // Navigate home with a flag to skip hero
        window.location.href = '/?create=1';
      }
    });
  },

  // ============================================================
  // SHARE URL ROUTING — /c/{slug}
  // ============================================================

  checkShareRoute() {
    const path = window.location.pathname;
    const match = path.match(/^\/c\/([A-Za-z0-9]{5,10})$/);
    if (!match) return false;
    this.loadSharedCreature(match[1]);
    return true;
  },

  async loadSharedCreature(slug) {
    document.getElementById('hero')?.classList.add('hidden');
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('how-it-works')?.classList.add('hidden');

    const creature = await AumageDB.getCreatureBySlug(slug);
    if (!creature) {
      document.getElementById('shared-view')?.classList.remove('hidden');
      document.getElementById('shared-stats').innerHTML = '<p>Creature not found.</p>';
      return;
    }

    document.getElementById('shared-image').src = creature.image_url;

    const v = creature.visuals || {};
    const f = creature.features || {};
    let html = '';

    // Waveform fingerprint
    html += '<canvas id="shared-waveform" class="shared-waveform" width="600" height="120"></canvas>';

    // Audio player
    if (creature.audio_storage_path) {
      html += `<div class="shared-audio"><audio controls src="${creature.audio_storage_path}" preload="metadata"></audio></div>`;
    } else if (creature.audio_source === 'link' && creature.link_url) {
      html += `<div class="shared-audio-link">Created from <a href="${creature.link_url}" target="_blank" rel="noopener">${creature.link_url.length > 50 ? creature.link_url.substring(0, 50) + '...' : creature.link_url}</a></div>`;
    }

    // Audio DNA stat bars
    const traits = this.getTraitBars(f, v);
    html += '<div class="trait-bars">';
    html += '<p class="trait-bars-title">Audio DNA</p>';
    html += '<div class="trait-bars-grid">';
    traits.forEach(t => {
      const pct = Math.round(t.value * 100);
      html += `<div class="trait-bar-row" data-tooltip="${t.tip}">
        <span class="trait-bar-label">${t.name}</span>
        <div class="trait-bar-track">
          <div class="trait-bar-fill" style="width:${pct}%;background:${t.color}"></div>
        </div>
        <span class="trait-bar-pct">${pct}%</span>
      </div>`;
    });
    html += '</div></div>';

    // Trope icon overlay — inject onto image container
    const sharedCreature = document.querySelector('.shared-creature');
    const existingOverlay = sharedCreature?.querySelector('.shared-trope-overlay');
    if (existingOverlay) existingOverlay.remove();

    // Stat chips
    html += '<div class="shared-stats-grid">';
    if (v.trope) html += `<div class="stat-chip"><span class="stat-label">Trope</span><span class="stat-value">${v.trope.name}</span></div>`;
    if (v.element?.primary?.name) html += `<div class="stat-chip"><span class="stat-label">Element</span><span class="stat-value">${v.element.primary.name}</span></div>`;
    if (v.intelligence?.level) html += `<div class="stat-chip"><span class="stat-label">Intelligence</span><span class="stat-value">${v.intelligence.level}</span></div>`;
    if (v.evolution?.stage) html += `<div class="stat-chip"><span class="stat-label">Evolution</span><span class="stat-value">${v.evolution.stage}</span></div>`;
    if (v.colors?.temperature) html += `<div class="stat-chip"><span class="stat-label">Palette</span><span class="stat-value">${v.colors.temperature}</span></div>`;
    if (creature.style && creature.style !== 'realistic') html += `<div class="stat-chip"><span class="stat-label">Style</span><span class="stat-value">${creature.style}</span></div>`;
    html += '</div>';

    document.getElementById('shared-stats').innerHTML = html;
    document.getElementById('shared-view')?.classList.remove('hidden');

    // Draw waveform fingerprint
    requestAnimationFrame(() => this.drawWaveformFingerprint(f, v));

    // Init tooltips
    this.initTraitTooltips();
  },

  // ============================================================
  // TRAIT BARS — audio DNA breakdown
  // ============================================================

  getTraitBars(f, v) {
    const palette = this.getWaveformColors(v);
    return [
      {
        name: 'Complexity',
        value: f.complexity || 0,
        color: palette.primary,
        tip: 'How intricate the sound is. High complexity → more detailed creatures with elaborate features, extra limbs, and higher intelligence.'
      },
      {
        name: 'Intensity',
        value: f.intensity || 0,
        color: palette.secondary,
        tip: 'The energy and loudness of the sound. High intensity → bolder creatures with stronger elemental expression and more dramatic forms.'
      },
      {
        name: 'Harmony',
        value: f.harmonic_ratio || 0,
        color: palette.accent,
        tip: 'How musical vs percussive the sound is. High harmony → smoother, more elegant creatures. Low harmony → armored, angular, rough-textured creatures.'
      },
      {
        name: 'Warmth',
        value: f.warmth || 0,
        color: '#f59e0b',
        tip: 'The tonal warmth of the sound. High warmth → fire/earth/nature elements, warm color palettes. Low warmth → ice/storm/shadow elements, cool colors.'
      },
      {
        name: 'Roughness',
        value: f.roughness || 0,
        color: '#78716c',
        tip: 'Texture and grittiness. High roughness → scales, chitin, bark, armor plating. Low roughness → smooth skin, sleek fur, feathers, velvet.'
      },
      {
        name: 'Brightness',
        value: f.brightness || 0,
        color: '#eab308',
        tip: 'The spectral brightness of the sound. High brightness → lighter colors, luminous effects, aerial creatures. Low brightness → darker tones, deep-dwelling creatures.'
      }
    ];
  },

  initTraitTooltips() {
    document.querySelectorAll('.trait-bar-row[data-tooltip]').forEach(row => {
      // Create tooltip element
      const tip = document.createElement('div');
      tip.className = 'trait-tooltip';
      tip.textContent = row.dataset.tooltip;
      row.appendChild(tip);

      // Show on hover
      row.addEventListener('mouseenter', () => tip.classList.add('visible'));
      row.addEventListener('mouseleave', () => tip.classList.remove('visible'));

      // Show on tap (mobile)
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close any other open tooltips
        document.querySelectorAll('.trait-tooltip.visible').forEach(t => {
          if (t !== tip) t.classList.remove('visible');
        });
        tip.classList.toggle('visible');
      });
    });

    // Close tooltips on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.trait-tooltip.visible').forEach(t => t.classList.remove('visible'));
    });
  },

  // ============================================================
  // WAVEFORM FINGERPRINT — visual audio DNA on share page
  // ============================================================

  drawWaveformFingerprint(features, visuals) {
    const canvas = document.getElementById('result-waveform') || document.getElementById('shared-waveform');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 600 * dpr;
    canvas.height = 120 * dpr;
    ctx.scale(dpr, dpr);
    const w = 600;
    const h = 120;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);
    const palette = this.getWaveformColors(visuals);

    const brightness = features.brightness || 0.5;
    const warmth = features.warmth || 0.5;
    const intensity = features.intensity || 0.5;
    const roughness = features.roughness || 0.3;
    const complexity = features.complexity || 0.5;
    const harmonicRatio = features.harmonic_ratio || 0.5;
    const tempo = features.tempo || 120;
    const spectralCentroid = features.spectral_centroid_mean || 2000;

    // Background
    ctx.fillStyle = '#f8f9fc';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 12);
    ctx.fill();

    // === ZONE LABELS (embedded in waveform background) ===
    // Divide waveform into 3 trait zones with subtle labels
    const zones = [
      { label: 'HARMONY', x: w * 0.17, val: harmonicRatio },
      { label: 'COMPLEXITY', x: w * 0.5, val: complexity },
      { label: 'INTENSITY', x: w * 0.83, val: intensity }
    ];

    ctx.font = '600 8px system-ui, sans-serif';
    ctx.textAlign = 'center';
    zones.forEach(z => {
      // Zone divider line
      ctx.strokeStyle = palette.bg;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      // Label at top
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = palette.primary;
      ctx.fillText(z.label, z.x, 12);

      // Small value below label
      ctx.font = '700 9px system-ui, sans-serif';
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = palette.secondary;
      ctx.fillText(Math.round(z.val * 100) + '%', z.x, 22);
      ctx.font = '600 8px system-ui, sans-serif';
    });
    ctx.globalAlpha = 1;

    // === LAYER 1: Background wave ===
    ctx.beginPath();
    ctx.moveTo(0, cy);
    for (let x = 0; x < w; x++) {
      const t = x / w;
      const y = cy + Math.sin(t * Math.PI * 2 * (1 + warmth * 2)) * (h * 0.12 * brightness)
        + Math.sin(t * Math.PI * 4.7) * (h * 0.04);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = palette.bg;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // === LAYER 2: Main bars ===
    const numBars = Math.floor(30 + complexity * 50);
    const barWidth = (w - 40) / numBars;
    const maxBarHeight = h * 0.55;

    let seed = Math.floor(spectralCentroid * 100 + brightness * 1000);
    const seededRandom = () => { seed = (seed * 16807) % 2147483647; return (seed & 0x7fffffff) / 0x7fffffff; };

    for (let i = 0; i < numBars; i++) {
      const t = i / numBars;
      const envelope = Math.sin(t * Math.PI) * 0.7 + 0.3;
      const harmonic = Math.sin(t * Math.PI * 2 * (2 + harmonicRatio * 6)) * 0.3 * harmonicRatio;
      const noise = (seededRandom() - 0.5) * roughness * 0.6;
      const tempoPattern = Math.sin(t * Math.PI * 2 * (tempo / 60)) * 0.15;
      const barHeight = maxBarHeight * Math.max(0.05, (envelope + harmonic + noise + tempoPattern) * intensity);

      const x = 20 + i * barWidth;
      const grad = ctx.createLinearGradient(x, cy - barHeight / 2, x, cy + barHeight / 2);
      grad.addColorStop(0, palette.primary);
      grad.addColorStop(0.5, palette.secondary);
      grad.addColorStop(1, palette.primary);

      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.6 + envelope * 0.4;
      const bw = Math.max(1, barWidth - 1);
      const radius = Math.min(bw / 2, 3);
      ctx.beginPath();
      ctx.roundRect(x, cy - barHeight / 2, bw, barHeight, radius);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // === LAYER 3: Center line ===
    ctx.beginPath();
    ctx.moveTo(20, cy);
    ctx.lineTo(w - 20, cy);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // === LAYER 4: Sparkle dots for complex audio ===
    if (complexity > 0.5) {
      const dotCount = Math.floor((complexity - 0.5) * 20);
      for (let i = 0; i < dotCount; i++) {
        const x = 20 + seededRandom() * (w - 40);
        const y = cy + (seededRandom() - 0.5) * h * 0.5 * intensity;
        ctx.beginPath();
        ctx.arc(x, y, 1 + seededRandom() * 2, 0, Math.PI * 2);
        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = 0.3 + seededRandom() * 0.4;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // === LAYER 5: Bottom trait summary line ===
    ctx.font = '500 7px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#6b7280';
    const tempoLabel = tempo < 80 ? 'slow' : tempo < 120 ? 'moderate' : tempo < 160 ? 'fast' : 'frenetic';
    const summary = `${Math.round(tempo)} BPM (${tempoLabel}) · ${warmth > 0.6 ? 'warm' : warmth < 0.4 ? 'cool' : 'neutral'} tone · ${roughness > 0.5 ? 'textured' : 'smooth'} grain`;
    ctx.fillText(summary, w / 2, h - 6);
    ctx.globalAlpha = 1;
  },

  getWaveformColors(visuals) {
    const elementColors = {
      fire: { primary: '#ef4444', secondary: '#f97316', accent: '#fbbf24', bg: '#fecaca' },
      ice: { primary: '#3b82f6', secondary: '#06b6d4', accent: '#a5f3fc', bg: '#dbeafe' },
      storm: { primary: '#8b5cf6', secondary: '#6366f1', accent: '#c4b5fd', bg: '#e0e7ff' },
      earth: { primary: '#78716c', secondary: '#a16207', accent: '#d6d3d1', bg: '#f5f5f4' },
      water: { primary: '#0ea5e9', secondary: '#2dd4bf', accent: '#67e8f9', bg: '#cffafe' },
      light: { primary: '#eab308', secondary: '#f59e0b', accent: '#fde68a', bg: '#fef9c3' },
      shadow: { primary: '#4b5563', secondary: '#6b21a8', accent: '#9ca3af', bg: '#e5e7eb' },
      nature: { primary: '#22c55e', secondary: '#16a34a', accent: '#86efac', bg: '#dcfce7' },
    };
    const element = visuals?.element?.primary?.name?.toLowerCase() || 'storm';
    return elementColors[element] || elementColors.storm;
  },

  // ============================================================
  // STEP MANAGEMENT
  // ============================================================

  showStep(stepName) {
    document.querySelectorAll('.step').forEach(s => { s.classList.add('hidden'); s.classList.remove('active'); });

    const step = document.getElementById(`step-${stepName}`);
    if (step) { step.classList.remove('hidden'); step.classList.add('active'); }

    if (stepName === 'hero') {
      document.getElementById('hero').classList.remove('hidden');
      document.getElementById('app').classList.add('hidden');
      document.getElementById('how-it-works').classList.remove('hidden');
    } else {
      document.getElementById('hero').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      document.getElementById('how-it-works').classList.add('hidden');
    }

    document.getElementById('my-creatures')?.classList.add('hidden');
    document.getElementById('shared-view')?.classList.add('hidden');
    this.currentStep = stepName;
  },

  // ============================================================
  // AUDIO INPUT HANDLERS
  // ============================================================

  onAudioReady(blob, source, fileName) {
    this.audioBlob = blob;
    this.audioSource = source;
    this.audioFileName = fileName || '';
    this.selectedMode = 'creature';
    console.log(`Audio ready: ${source}, size: ${blob.size} bytes`);
    if (!this.checkCreatureGate()) return;
    this.startGeneration();
  },

  onLinkReady(url) {
    this.audioSource = 'link';
    this.linkUrl = url;
    this.selectedMode = 'creature';
    console.log(`Link ready: ${url}`);
    if (!this.checkCreatureGate()) return;
    this.startGeneration();
  },

  // Gate: 1 free creature for anonymous users, then require login
  checkCreatureGate() {
    // Logged in = always allowed
    if (window.AumageDB?.user) return true;

    // Check anonymous creation count
    const count = parseInt(localStorage.getItem('aumage_anon_creates') || '0');
    if (count >= 1) {
      this.showLoginPrompt();
      return false;
    }

    // Increment anonymous count
    localStorage.setItem('aumage_anon_creates', (count + 1).toString());
    return true;
  },

  showLoginPrompt() {
    // Show a prompt over the input area
    const existing = document.getElementById('login-gate');
    if (existing) existing.remove();

    const gate = document.createElement('div');
    gate.id = 'login-gate';
    gate.className = 'login-gate';
    gate.innerHTML = `
      <div class="login-gate-content">
        <h3>Sign in to create more creatures</h3>
        <p>You've used your free creation. Sign in with your email to keep making creatures — it takes 10 seconds.</p>
        <form id="gate-email-form" class="gate-form">
          <input type="email" id="gate-email-input" placeholder="your@email.com" class="auth-input" required>
          <button type="submit" class="btn btn-primary">Send Magic Link</button>
        </form>
        <p id="gate-message" class="auth-message hidden"></p>
      </div>
    `;
    document.getElementById('app')?.appendChild(gate);

    gate.querySelector('#gate-email-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = gate.querySelector('#gate-email-input').value.trim();
      if (!email) return;
      const msg = gate.querySelector('#gate-message');
      try {
        await AumageDB.signInWithEmail(email);
        msg.textContent = 'Check your email for the login link!';
        msg.classList.remove('hidden');
      } catch (err) {
        msg.textContent = 'Error: ' + err.message;
        msg.classList.remove('hidden');
      }
    });
  },

  // ============================================================
  // GENERATION
  // ============================================================

  async startGeneration() {
    // Clear any stale share slug to prevent auth redirect loop
    localStorage.removeItem('aumage_creature_state');
    this.showStep('generate');
    this.augmentCount = 0;
    this.originalCreatureUrl = null;
    this.lastAugmentStyle = null;
    this.selectedStyle = 'realistic';
    this.lastCreatureRecord = null;
    this.styleShuffleCount = 0;
    this._currentStylePicks = null;
    this._forceNewPicks = false;
    this._sketchPromise = null;
    if (window.AumageSketchLayout) AumageSketchLayout.reset();

    try {
      this.updateProgress('Analyzing audio characteristics...');
      const features = await AumageExtractor.extract(this.audioBlob);

      this.updateProgress('Extracting sonic fingerprint...');
      const fingerprint = await AumagePrompt.generateFingerprint(features);
      const seed = AumagePrompt.fingerprintToSeed(fingerprint);

      this.updateProgress('Mapping frequencies to creature...');
      const sourceHint = this.linkUrl || this.audioFileName || '';
      const visuals = AumageMapping.mapToVisuals(features, this.selectedMode, sourceHint);

      this.lastVisuals = visuals;
      this.lastFeatures = features;
      this.lastSeed = seed;
      this.lastFingerprint = fingerprint;

      this.updateProgress('Rendering your creature...');
      const payload = this.buildPipelinePayload(visuals, features, fingerprint);
      payload.cardStyle = this.cardStyle || 'tween';

      // Attach server-authoritative signal if extraction succeeded
      if (features._serverExtracted && features._serverSignal && features._serverSignature) {
        payload.signal = features._serverSignal;
        payload.signature = features._serverSignature;
        console.log('[Aumage] Stage A → (signed signal)', payload.morphology, '|', payload.cardStyle, '|', payload.rarity, '|', payload.audiotropeType);
      } else {
        console.log('[Aumage] Stage A → (client fallback)', payload.morphology, '|', payload.cardStyle, '|', payload.rarity, '|', payload.audiotropeType);
      }

      const session = await window.AumageDB?.supabase?.auth?.getSession();
      const token = session?.data?.session?.access_token;

      const response = await fetch(this.PIPELINE_URL + '/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.error) throw new Error(result.message || result.error);

      // Convert creature URL to proxied URL (avoids B2 CORS / missing CDN DNS)
      const rawUrl = result.creature_url || result.card_url || '';
      // Extract creature path from any known URL format:
      //   https://f005.backblazeb2.com/file/aumage-cards/creatures/...
      //   https://s3.us-east-005.backblazeb2.com/aumage-cards/creatures/...
      //   https://cards.aumage.ai/creatures/...
      const b2Match = rawUrl.match(/aumage-cards\/(.+)$/)
        || rawUrl.match(/cards\.aumage\.ai\/(.+)$/);
      const creatureUrl = b2Match
        ? this.PIPELINE_URL + '/api/image/' + b2Match[1]
        : rawUrl;

      // Store Stage A result for Stage B
      this.stageAResult = {
        creature_id: result.creature_id,
        creature_url: creatureUrl,
        rarity: result.rarity,
        morphology: result.morphology,
        audiotrope_type: result.audiotrope_type || result.trope || payload.trope,
        gen_type: result.gen_type || result.origen || payload.origen || 'Resogen',
        traits: result.traits || [],
        stats: result.stats || {},
        flavor_text: result.flavor_text || '',
        suggested_name: result.suggested_name || '',
        season: result.season || 'spring',
        labels: result.labels || [],
        catalog_id: result.creature_id,
        metadata: {
          base_rarity: result.rarity,
          morphology: result.morphology,
          element: result.audiotrope_type || payload.audiotropeType,
        },
        audio: result.audio || payload.audio,
        engine: payload.engine,
      };

      console.log('[Aumage] Stage A ✓', result.rarity, '|', creatureUrl.slice(-30));

      // Log the full image prompt for debugging
      if (result._debug) {
        console.log('═══ IMAGE PROMPT ═══');
        console.log(result._debug.imagePrompt);
        console.log('═══ DR. KAI DESCRIPTION ═══');
        console.log(result._debug.drKaiDescription);
        console.log('═══ DEBUG ═══', JSON.stringify({
          cardStyle: result._debug.cardStyle,
          trope: result._debug.trope,
          rarity: result._debug.rarity,
          morphology: result._debug.morphology,
          promptLength: result._debug.promptLength,
        }));
      }

      // Auto-finalize with suggested name — no naming step
      const sa = this.stageAResult;
      const rawName = sa.suggested_name || '';
      // Filter: name can't be a taxonomy term (Origen, Trope, Rarity)
      var badNames = ['UNKNOWN', 'RESOGEN', 'PRIMOGEN', 'IMAGEN', 'KINOGEN', 'SYNTHOGEN',
        'TERRATROPE', 'AQUATROPE', 'AEROTROPE', 'PYROTROPE', 'FLORATROPE', 'PRISMATROPE',
        'ABUNDANT', 'ENDEMIC', 'HOLOTYPE', ''];
      var nameUpper = rawName.toUpperCase();
      var isValidName = rawName && badNames.indexOf(nameUpper) === -1;
      const creatureName = isValidName ? rawName : (sa.morphology || 'Unnamed Creature');
      console.log('[Aumage] Name:', creatureName, '| Raw:', rawName, '| Valid:', isValidName);
      this.imageUrl = sa.creature_url;
      await this._finalizeWithName(creatureName);

    } catch (error) {
      console.error('Stage A failed:', error);
      this.updateProgress('Something went wrong. Please try again.');
    }
  },

  // ============================================================
  // NAMING STEP — User names their creature
  // ============================================================

  showNamingStep(creatureUrl, metadata, suggestedName) {
    this.showStep('naming');

    const creatureImg = document.getElementById('naming-creature-img');
    const morphName = document.getElementById('naming-morph-name');
    const rarityBadge = document.getElementById('naming-rarity');
    const elementBadge = document.getElementById('naming-element');
    const nameInput = document.getElementById('creature-name-input');

    if (creatureImg) creatureImg.src = creatureUrl;
    if (morphName) morphName.textContent = metadata?.morphology || 'Unknown Creature';
    if (rarityBadge) {
      rarityBadge.textContent = metadata?.base_rarity || 'common';
      rarityBadge.className = 'rarity-badge rarity-' + (metadata?.base_rarity || 'common');
    }
    if (elementBadge) elementBadge.textContent = metadata?.element || '';
    if (nameInput) {
      nameInput.value = suggestedName || '';
      nameInput.focus();
    }

    this.imageUrl = creatureUrl;
  },

  async _finalizeWithName(creatureName) {
    if (!this.stageAResult) {
      console.error('No Stage A result — cannot compose card');
      return;
    }

    this.showStep('generate');
    this.updateProgress('Forging your Schematic Card...');

    try {
      const sa = this.stageAResult;
      const f = this.lastFeatures || {};
      const v = this.lastVisuals || {};

      // Build full card data for Canvas compositor
      const cardData = {
        name: creatureName,
        creatureUrl: sa.creature_url,
        gen: sa.gen_type || sa.origen || 'Resogen',
        trope: sa.audiotrope_type || sa.trope || 'Terratrope',
        rarity: sa.rarity || 'Abundant',
        species: sa.morphology || 'Unknown',
        element: v.element?.primary?.name || 'storm',
        personality: v.intelligence?.level || 'reactive',
        origin: v.creatureDomain?.desc || sa.season || 'Unknown',
        stats: sa.stats || { power: 50, agility: 50, defense: 50, arcana: 50 },
        flavorText: sa.flavor_text || '',
        specimenId: sa.creature_id || sa.catalog_id || 'SPEC-000',
        geneSequence: this._generateGeneSequence(this.lastFingerprint),
        labels: sa.labels || [],
        hertzNumber: Math.floor((f.harmonic_ratio || 0.5) * 14) || 7,
        hertzValue: parseFloat(((f.brightness || 0.5) * 0.25).toFixed(3)),
        cardStyle: this.cardStyle || 'tween',
      };

      this.lastPipelineResult = {
        suggested_name: creatureName,
        rarity: sa.rarity || 'Abundant',
        audiotrope_type: sa.audiotrope_type || 'Resotrope',
        metadata: { ...sa.metadata, creature_name: creatureName }
      };

      console.log('[Aumage] Stage B → Canvas compositor with full card data');

      this.saveCreatureToDb(sa.creature_url, null, this.lastFeatures, this.lastVisuals, this.lastFingerprint, this.lastSeed, 'pipeline:' + creatureName);

      // Pass cardData through to Canvas compositor
      this.startReveal(sa.creature_url, null, cardData);

    } catch (error) {
      console.error('Stage B failed:', error);
      this.updateProgress('Card composition failed. Please try again.');
      setTimeout(() => this.showStep('input'), 2500);
    }
  },

  // Legacy — kept for any external callers but now delegates to _finalizeWithName
  async finalizeCard() {
    const creatureName = this.stageAResult?.suggested_name || this.stageAResult?.morphology || 'Unknown Creature';
    await this._finalizeWithName(creatureName);
  },

  /**
   * Generate a pseudo-DNA gene sequence from the audio fingerprint.
   * Decorative for now — Phase 2 will encode hidden data.
   */
  _generateGeneSequence(fingerprint) {
    const bases = ['A', 'C', 'G', 'T'];
    const fp = fingerprint || ('web-' + Date.now().toString(36));
    let seq = '';
    for (let i = 0; i < 30; i++) {
      const charCode = fp.charCodeAt(i % fp.length) || 0;
      seq += bases[(charCode + i) % 4];
      if (i === 9 || i === 19) seq += '-';
    }
    return seq;
  },

  async saveCreatureToDb(imageUrl, videoUrl, features, visuals, fingerprint, seed, promptText) {
    if (!window.AumageDB) return;
    try {
      // Upload audio if we have a blob (not for link sources)
      let audioStoragePath = null;
      if (this.audioBlob && this.audioSource !== 'link') {
        const ext = this.audioBlob.type?.includes('wav') ? 'wav' : this.audioBlob.type?.includes('ogg') ? 'ogg' : 'mp3';
        const filename = `${fingerprint.substring(0, 12)}-${Date.now()}.${ext}`;
        audioStoragePath = await AumageDB.uploadAudio(this.audioBlob, filename);
        if (audioStoragePath) console.log('Audio uploaded:', audioStoragePath);
      }

      const record = await AumageDB.saveCreature({
        imageUrl, videoUrl,
        audioSource: this.audioSource,
        audioStoragePath,
        linkUrl: this.linkUrl || null,
        fingerprint, seed,
        mode: this.selectedMode,
        style: this.selectedStyle,
        features, visuals, promptText
      });
      if (record) {
        this.lastCreatureRecord = record;
        console.log('Creature saved, slug:', record.share_slug);
        // saveCreatureState removed — was causing redirect to share URL after generation
      }
    } catch (err) {
      console.error('Save failed (non-blocking):', err);
    }
  },

  updateProgress(message) {
    const el = document.querySelector('.progress-text');
    if (el) el.textContent = message;
  },

  // ============================================================
  // REVEAL
  // ============================================================

  startReveal(imageUrl, videoUrl, cardData) {
    // Skip reveal animation — go straight to result
    this.showResult(imageUrl, videoUrl, cardData);
  },

  async showResult(imageUrl, videoUrl, cardData) {
    if (this._revealTimeout) { clearTimeout(this._revealTimeout); this._revealTimeout = null; }
    console.log('[showResult] fired with imageUrl:', imageUrl?.slice(0, 60));
    document.getElementById('app')?.classList.remove('hidden');
    this.showStep('result');
    this.imageUrl = imageUrl;
    this.videoUrl = videoUrl;
    document.getElementById('share-confirmation')?.classList.add('hidden');

    const card = document.getElementById('result-card');
    const d = cardData || {};
    const f = this.lastFeatures || {};
    const v = this.lastVisuals || {};

    // Ensure creatureUrl is set for compositor
    if (!d.creatureUrl && imageUrl) d.creatureUrl = imageUrl;

    // ── Use Canvas Compositor if available ──
    if (window.AumageCard && d.creatureUrl) {
      try {
        console.log('[Card] Rendering via AumageCard compositor');
        const cardCanvas = await AumageCard.render(d);
        this._cardCanvas = cardCanvas;

        card.innerHTML = `
          <div style="max-width:620px;margin:0 auto;">
            <div id="card-canvas-container" style="text-align:center;margin-bottom:24px;"></div>
            <div style="border-top:1px solid #334155;padding-top:20px;">
              <div style="font-size:18px;font-weight:700;color:#64748b;letter-spacing:0.12em;text-align:center;margin-bottom:16px;">AUDIO DNA</div>
              <canvas id="result-waveform" width="620" height="120" style="width:100%;border-radius:8px;"></canvas>
              <div id="result-trait-bars" style="margin-top:16px;"></div>
            </div>
          </div>
          <img id="result-image" src="${imageUrl}" alt="" style="display:none;">
        `;

        // Insert the rendered card canvas
        const container = document.getElementById('card-canvas-container');
        if (container) container.appendChild(cardCanvas);

      } catch (err) {
        console.error('[Card] Compositor failed, falling back to HTML:', err);
        this._renderFallbackCard(card, imageUrl, cardData);
      }
    } else {
      // Fallback if compositor not available
      this._renderFallbackCard(card, imageUrl, cardData);
    }

    // Draw waveform fingerprint
    requestAnimationFrame(() => {
      this.drawWaveformFingerprint(f, v);
    });

    // Draw trait bars
    const traitContainer = document.getElementById('result-trait-bars');
    if (traitContainer) {
      const traits = this.getTraitBars(f, v);
      let barsHtml = '<div style="display:grid;gap:10px;">';
      traits.forEach(t => {
        const pct = Math.round(t.value * 100);
        barsHtml += `
          <div style="display:flex;align-items:center;gap:10px;" data-tooltip="${t.tip}">
            <span style="font-size:15px;font-weight:700;color:#64748b;letter-spacing:0.08em;width:120px;text-align:right;">${t.name.toUpperCase()}</span>
            <div style="flex:1;height:8px;background:#1e293b;border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${t.color};border-radius:3px;"></div>
            </div>
            <span style="font-size:15px;color:#94a3b8;width:45px;">${pct}%</span>
          </div>`;
      });
      barsHtml += '</div>';
      traitContainer.innerHTML = barsHtml;
      this.initTraitTooltips();
    }

    // Store ref for download
    if (!this._cardCanvas) this._cardCanvas = null;
  },

  _renderFallbackCard(card, imageUrl, cardData) {
    // Same as showResult without cardData — just show the image
    const name = (cardData?.name || 'Unknown Creature').toUpperCase();
    card.innerHTML = `
      <div style="text-align:center;">
        <img src="${imageUrl}" alt="${name}" style="max-width:100%;border-radius:12px;">
        <div style="margin-top:12px;font-size:24px;font-weight:700;color:#8b9ead;">${name}</div>
      </div>
    `;
  },

  showAugmentations() {
    const section = document.getElementById('augmentation-section');
    if (section) section.classList.add('hidden');
    // Augmentation (Dark Fantasy, Cyberpunk, etc.) temporarily disabled
    // while generation routes through pipeline. Phase 2 feature.
  },

  async augmentCreature(styleKey) {
    if (this.augmentCount >= 2) return;
    this.augmentCount++;
    this.selectedStyle = styleKey;
    this.lastAugmentStyle = styleKey;
    if (!this.originalCreatureUrl) this.originalCreatureUrl = this.imageUrl;

    // Reset shuffle count for next augmentation round
    this.styleShuffleCount = 0;
    this._currentStylePicks = null;

    const styleLabel = AumagePrompt.STYLE_LABELS[styleKey];
    const augmentPrompt = AumagePrompt.buildAugmentPrompt(styleKey, this.lastVisuals?.trope?.key);
    const isDarkStyle = styleKey === 'darkfantasy' || styleKey === 'cyberpunk';
    const augmentStrength = isDarkStyle ? 0.45 : 0.65;

    this.showStep('generate');
    this.updateProgress(`Augmenting into ${styleLabel} style...`);

    try {
      const response = await fetch('https://aumage-api.admin-it-e6e.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: augmentPrompt, image_url: this.originalCreatureUrl, strength: augmentStrength, mode: this.selectedMode, fingerprint: this.lastFingerprint, source: this.audioSource })
      });
      const result = await response.json();
      if (result.error) throw new Error(JSON.stringify(result));

      // Save augmented image to DB
      this.updateCreatureImage(result.image_url, result.video_url, styleKey);

      this.startReveal(result.image_url, result.video_url);
    } catch (error) {
      console.error('Augmentation failed:', error);
      this.augmentCount--;
      this.updateProgress('Augmentation failed. Try again.');
      setTimeout(() => this.showStep('result'), 1500);
    }
  },

  async reshuffleAugment() {
    if (!this.lastAugmentStyle || !this.originalCreatureUrl) return;
    const styleKey = this.lastAugmentStyle;
    const styleLabel = AumagePrompt.STYLE_LABELS[styleKey];
    const augmentPrompt = AumagePrompt.buildAugmentPrompt(styleKey, this.lastVisuals?.trope?.key);
    const isDarkStyle = styleKey === 'darkfantasy' || styleKey === 'cyberpunk';
    const augmentStrength = isDarkStyle ? 0.45 : 0.65;

    this.showStep('generate');
    this.updateProgress(`Reshuffling ${styleLabel} style...`);

    try {
      const response = await fetch('https://aumage-api.admin-it-e6e.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: augmentPrompt, image_url: this.originalCreatureUrl, strength: augmentStrength, mode: this.selectedMode, fingerprint: this.lastFingerprint, source: this.audioSource })
      });
      const result = await response.json();
      if (result.error) throw new Error(JSON.stringify(result));

      // Save reshuffled image to DB
      this.updateCreatureImage(result.image_url, result.video_url, styleKey);

      this.startReveal(result.image_url, result.video_url);
    } catch (error) {
      console.error('Reshuffle failed:', error);
      this.updateProgress('Reshuffle failed. Try again.');
      setTimeout(() => this.showStep('result'), 1500);
    }
  },

  // Update creature record with new augmented/reshuffled image
  async updateCreatureImage(imageUrl, videoUrl, styleKey) {
    if (!window.AumageDB || !this.lastCreatureRecord?.id) return;
    try {
      const updated = await AumageDB.updateCreature(this.lastCreatureRecord.id, {
        image_url: imageUrl,
        video_url: videoUrl || null,
        style: styleKey
      });
      if (updated) {
        this.lastCreatureRecord = updated;
        console.log('Creature image updated, style:', styleKey);
      }
    } catch (err) {
      console.error('Image update failed (non-blocking):', err);
    }
  },

  // ============================================================
  // SHARE
  // ============================================================

  async shareCreature() {
    const conf = document.getElementById('share-confirmation');

    if (!this.lastCreatureRecord?.share_slug) {
      conf.textContent = 'Saving creature...';
      conf.classList.remove('hidden');
      await new Promise(r => setTimeout(r, 1500));
    }

    if (!this.lastCreatureRecord?.share_slug) {
      conf.textContent = 'Could not save creature. Try again.';
      conf.classList.remove('hidden');
      return;
    }

    const url = AumageDB.getShareUrl(this.lastCreatureRecord.share_slug);

    // Save state in case share triggers auth redirect (magic link return)
    AumageDB.saveCreatureState(this.lastCreatureRecord.share_slug);

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Aumage Creature', text: 'Check out this creature I made from sound!', url });
        conf.textContent = 'Shared!';
        conf.classList.remove('hidden');
        return;
      } catch (e) { /* fall through */ }
    }

    // Desktop: show share popup
    showSharePopup(url, 'Check out this creature I made from sound!', document.getElementById('btn-share'));
  },

  // ============================================================
  // GALLERY
  // ============================================================

  // ============================================================
  // COLLECTION SIDEBAR
  // ============================================================

  toggleSidebar() {
    const sidebar = document.getElementById('collection-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar.classList.contains('hidden')) {
      sidebar.classList.remove('hidden');
      overlay.classList.remove('hidden');
      setTimeout(() => sidebar.classList.add('open'), 10);
      this.loadCollection();
    } else {
      this.closeSidebar();
    }
  },

  closeSidebar() {
    const sidebar = document.getElementById('collection-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.remove('open');
    overlay.classList.add('hidden');
    setTimeout(() => sidebar.classList.add('hidden'), 250);
  },

  async loadCollection() {
    const container = document.getElementById('sidebar-tropes');
    container.innerHTML = '<p class="sidebar-loading">Loading collection...</p>';

    const creatures = await AumageDB.getMyCreatures();
    const folders = await AumageDB.getFolders();

    if (!creatures.length) {
      container.innerHTML = '<p class="sidebar-empty">No creatures yet. Go make some noise!</p>';
      return;
    }

    // Group creatures by trope — locked 6-trope taxonomy
    const tropeOrder = ['Terratrope', 'Aquatrope', 'Aerotrope', 'Pyrotrope', 'Floratrope', 'Prismatrope'];
    const tropeGroups = {};
    tropeOrder.forEach(t => tropeGroups[t] = []);
    // Also accept lowercase keys for legacy creatures
    tropeOrder.forEach(t => tropeGroups[t.toLowerCase()] = tropeGroups[t]);
    const unclassified = [];

    creatures.forEach(c => {
      const tropeKey = c.visuals?.trope?.key || c.trope || '';
      // Try exact match first, then lowercase
      if (tropeKey && tropeGroups[tropeKey]) {
        tropeGroups[tropeKey].push(c);
      } else if (tropeKey && tropeGroups[tropeKey.toLowerCase()]) {
        tropeGroups[tropeKey.toLowerCase()].push(c);
      } else {
        unclassified.push(c);
      }
    });

    const tropeData = AumageMapping._getTropeData();
    let html = '';

    tropeOrder.forEach(tropeKey => {
      const group = tropeGroups[tropeKey];
      // Try multiple key formats for tropeData lookup
      const t = tropeData[tropeKey] || tropeData[tropeKey.toLowerCase()] || { name: tropeKey, tagline: '' };
      const count = group.length;
      const troFolders = folders.filter(f => f.trope === tropeKey);

      html += `<div class="sidebar-trope-section" data-trope="${tropeKey}">
        <button class="sidebar-trope-header trope-${tropeKey}" data-trope="${tropeKey}">
          <span class="sidebar-trope-name">${t.name}</span>
          <span class="sidebar-trope-count">${count}</span>
          <span class="sidebar-chevron">›</span>
        </button>
        <div class="sidebar-trope-content hidden" id="trope-content-${tropeKey}">`;

      // Folder creation button
      html += `<button class="sidebar-add-folder" data-trope="${tropeKey}">+ New Folder</button>`;

      // Folders
      troFolders.forEach(folder => {
        const folderCreatures = group.filter(c => c.folder_id === folder.id);
        html += `<div class="sidebar-folder" data-folder-id="${folder.id}">
          <div class="sidebar-folder-header">
            <span class="sidebar-folder-name">📁 ${folder.name}</span>
            <span class="sidebar-folder-count">${folderCreatures.length}</span>
          </div>
          <div class="sidebar-folder-creatures">`;
        folderCreatures.forEach(c => { html += this._renderSidebarCreature(c); });
        html += `</div></div>`;
      });

      // Unfiled creatures in this trope
      const unfiled = group.filter(c => !c.folder_id);
      unfiled.forEach(c => { html += this._renderSidebarCreature(c); });

      html += `</div></div>`;
    });

    // Unclassified (pre-trope creatures)
    if (unclassified.length) {
      html += `<div class="sidebar-trope-section">
        <button class="sidebar-trope-header">
          <span class="sidebar-trope-icon-emoji">❓</span>
          <span class="sidebar-trope-name">Unclassified</span>
          <span class="sidebar-trope-count">${unclassified.length}</span>
          <span class="sidebar-chevron">›</span>
        </button>
        <div class="sidebar-trope-content hidden" id="trope-content-unclassified">`;
      unclassified.forEach(c => { html += this._renderSidebarCreature(c); });
      html += `</div></div>`;
    }

    container.innerHTML = html;

    // Bind trope header toggles
    container.querySelectorAll('.sidebar-trope-header').forEach(header => {
      header.addEventListener('click', () => {
        const trope = header.dataset.trope || 'unclassified';
        const content = document.getElementById(`trope-content-${trope}`);
        if (content) {
          content.classList.toggle('hidden');
          header.classList.toggle('expanded');
        }
      });
    });

    // Bind creature clicks
    container.querySelectorAll('.sidebar-creature').forEach(el => {
      el.addEventListener('click', () => {
        const slug = el.dataset.slug;
        if (slug) {
          this.closeSidebar();
          window.location.href = `/c/${slug}`;
        }
      });
    });

    // Bind folder creation
    container.querySelectorAll('.sidebar-add-folder').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const trope = btn.dataset.trope;
        const name = prompt('Folder name:');
        if (!name) return;
        await AumageDB.createFolder(name, trope);
        this.loadCollection(); // Refresh
      });
    });
  },

  _renderSidebarCreature(c) {
    return `<div class="sidebar-creature" data-slug="${c.share_slug}" data-id="${c.id}">
      <img src="${c.image_url}" alt="Creature" class="sidebar-creature-img" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%230c3345%22 width=%2240%22 height=%2240%22/><text x=%2220%22 y=%2224%22 text-anchor=%22middle%22 fill=%22%232a9db5%22 font-size=%2216%22>?</text></svg>'; this.onerror=null;">
      <div class="sidebar-creature-info">
        <span class="sidebar-creature-element">${c.visuals?.element?.primary?.name || '—'}</span>
        <span class="sidebar-creature-intel">${c.visuals?.intelligence?.level || ''}</span>
      </div>
    </div>`;
  },

  // ============================================================
  // DOWNLOAD
  // ============================================================

  downloadImage() {
    // If we have a rendered card canvas, export the full card as PNG
    if (this._cardCanvas) {
      try {
        const dataUrl = this._cardCanvas.toDataURL('image/png');
        const meta = this.lastPipelineResult?.metadata || {};
        const name = (meta.creature_name || 'aumage-creature').toLowerCase().replace(/\s+/g, '-');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${name}-card-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log('[Aumage] Card PNG exported from canvas');
        return;
      } catch (e) {
        console.warn('Canvas export failed, falling back to image download:', e);
      }
    }

    // Fallback: download raw creature image
    if (!this.imageUrl) return;
    const meta = this.lastPipelineResult?.metadata || {};
    const name = (meta.creature_name || 'aumage-creature').toLowerCase().replace(/\s+/g, '-');
    const filename = `${name}-${Date.now()}.png`;

    fetch(this.imageUrl)
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        window.open(this.imageUrl, '_blank');
      });
  },

  downloadVideo() {
    if (!this.videoUrl) return;
    const a = document.createElement('a');
    a.href = this.videoUrl; a.download = `aumage-creature-${Date.now()}.mp4`; a.click();
  },

  // ============================================================
  // RESET
  // ============================================================

  reset() {
    this.audioBlob = null;
    this.audioSource = null;
    this.selectedMode = 'creature';
    this.generationId = null;
    this.imageUrl = null;
    this.videoUrl = null;
    this.lastCreatureRecord = null;
    this.showStep('input');
  }
};

// ============================================================
// SHARE POPUP (desktop fallback when native share unavailable)
// ============================================================

function showSharePopup(url, text, anchorEl) {
  // Remove any existing popup
  document.getElementById('share-popup')?.remove();

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const popup = document.createElement('div');
  popup.id = 'share-popup';
  popup.className = 'share-popup';
  popup.innerHTML = `
    <div class="share-popup-backdrop"></div>
    <div class="share-popup-content">
      <h3>Share Your Creature</h3>
      <div class="share-popup-options">
        <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" target="_blank" rel="noopener" class="share-option">
          <span class="share-option-icon">𝕏</span>
          <span>X / Twitter</span>
        </a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener" class="share-option">
          <span class="share-option-icon">f</span>
          <span>Facebook</span>
        </a>
        <a href="https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}" target="_blank" rel="noopener" class="share-option">
          <span class="share-option-icon">W</span>
          <span>WhatsApp</span>
        </a>
        <a href="mailto:?subject=Check%20out%20my%20Aumage%20creature&body=${encodedText}%20${encodedUrl}" class="share-option">
          <span class="share-option-icon">✉</span>
          <span>Email</span>
        </a>
        <button class="share-option" id="share-copy-link">
          <span class="share-option-icon">🔗</span>
          <span>Copy Link</span>
        </button>
      </div>
      <button class="share-popup-close btn btn-sm btn-outline">Close</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Copy link handler
  popup.querySelector('#share-copy-link').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url);
      popup.querySelector('#share-copy-link span:last-child').textContent = 'Copied!';
      setTimeout(() => popup.remove(), 1000);
    } catch {
      prompt('Copy this link:', url);
    }
  });

  // Close handlers
  popup.querySelector('.share-popup-close').addEventListener('click', () => popup.remove());
  popup.querySelector('.share-popup-backdrop').addEventListener('click', () => popup.remove());
}

document.addEventListener('DOMContentLoaded', () => Aumage.init());
