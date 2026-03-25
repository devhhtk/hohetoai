// ============================================================
// AUMAGE CREATURE ENGINE — CORE SELECTION + MUTATION
// Version 2.0.0
// Requires: morphologies.js, coloration.js loaded first
// ============================================================

const ENGINE_VERSION = '2.0.0';

// =============================================================
// CONFIGURATION CONSTANTS
// Centralized thresholds for easy tuning. Adjust here, not inline.
// =============================================================
const EVOLUTION_THRESHOLDS = {
  SINGLE_CELL: 3,   // seconds — below = single-cell
  PRIMITIVE:   7,   // seconds — below = primitive
  BASIC:       15,  // seconds — below = basic
  DEVELOPED:   25,  // seconds — below = developed
  ADVANCED:    40   // seconds — below = advanced, above = apex
};

const INTELLIGENCE_THRESHOLDS = {
  TRANSCENDENT: 0.80,
  INTELLIGENT:  0.65,
  AWARE:        0.50,
  REACTIVE:     0.35,
  BASIC:        0.20
  // Below BASIC = mindless
};

const INTELLIGENCE_WEIGHTS = {
  DURATION:   0.40,
  COMPLEXITY: 0.25,
  HARMONIC:   0.20,
  TIMBRE:     0.15
};

const INTELLIGENCE_DURATION_CAP = 40; // seconds — duration maxes at this value

const MUTATION_RATES = {
  TIER_2_THRESHOLD: 95,  // roll > 95 = Tier 2 rare (5%)
  TIER_1_THRESHOLD: 85   // roll > 85 = Tier 1 (10%)
};

const DOMAIN_SALT_RANGE = 0.45;           // ±0.225 random jitter on domain scores
const MORPHOLOGY_SALT_MIN = 0.2;          // Weight multiplier range: 0.2x to 1.2x
const MORPHOLOGY_TOP_N = 20;              // Pick from top N scored candidates
const COMPATIBLE_SPLICE_MIN_COMPAT = 0.2; // Min domain score for Tier 1 splices

const TIER_BONUSES = {
  DEEP_SEA_DARK_AUDIO:   0.6,  // Dark + cold audio → deep-sea creatures
  PLANT_QUIET_INTRICATE: 0.7,  // Quiet + intricate → carnivorous plants
  PLANT_PARTIAL:         0.2,  // Only quiet OR only intricate
  FISH_AQUATIC:          0.2   // Aquatic domain → fish
};

const AUDIO_TRIGGERS = {
  DARK_BRIGHTNESS:      0.3,
  DARK_WARMTH:          0.4,
  QUIET_INTENSITY:      0.35,
  INTRICATE_COMPLEXITY: 0.5
};

// =============================================================
// SAFE FEATURE ACCESSOR
// Handles undefined, NaN, null, negative, and non-finite values.
// =============================================================
function safeFeature(features, key, fallback) {
  const val = features[key];
  if (val === undefined || val === null || !Number.isFinite(val)) return fallback;
  return val;
}

// =============================================================
// ELEMENT DEFINITIONS (module-level constant)
// =============================================================
const ELEMENT_DEFS = {
  fire:   { name: 'fire',   desc: 'Its body radiates heat. Glowing embers pulse beneath the skin. Wisps of smoke or flame lick at its form.',   skinMod: 'with charred cracks revealing molten orange glow underneath',     aura: 'surrounded by shimmering heat haze' },
  ice:    { name: 'ice',    desc: 'Its body is frost-touched and crystalline. Delicate ice formations grow along its spine and limbs.',           skinMod: 'with patches of translucent ice and frost crystals',             aura: 'surrounded by faint cold mist with tiny ice particles' },
  storm:  { name: 'storm',  desc: 'Crackling static energy dances across its body. Tiny arcs of electricity jump between its features.',          skinMod: 'with veins of electric blue light pulsing beneath the surface',  aura: 'surrounded by faint crackling sparks and charged air' },
  earth:  { name: 'earth',  desc: 'Its body is dense and grounded, with textures of stone, soil, and root. Moss grows in crevices.',              skinMod: 'with embedded pebbles, mineral deposits, and patches of moss',   aura: 'with dust motes and tiny spores drifting around it' },
  water:  { name: 'water',  desc: 'Its body has a fluid, liquid quality. Parts flow and ripple. Droplets cling to its form.',                     skinMod: 'with a wet glistening surface that catches light like water',    aura: 'with tiny floating water droplets catching the light' },
  light:  { name: 'light',  desc: 'It glows from within. Partially translucent, revealing luminous internal structures.',                         skinMod: 'with bioluminescent patches that glow softly from within',      aura: 'emanating a gentle warm glow with floating light particles' },
  shadow: { name: 'shadow', desc: 'Its edges dissolve into wisps of dark smoke. Parts solid, others shadow. It absorbs light.',                   skinMod: 'with edges that blur into dark smoky tendrils',                  aura: 'with shadows that pool and deepen unnaturally around it' },
  nature: { name: 'nature', desc: 'Living plants grow from its body. Tiny flowers bloom along its back. Vines curl around its limbs.',            skinMod: 'with tiny sprouting plants and curling vines in crevices',       aura: 'with floating pollen, tiny seeds, and drifting petals' }
};

// =============================================================
// TIER-SPECIFIC PATTERN MAP (module-level constant)
// Tier patterns have no complexity range — always eligible for
// their tier. This is intentional: they're unique visual identities.
// =============================================================
const TIER_PATTERN_MAP = {
  microbial:         AumageColoration.MICROBIAL_PATTERNS,
  arthropod:         AumageColoration.ARTHROPOD_PATTERNS,
  mollusk:           AumageColoration.MOLLUSK_PATTERNS,
  deep_sea:          AumageColoration.DEEP_SEA_PATTERNS,
  carnivorous_plant: AumageColoration.CARNIVOROUS_PLANT_PATTERNS,
  fish:              AumageColoration.FISH_PATTERNS
};

// Intelligence level ordering for gate comparisons
const INTELLIGENCE_ORDER = ['mindless', 'basic', 'reactive', 'aware', 'intelligent', 'transcendent'];


// =============================================================
// MAIN ENGINE
// =============================================================
const AumageEngine = {

  VERSION: ENGINE_VERSION,

  /**
   * Map audio duration to evolution stage.
   * @param {object} features - Audio features from Meyda
   * @returns {{ stage: string, desc: string, scale: string }}
   */
  mapEvolution(features) {
    const dur = safeFeature(features, 'duration_sec', 10);
    const T = EVOLUTION_THRESHOLDS;
    if (dur < T.SINGLE_CELL) return { stage: 'single-cell', desc: 'A microscopic single-celled organism.', scale: 'Viewed under extreme magnification — only micrometers across.' };
    if (dur < T.PRIMITIVE)   return { stage: 'primitive',    desc: 'A primitive simple organism.',          scale: 'Very small, only a few centimeters across.' };
    if (dur < T.BASIC)       return { stage: 'basic',        desc: 'A basic creature with defined body structure.', scale: 'Small, roughly the size of a hand.' };
    if (dur < T.DEVELOPED)   return { stage: 'developed',    desc: 'A well-developed creature with complex anatomy.', scale: 'Medium-sized, about the size of a cat or small dog.' };
    if (dur < T.ADVANCED)    return { stage: 'advanced',     desc: 'An advanced, highly evolved creature.', scale: 'Large and imposing, the size of a large dog or deer.' };
    return { stage: 'apex', desc: 'An apex organism — the pinnacle of its evolutionary line.', scale: 'Massive and magnificent, dominating its environment.' };
  },

  /**
   * Map audio complexity to intelligence tier.
   * Score = weighted sum of duration + complexity + harmonic ratio + timbre.
   * @param {object} features - Audio features from Meyda
   * @returns {{ level: string, desc: string, eyeDetail: string }}
   */
  mapIntelligence(features) {
    const dur = Math.min(1, safeFeature(features, 'duration_sec', 10) / INTELLIGENCE_DURATION_CAP);
    const cx  = safeFeature(features, 'complexity', 0.3);
    const hr  = safeFeature(features, 'harmonic_ratio', 0.5);
    const tc  = safeFeature(features, 'timbre_complexity', 0.3);
    const W = INTELLIGENCE_WEIGHTS;
    const score = (dur * W.DURATION) + (cx * W.COMPLEXITY) + (hr * W.HARMONIC) + (tc * W.TIMBRE);
    const T = INTELLIGENCE_THRESHOLDS;

    if (score > T.TRANSCENDENT) return { level: 'transcendent', desc: 'This creature radiates profound intelligence. Its posture is deliberate and purposeful.', eyeDetail: 'Large complex eyes with visible iris patterns, conveying emotion and understanding.' };
    if (score > T.INTELLIGENT)  return { level: 'intelligent',  desc: 'This creature appears highly intelligent. Its gaze is focused and knowing.', eyeDetail: 'Bright alert eyes with clear pupils, showing awareness.' };
    if (score > T.AWARE)        return { level: 'aware',        desc: 'This creature shows clear awareness. Its expression suggests curiosity.', eyeDetail: 'Clear expressive eyes that suggest a thinking mind.' };
    if (score > T.REACTIVE)     return { level: 'reactive',     desc: 'This creature operates on instinct but shows moments of recognition.', eyeDetail: 'Simple but attentive eyes.' };
    if (score > T.BASIC)        return { level: 'basic',        desc: 'Basic sensory awareness. It reacts to stimuli but shows no higher thought.', eyeDetail: 'Small beady eyes or simple eye spots.' };
    return { level: 'mindless', desc: 'No visible intelligence. It exists, it grows, it consumes — nothing more.', eyeDetail: 'Tiny vestigial eye spots or no visible eyes.' };
  },

  /**
   * Map audio tonal character to elemental affinity.
   * Returns primary + secondary element with strength score.
   * @param {object} features - Audio features from Meyda
   * @returns {{ primary: object, secondary: object, strength: number }}
   */
  mapElement(features) {
    const w = safeFeature(features, 'warmth', 0.5);
    const b = safeFeature(features, 'brightness', 0.5);
    const i = safeFeature(features, 'intensity', 0.5);
    const r = safeFeature(features, 'roughness', 0.3);
    const h = safeFeature(features, 'harmonic_ratio', 0.5);
    const c = safeFeature(features, 'complexity', 0.3);

    const scores = {
      fire:   (w * 0.4) + (i * 0.4) + (r * 0.2),
      ice:    ((1 - w) * 0.4) + (b * 0.3) + ((1 - i) * 0.3),
      storm:  (i * 0.3) + (r * 0.3) + (b * 0.2) + ((1 - h) * 0.2),
      earth:  ((1 - b) * 0.3) + (r * 0.3) + (i * 0.2) + ((1 - h) * 0.2),
      water:  (h * 0.3) + ((1 - r) * 0.3) + (c * 0.2) + ((1 - i) * 0.2),
      light:  (b * 0.4) + (h * 0.3) + ((1 - r) * 0.3),
      shadow: ((1 - b) * 0.4) + ((1 - h) * 0.3) + (w * 0.3),
      nature: (c * 0.3) + (h * 0.3) + ((1 - i) * 0.2) + (w * 0.2)
    };

    let best = 'nature', bestS = 0, second = 'nature', secondS = 0;
    for (const [el, s] of Object.entries(scores)) {
      if (s > bestS) { second = best; secondS = bestS; best = el; bestS = s; }
      else if (s > secondS) { second = el; secondS = s; }
    }

    return { primary: ELEMENT_DEFS[best], secondary: ELEMENT_DEFS[second], strength: bestS };
  },

  /**
   * Map audio to creature habitat domain.
   * Includes random salt so same audio can produce different domains.
   * @param {object} features - Audio features from Meyda
   * @returns {string} Domain name
   */
  mapDomain(features) {
    const b   = safeFeature(features, 'brightness', 0.5);
    const i   = safeFeature(features, 'intensity', 0.5);
    const r   = safeFeature(features, 'roughness', 0.3);
    const h   = safeFeature(features, 'harmonic_ratio', 0.5);
    const c   = safeFeature(features, 'complexity', 0.3);
    const p   = safeFeature(features, 'percussive_ratio', 1 - h);
    const fl  = safeFeature(features, 'flatness', 0.2);
    const zcr = safeFeature(features, 'zero_crossing_rate_mean', 30);

    const scores = {
      aerial:       (b > 0.6 && i < 0.3) ? 0.8 : (b * 0.4) + ((1 - i) * 0.3) + ((1 - r) * 0.2),
      aquatic:      (h > 0.65 && r < 0.3) ? 0.8 : (c * 0.25) + ((1 - r) * 0.25) + (h * 0.2) + ((1 - b) * 0.15),
      terrestrial:  (p > 0.55 && r > 0.4) ? 0.8 : (p * 0.25) + (r * 0.25) + (i * 0.2) + ((1 - h) * 0.1),
      insectoid:    (fl > 0.4 && zcr > 50) ? 0.8 : (fl * 0.25) + (Math.min(zcr / 80, 1) * 0.3) + (b * 0.2),
      subterranean: (b < 0.2 && i > 0.5) ? 0.8 : ((1 - b) * 0.3) + (i * 0.25) + ((1 - h) * 0.2),
      mythological: (i > 0.6 || c > 0.6) ? 0.75 : (i * 0.3) + (c * 0.3) + (h * 0.1),
      classic:      0.25  // baseline only — no longer dominant
    };

    // All domains get salt so classic can be beaten
    for (const key of Object.keys(scores)) {
      scores[key] += (Math.random() - 0.5) * DOMAIN_SALT_RANGE;
    }

    let best = 'classic', bestS = 0;
    for (const [d, s] of Object.entries(scores)) {
      if (s > bestS) { best = d; bestS = s; }
    }
    return best;
  },

  /**
   * Select color palette deterministically from audio hash.
   * Same audio always produces the same palette.
   * @param {object} features - Audio features from Meyda
   * @returns {object} Palette with base, second, accent, detail, temp
   */
  selectPalette(features) {
    const pitch = safeFeature(features, 'dominant_pitch_class', 0);
    const rmsD  = Math.round(safeFeature(features, 'rms_mean', 0.05) * 100000);
    const zcrD  = Math.round(safeFeature(features, 'zero_crossing_rate_mean', 20) * 100);
    const hash  = (rmsD + zcrD) % 20;
    const wBucket = Math.floor(safeFeature(features, 'warmth', 0.5) * 5);
    const cBucket = Math.floor(safeFeature(features, 'complexity', 0.3) * 4);
    const idx = (pitch + hash + wBucket + cBucket) % 20;
    return AumageColoration.PALETTES[idx];
  },

  /**
   * Select primary morphology from eligible pool.
   * Scores candidates by domain fit + tier-specific audio bonuses + random salt.
   * @param {object} evolution - From mapEvolution()
   * @param {object} intelligence - From mapIntelligence()
   * @param {string} domain - From mapDomain()
   * @param {object} features - Raw audio features for tier bonuses
   * @returns {{ id: string, morph: object }}
   */
  selectMorphology(evolution, intelligence, domain, features) {
    const eligible = this._getEligiblePool(evolution, intelligence);
    const brightness  = safeFeature(features, 'brightness', 0.5);
    const warmth      = safeFeature(features, 'warmth', 0.5);
    const intensity   = safeFeature(features, 'intensity', 0.5);
    const complexity  = safeFeature(features, 'complexity', 0.3);
    const isDarkAudio = brightness < AUDIO_TRIGGERS.DARK_BRIGHTNESS && warmth < AUDIO_TRIGGERS.DARK_WARMTH;

    // Exotic tiers get a base floor so they always compete
    const EXOTIC_TIERS = new Set(['mythological', 'deep_sea', 'carnivorous_plant', 'hybrid', 'fish', 'mollusk']);
    const EXOTIC_FLOOR = 0.35;  // minimum weight before salt for exotic tiers

    const scored = eligible.map(({ id, morph }) => {
      let weight = morph.domain[domain] || 0.1;

      // Lift exotic tiers to a competitive floor
      if (EXOTIC_TIERS.has(morph.tier)) {
        weight = Math.max(weight, EXOTIC_FLOOR);
      }

      // Wildcard: ~15% chance any creature gets a massive random boost
      if (Math.random() < 0.15) {
        weight += 0.4 + Math.random() * 0.4;
      }

      if (morph.tier === 'deep_sea' && isDarkAudio) {
        weight += TIER_BONUSES.DEEP_SEA_DARK_AUDIO;
      }
      if (morph.tier === 'carnivorous_plant') {
        const quiet = intensity < AUDIO_TRIGGERS.QUIET_INTENSITY;
        const intricate = complexity > AUDIO_TRIGGERS.INTRICATE_COMPLEXITY;
        if (quiet && intricate) weight += TIER_BONUSES.PLANT_QUIET_INTRICATE;
        else if (quiet || intricate) weight += TIER_BONUSES.PLANT_PARTIAL;
      }
      if (morph.tier === 'fish' && domain === 'aquatic') {
        weight += TIER_BONUSES.FISH_AQUATIC;
      }
      if (morph.tier === 'mythological') {
        weight += complexity * 0.3 + intensity * 0.2;
      }
      if (morph.tier === 'arthropod') {
        weight += 0.15;  // arthropods were systematically underrepresented
      }

      weight *= MORPHOLOGY_SALT_MIN + Math.random();
      return { id, morph, weight };
    });

    scored.sort((a, b) => b.weight - a.weight);
    const top = scored.slice(0, Math.min(MORPHOLOGY_TOP_N, scored.length));
    return this._weightedPick(top);
  },

  /**
   * Build pool of morphologies matching evolution stage + intelligence gate.
   * @param {object} evolution - From mapEvolution()
   * @param {object} intelligence - From mapIntelligence()
   * @returns {Array<{ id: string, morph: object }>}
   */
  _getEligiblePool(evolution, intelligence) {
    const stage = evolution.stage;
    const actualInt = INTELLIGENCE_ORDER.indexOf(intelligence.level);
    const pool = [];

    for (const [id, morph] of Object.entries(AumageMorphologies)) {
      if (!morph.evolution.includes(stage)) continue;
      if (morph.intelligenceGate) {
        const required = INTELLIGENCE_ORDER.indexOf(morph.intelligenceGate);
        if (actualInt < required) continue;
      }
      pool.push({ id, morph });
    }
    return pool;
  },

  /**
   * Weighted random pick from scored candidates.
   * @param {Array<{ id, morph, weight }>} candidates
   * @returns {{ id: string, morph: object }}
   */
  _weightedPick(candidates) {
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const c of candidates) {
      roll -= c.weight;
      if (roll <= 0) return { id: c.id, morph: c.morph };
    }
    return candidates[0];
  },

  /**
   * Select color pattern for a morphology.
   * Standard patterns filtered by complexity. Tier-specific always eligible.
   * @param {object} morph - Morphology definition
   * @param {number} complexity - Audio complexity 0-1
   * @param {object} intelligence - From mapIntelligence()
   * @returns {object} Pattern { id, name, prompt }
   */
  selectPattern(morph, complexity, intelligence) {
    const tier = morph.tier;

    if (tier === 'microbial') {
      const pool = TIER_PATTERN_MAP.microbial;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const seen = new Set();
    const pool = [];

    for (const pat of AumageColoration.STANDARD_PATTERNS) {
      if (complexity >= pat.complexity[0] && complexity <= pat.complexity[1] && !seen.has(pat.id)) {
        seen.add(pat.id);
        pool.push(pat);
      }
    }

    if (['intelligent', 'transcendent'].includes(intelligence.level)) {
      for (const pat of AumageColoration.STANDARD_PATTERNS) {
        if ((pat.id === 'circuit_trace' || pat.id === 'constellation') && !seen.has(pat.id)) {
          seen.add(pat.id);
          pool.push(pat);
        }
      }
    }

    const tierPats = TIER_PATTERN_MAP[tier];
    if (tierPats) {
      for (const pat of tierPats) {
        if (!seen.has(pat.id)) { seen.add(pat.id); pool.push(pat); }
      }
    }

    if (pool.length === 0) {
      console.warn('Pattern pool empty for tier:', tier, 'complexity:', complexity);
      return AumageColoration.STANDARD_PATTERNS[0];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /**
   * Roll for mutation and select morphologies.
   * 85% normal, 10% Tier 1 (compatible), 5% Tier 2 (chaos).
   * @param {object} evolution - From mapEvolution()
   * @param {object} intelligence - From mapIntelligence()
   * @param {string} domain - From mapDomain()
   * @param {object} features - Raw audio features
   * @returns {{ primary, secondary, mutation }}
   */
  rollMutation(evolution, intelligence, domain, features) {
    const roll = Math.random() * 100;
    const primary = this.selectMorphology(evolution, intelligence, domain, features);

    if (roll > MUTATION_RATES.TIER_2_THRESHOLD) {
      const secondary = this._selectAnySplice(evolution, intelligence, primary.id);
      if (secondary) {
        const feat = this._pickSpliceFeature(secondary.morph);
        return { primary, secondary, mutation: { tier: 2, primaryId: primary.id, secondaryId: secondary.id, splicedFeature: feat, spliceDesc: secondary.morph.donations[feat] } };
      }
    } else if (roll > MUTATION_RATES.TIER_1_THRESHOLD) {
      const secondary = this._selectCompatibleSplice(primary, evolution, intelligence, domain);
      if (secondary) {
        const feat = this._pickSpliceFeature(secondary.morph);
        return { primary, secondary, mutation: { tier: 1, primaryId: primary.id, secondaryId: secondary.id, splicedFeature: feat, spliceDesc: secondary.morph.donations[feat] } };
      }
    }

    return { primary, secondary: null, mutation: null };
  },

  /** Pick random donatable feature from morphology. */
  _pickSpliceFeature(morph) {
    const available = Object.keys(morph.donations || {});
    if (available.length === 0) return 'surface';
    return available[Math.floor(Math.random() * available.length)];
  },

  /** Tier 2: any eligible morphology except primary and microbial. */
  _selectAnySplice(evolution, intelligence, primaryId) {
    const pool = this._getEligiblePool(evolution, intelligence)
      .filter(m => m.id !== primaryId && m.morph.tier !== 'microbial');
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /** Tier 1: different tier, shared domain compatibility. */
  _selectCompatibleSplice(primary, evolution, intelligence, domain) {
    const pool = this._getEligiblePool(evolution, intelligence).filter(m => {
      if (m.id === primary.id) return false;
      if (m.morph.tier === primary.morph.tier) return false;
      if (m.morph.tier === 'microbial') return false;
      return (m.morph.domain[domain] || 0) > COMPATIBLE_SPLICE_MIN_COMPAT;
    });
    if (pool.length === 0) return null;

    const scored = pool.map(m => ({
      ...m, weight: (m.morph.domain[domain] || 0.1) * (MORPHOLOGY_SALT_MIN + Math.random())
    }));
    scored.sort((a, b) => b.weight - a.weight);
    return this._weightedPick(scored.slice(0, Math.min(3, scored.length)));
  }
};

if (typeof module !== 'undefined') module.exports = AumageEngine;
if (typeof window !== 'undefined') window.AumageEngine = AumageEngine;
