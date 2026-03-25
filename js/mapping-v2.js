// ============================================================
// AUMAGE MAPPING v2 — Drop-in replacement for mapping.js
// Requires: morphologies.js, coloration.js, engine-core.js, engine-prompts.js
//
// This file replaces the old AumageMapping object AND overrides
// AumagePrompt._buildCreature so app.js needs ZERO changes.
//
// Load order in index.html:
//   1. morphologies.js
//   2. coloration.js
//   3. engine-core.js
//   4. engine-prompts.js
//   5. mapping-v2.js  (this file — replaces mapping.js)
//   6. prompts.js     (kept for landscape/abstract — creature override below)
//   7. app.js         (unchanged)
// ============================================================

const AumageMapping = {

  // Cache the last engine config for debug / metadata
  _lastConfig: null,

  // ==========================================================
  // mapToVisuals — SAME INTERFACE as old mapping.js
  // app.js calls: const visuals = AumageMapping.mapToVisuals(features, mode)
  // ==========================================================
  mapToVisuals(features, mode, sourceHint) {
    // sourceHint: filename or URL passed from app.js for future keyword override
    if (sourceHint) console.log('[Engine] Source hint:', sourceHint);

    // Run the new engine for creature mode
    const evolution = AumageEngine.mapEvolution(features);
    const intelligence = AumageEngine.mapIntelligence(features);
    const element = AumageEngine.mapElement(features);
    const domain = AumageEngine.mapDomain(features);
    const palette = AumageEngine.selectPalette(features);

    // Roll for mutation and select morphology
    const { primary, secondary, mutation } = AumageEngine.rollMutation(
      evolution, intelligence, domain, features
    );

    // Select color pattern
    const complexity = features.complexity || 0.3;
    const pattern = AumageEngine.selectPattern(primary.morph, complexity, intelligence, features);

    // Determine framing
    const framingKey = primary.morph.framing || 'standard';
    const framing = AumageColoration.FRAMING[framingKey] || AumageColoration.FRAMING.standard;

    // Store full config for prompt builder
    const config = {
      primary,
      secondary,
      mutation,
      evolution,
      intelligence,
      element,
      domain,
      palette,
      pattern,
      framing
    };
    this._lastConfig = config;

    // Debug logging
    console.log('=== CREATURE ENGINE v2 ===');
    console.log(AumagePromptBuilder.debugSummary(config));
    if (mutation) {
      console.log(`🧬 MUTATION TIER ${mutation.tier}: ${mutation.primaryId} + ${mutation.secondaryId} [${mutation.splicedFeature}]`);
    }

    // Classify creature into a trope based on element affinity
    const trope = this._classifyTrope(element, domain, features);

    // Return visuals object that's compatible with old prompts.js
    // Landscape and abstract modes still use old color/form/texture mappings
    // Creature mode uses the new engine (handled via _buildCreature override)
    return {
      _pitchClass: features.dominant_pitch_class || 0,
      _engineConfig: config,
      // Exposed for sketch-prompts.js (needs morph desc + palette + element)
      primary: primary,
      palette: palette,
      trope: trope,
      // Legacy fields for landscape/abstract modes (simplified from old mapping)
      colors: this._legacyColors(features, palette),
      form: this._legacyForm(features),
      texture: this._legacyTexture(features),
      atmosphere: this._legacyAtmosphere(features),
      // New engine fields
      creatureDomain: { desc: `A ${domain}-domain creature`, body: '' },
      evolution: evolution,
      intelligence: intelligence,
      element: element
    };
  },

  // ==========================================================
  // TROPE DATA — used by collection sidebar to display trope names
  // ==========================================================
  _getTropeData() {
    return {
      terratrope:  { name: 'Terratrope',  tagline: 'Grounded in earth and stone' },
      aquatrope:   { name: 'Aquatrope',   tagline: 'Shaped by flow and fluidity' },
      aerotrope:   { name: 'Aerotrope',   tagline: 'Carried on breath and wind' },
      pyrotrope:   { name: 'Pyrotrope',   tagline: 'Forged in heat and intensity' },
      floratrope:  { name: 'Floratrope',  tagline: 'Rooted in the living and organic' },
      prismatrope: { name: 'Prismatrope', tagline: 'Crystallized in light and frost' }
    };
  },

  /**
   * Classify creature into a trope based on element affinity + audio character.
   * Element is the primary signal. Ties broken by domain/features.
   */
  _classifyTrope(element, domain, features) {
    const tropeData = this._getTropeData();

    // DIRECT AUDIO → TROPE SELECTION
    // Independent of element. Each trope has its own audio signature.
    const w = features.warmth || 0.5;
    const b = features.brightness || 0.5;
    const i = features.intensity || 0.5;
    const r = features.roughness || 0.3;
    const h = features.harmonic_ratio || 0.5;
    const c = features.complexity || 0.3;

    // Score each trope — rebalanced so typical audio spreads across all 6
    // Problem was floratrope winning for most normal audio (warm + harmonic + calm)
    // Fix: raise floratrope thresholds, give other tropes more competitive default-range scoring
    const scores = {
      terratrope:  (r * 0.3) + ((1 - b) * 0.25) + (i * 0.25) + ((1 - h) * 0.2),       // rough, dark, intense, dissonant → earth
      aquatrope:   (h * 0.3) + ((1 - r) * 0.2) + ((1 - i) * 0.2) + (b * 0.15) + (c * 0.15),  // harmonic, smooth, calm, bright → water
      aerotrope:   (b * 0.3) + ((1 - w) * 0.25) + ((1 - r) * 0.25) + (h * 0.2),        // bright, cool, smooth, harmonic → air
      pyrotrope:   (i * 0.35) + (r * 0.25) + (w * 0.2) + ((1 - h) * 0.2),              // intense, rough, warm, dissonant → fire
      floratrope:  (w > 0.6 ? w * 0.3 : 0) + (h > 0.6 ? h * 0.25 : 0) + (c > 0.4 ? c * 0.25 : 0) + ((1 - i) * 0.2),  // ONLY triggers when warmth AND harmony are BOTH high
      prismatrope: ((1 - w) * 0.3) + (b * 0.25) + ((1 - r) * 0.25) + ((1 - i) * 0.2),  // cold, bright, smooth, calm → crystal
    };

    // Find the winning trope
    let bestKey = 'terratrope';
    let bestScore = 0;
    for (const [key, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestKey = key;
        bestScore = score;
      }
    }

    const t = tropeData[bestKey];
    return { key: bestKey, name: t.name, tagline: t.tagline };
  },

  // ==========================================================
  // LEGACY MAPPINGS — simplified versions for landscape/abstract
  // These keep AumagePrompt._buildLandscape and _buildAbstract working
  // ==========================================================

  _legacyColors(features, palette) {
    const f = features;
    const warmth = f.warmth || 0.5;
    const brightness = f.brightness || 0.5;
    const complexity = f.complexity || 0.3;

    return {
      baseHues: [palette.base, palette.second],
      accent: palette.accent,
      secondaryAccent: palette.detail,
      saturation: complexity > 0.6 ? 'highly saturated' : complexity > 0.3 ? 'moderately saturated' : 'muted and desaturated',
      temperature: palette.temp === 'warm' ? 'warm' : palette.temp === 'cool' ? 'cool' : 'neutral',
      luminosity: brightness > 0.6 ? 'bright and luminous' : brightness > 0.3 ? 'rich and deep' : 'dark and shadowy',
      harmony: complexity > 0.5 ? 'complex multi-tonal gradients' : 'smooth blended transitions',
      colorDetail: '',
      colorShift: ''
    };
  },

  _legacyForm(features) {
    const f = features;
    const complexity = f.complexity || 0.3;
    const harmonicRatio = f.harmonic_ratio || 0.5;
    const roughness = f.roughness || 0.3;
    const intensity = f.intensity || 0.5;

    return {
      bodyComplexity: complexity > 0.7 ? 'Extremely intricate and detailed anatomy.' : complexity > 0.4 ? 'Moderately complex body structure.' : 'Simple streamlined form.',
      baseForm: harmonicRatio > 0.6 ? 'smooth organic curves' : 'angular geometric shapes',
      edges: roughness > 0.5 ? 'rough textured edges' : 'smooth flowing edges',
      weight: intensity > 0.6 ? 'heavy dense' : intensity > 0.3 ? 'medium' : 'lightweight',
      detail: complexity > 0.5 ? 'intricate fine details' : 'clean simple surfaces',
      motion: intensity > 0.5 ? 'dynamic powerful movement' : 'calm gentle motion',
      symmetry: harmonicRatio > 0.5 ? 'bilateral symmetry' : 'slight asymmetry',
      pose: 'Centered in frame'
    };
  },

  _legacyTexture(features) {
    const f = features;
    const roughness = f.roughness || 0.3;
    const harmonicRatio = f.harmonic_ratio || 0.5;

    return {
      surface: roughness > 0.5 ? 'rough and textured' : 'smooth and polished',
      material: harmonicRatio > 0.5 ? 'organic flowing material' : 'hard structured material',
      grain: roughness > 0.5 ? 'visible coarse grain' : 'fine smooth grain',
      transparency: 'mostly opaque with subtle translucency',
      textureDetail: '',
      distortion: '',
      edgeGlow: ''
    };
  },

  _legacyAtmosphere(features) {
    const f = features;
    const intensity = f.intensity || 0.5;
    const warmth = f.warmth || 0.5;

    const mood = intensity > 0.7 ? 'explosive and fierce'
      : intensity > 0.4 ? 'dynamic and energetic'
      : warmth > 0.5 ? 'warm and gentle'
      : 'calm and mysterious';

    return {
      mood: mood,
      arc: intensity > 0.5 ? 'building energy' : 'peaceful stillness'
    };
  }
};

// ==========================================================
// OVERRIDE: AumagePrompt._buildCreature
// This is the key integration — when prompts.js calls
// _buildCreature(visuals), we intercept and use the new engine.
// This must run AFTER prompts.js loads.
// ==========================================================

function installCreatureEngineOverride(attempt) {
  attempt = attempt || 1;
  const MAX_ATTEMPTS = 20; // 20 × 100ms = 2 seconds max wait

  if (typeof AumagePrompt === 'undefined' || typeof AumagePromptBuilder === 'undefined') {
    if (attempt >= MAX_ATTEMPTS) {
      console.error('❌ Creature Engine v2 FAILED: AumagePrompt not found after ' + MAX_ATTEMPTS + ' attempts. Is prompts.js loaded?');
      return;
    }
    setTimeout(function() { installCreatureEngineOverride(attempt + 1); }, 100);
    return;
  }

  // Save original for landscape/abstract
  const originalBuildCreature = AumagePrompt._buildCreature;

  AumagePrompt._buildCreature = function(v) {
    // Use the new engine config if available
    const config = v._engineConfig || AumageMapping._lastConfig;
    if (config) {
      return AumagePromptBuilder.build(config);
    }
    // Fallback to original if somehow no config
    console.warn('Creature engine config not found, using legacy builder');
    return originalBuildCreature.call(this, v);
  };

  console.log('✅ Creature Engine v' + ENGINE_VERSION + ' installed — 79 morphologies, 55 patterns, mutation system active');
}

// Install override when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installCreatureEngineOverride);
} else {
  // If scripts load after DOMContentLoaded, install immediately but with a small delay
  // to ensure prompts.js has loaded
  setTimeout(installCreatureEngineOverride, 100);
}

// Export
if (typeof window !== 'undefined') window.AumageMapping = AumageMapping;
