// ============================================================
// AUMAGE CREATURE ENGINE — PROMPT BUILDER
// Version 2.3.0
// Requires: morphologies.js, coloration.js, engine-core.js
//
// ARCHITECTURE (v2.3+):
//   FLUX generates: creature only, clean background
//   Frontend overlays: card frame, name plate, catalog ID
//   Sorting Hat injects: creature name + flavor text
//
// REMOVED in v2.3: card frame, border, crosshairs, secondary
//   sketch views, cyan annotation arrows, dimension lines.
//   These are all now handled by aumage-card-frame.html/CSS.
// ============================================================

// ENGINE_VERSION is declared in engine-core.js — do not redeclare here
const PROMPTS_VERSION = '2.3.0';

// =============================================================
// STYLE PREFIX — creature rendering identity only (no frame)
// =============================================================
// Rendering quality — always the same
const CREATURE_RENDER_QUALITY = [
  'Rich warm saturated color palette, NOT pastel or soft.',
  'The creature has physical weight and solidity — it feels heavy, grounded, and real.',
  'Big expressive soulful eyes with personality and intensity, not baby-cute.',
  'Couture-level surface complexity — textured scales, bark-like skin, moss in crevices, ornamental natural ridges, jewel-like iridescent highlights, organic surface patterns.',
  'Studio Ghibli creature energy — the creature radiates warmth, personality, and feels alive.',
  'NO armor, NO weapons, NO metal gear, NO mechanical parts, NO suits, NO equipment. This is a living creature, not a warrior.',
  'High detail, vivid and colorful illustration, professional concept art quality.',
].join(' ');

// =============================================================
// CREATURE STYLE PREFIX
// Framed as a "creature reference sheet" — a visual format FLUX
// is heavily trained on (concept art, bestiary pages, field guides).
// FLUX naturally produces: main creature + secondary line-art views
// + annotation arrows when given this framing.
//
// Card frame and name plate are frontend CSS overlays.
// Annotation arrows/labels are FLUX-rendered (it does these well).
// =============================================================
function getCreatureStylePrefix() {
  return [
    'Vertical creature design reference sheet, Blueprint Bestiary style, portrait orientation.',
    'Soft painterly fantasy creature illustration, warm expressive lighting and rich saturated colors.',
    // CREATURE — large, standing, alert
    'The main creature stands upright in an alert three-quarter pose, entirely visible head to feet and tail, occupying roughly 70% of the art area, positioned in the center-right.',
    'The creature is standing, awake, and alert — NOT sleeping, NOT resting, NOT curled up, NOT lying down.',
    // SKETCHES — left side and bottom only
    'Two or three small secondary sketches of the same creature species placed along the left edge and bottom of the page.',
    'The sketches are drawn in thin delicate pencil line art — no color fill, just precise linework. One shows a curled sleeping pose, one shows a head close-up, one shows a side profile.',
    // BLUEPRINT LINES — dimension marks only
    'Thin cyan blueprint-style dimension lines and measurement marks overlaid on the creature — height lines, width brackets, proportion guides.',
    // QUALITY
    CREATURE_RENDER_QUALITY,
    // BACKGROUND — FORCE TIFFANY BLUE
    'The background color is solid pale Tiffany blue (#c0e8e8). NOT cream, NOT yellow, NOT parchment, NOT warm white. A cool light blue-green tint.',
    // RESTRICTIONS — front-loaded negatives
    'CRITICAL: There must be absolutely NO text, NO words, NO letters, NO numbers, NO writing of any kind anywhere in the image.',
    'No card frame, no outer border, no title bar, no name.',
    'No radar charts, no circular targets, no crosshair diagrams, no pie charts, no compass roses, no technical diagrams.',
    'No notebook holes, no spiral binding.',
    'No watermark, no signature, no logo.',
  ].join(' ');
}

// =============================================================
// CREATURE FRAMING HINTS
// Special rendering conditions for specific tiers/domains.
// Applied to the creature itself, not the background.
// =============================================================
const CREATURE_FRAMING = {
  standard:     '',
  dark_micro:   'The creature is rendered as if viewed through a microscope, with dramatic scientific lighting on the creature itself. Tiny scale, microscopic detail.',
  dark_deep:    'The creature glows with its own bioluminescence against the pale background. Self-illuminated by bio-light, deep shadows on the creature body.',
  dark_aquatic: 'The creature has a wet, translucent aquatic quality. Dramatic side-lighting reveals internal structures through translucent body parts.'
};


const AumagePromptBuilder = {

  /**
   * Build complete creature artwork prompt from engine config.
   * Generates creature-only illustration on clean background.
   * Card frame, name plate, and annotations are frontend overlays.
   * @param {object} config - Full engine output config
   * @returns {string} Complete prompt for FLUX
   */
  build(config) {
    const { primary, mutation, evolution, intelligence, element, palette, pattern } = config;
    const morph = primary.morph;
    const tier = morph.tier;

    // CRITICAL ORDER: Creature identity FIRST, then layout/style.
    // FLUX front-loads attention — whatever appears in the first 200 chars
    // determines the image. Morphology must come before style prefix.
    const parts = [
      // 1. CREATURE IDENTITY — what it IS
      this._morphologyBlock(morph),
      this._evolutionBlock(evolution),
      this._framingBlock(morph),
      // 2. LAYOUT & STYLE — how to present it
      getCreatureStylePrefix(),
      // 3. MODIFICATIONS — mutations, intelligence, color, element
      this._mutationBlock(mutation),
      this._intelligenceBlock(intelligence, tier),
      this._intelligenceAdditiveBlock(intelligence, tier),
      this._colorBlock(palette, pattern, tier),
      this._elementBlock(element),
      this._antiMonoBlock(),
    ];

    return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  },

  // ==========================================================
  // BLOCK BUILDERS
  // ==========================================================

  /** Creature-specific rendering hints (microscope, biolum, aquatic). */
  _framingBlock(morph) {
    return CREATURE_FRAMING[morph.framing] || '';
  },

  /** Evolution stage description + scale. */
  _evolutionBlock(evolution) {
    return `${evolution.desc} ${evolution.scale}`;
  },

  /** Core morphology body plan from database. */
  _morphologyBlock(morph) {
    return morph.prompt;
  },

  /** Mutation splice description (if mutated). */
  _mutationBlock(mutation) {
    if (!mutation || !mutation.spliceDesc) return '';
    const secName = (AumageMorphologies[mutation.secondaryId] || {}).name || mutation.secondaryId;
    const priName = (AumageMorphologies[mutation.primaryId] || {}).name || mutation.primaryId;
    return `HOWEVER, this creature exhibits a striking mutation: its ${mutation.splicedFeature} shows ${mutation.spliceDesc}. ` +
      `The blend between ${priName} and ${secName} features looks organic and evolved, not artificial — as if this hybrid species has existed for generations.`;
  },

  /** Intelligence description + eye detail. */
  _intelligenceBlock(intelligence, tier) {
    if (tier === 'microbial' && ['mindless', 'basic'].includes(intelligence.level)) return '';
    return `${intelligence.desc} ${intelligence.eyeDetail || ''}`;
  },

  /** Intelligence additive — tech/accessories layered onto creature. */
  _intelligenceAdditiveBlock(intelligence, tier) {
    if (tier === 'intelligence_gated') return '';
    switch (intelligence.level) {
      case 'reactive':
        return 'The creature has alert, curious eyes showing basic awareness.';
      case 'aware':
        return 'The creature has a knowing, intelligent expression. Perhaps a simple natural adornment — feathers, shells, or organic markings suggesting self-awareness.';
      case 'intelligent':
        return 'The creature has deeply expressive wise eyes and an alert, thoughtful bearing. Organic adornments only — no metal, no machinery, no armor.';
      case 'transcendent':
        return 'The creature radiates an otherworldly presence — glowing eyes, faint bioluminescent patterns, an aura of ancient wisdom. Purely organic and magical, no mechanical elements.';
      default:
        return '';
    }
  },

  /** Color palette + pattern + accent placement. */
  _colorBlock(palette, pattern, tier) {
    const places = AumageColoration.ACCENT_PLACEMENTS[tier] || AumageColoration.ACCENT_PLACEMENTS.vertebrate;
    const a1 = places[Math.floor(Math.random() * places.length)];
    let a2 = places[Math.floor(Math.random() * places.length)];
    if (a2 === a1 && places.length > 1) {
      a2 = places[(places.indexOf(a1) + 1) % places.length];
    }
    return `${palette.base} body with ${pattern.prompt} in ${palette.second}. ` +
      `${palette.accent} accent coloring on the ${a1} and ${a2}. ` +
      `${palette.detail} detail markings.`;
  },

  /** Elemental overlay (fire cracks, ice crystals, etc). */
  _elementBlock(element) {
    if (element.strength < 0.45) return '';
    const parts = [];
    if (element.strength > 0.5) parts.push(element.primary.desc);
    parts.push(element.primary.skinMod);
    if (element.strength > 0.55) parts.push(element.primary.aura);
    return parts.join('. ') + '.';
  },

  /** Anti-monochrome safeguard. */
  _antiMonoBlock() {
    return AumageColoration.ANTI_MONO;
  },

  /**
   * Annotation labels — tells FLUX which features to label with arrows.
   * Uses the same getAnnotationLabels() logic as the frontend overlay system.
   */
  _annotationBlock(morph, mutation, intelligence, element) {
    const labels = this.getAnnotationLabels(morph, mutation, intelligence, element);
    if (!labels || labels.length === 0) return '';
    return `Blueprint annotation arrows on the main creature pointing to: ${labels.join(', ')}.`;
  },

  // ==========================================================
  // ANNOTATION DATA — for frontend card frame overlay use
  // Returns the feature labels that should appear on the card
  // as blueprint callout annotations (rendered by frontend, not FLUX).
  // ==========================================================
  getAnnotationLabels(morph, mutation, intelligence, element) {
    const hints = [];

    if (['aware', 'intelligent', 'transcendent'].includes(intelligence.level)) {
      hints.push('EYES');
    }

    const tierCallouts = {
      microbial:          ['MEMBRANE', 'FLAGELLA', 'INTERNAL STRUCTURE'],
      vertebrate:         ['LIMBS', 'TAIL', 'FUR TEXTURE'],
      arthropod:          ['EXOSKELETON', 'WING STRUCTURE', 'ANTENNAE'],
      mollusk:            ['MANTLE', 'TENTACLES', 'SHELL'],
      fish:               ['FIN STRUCTURE', 'SCALES', 'GILL PLATES'],
      deep_sea:           ['BIOLUMINESCENCE', 'JAW STRUCTURE', 'PHOTOPHORES'],
      carnivorous_plant:  ['TRAP MECHANISM', 'LURE GLOW', 'ROOT STRUCTURE'],
      mythological:       ['HORN STRUCTURE', 'WING SPAN', 'ARMOR PLATES'],
      hybrid:             ['GROWTH FORMATIONS', 'HYBRID JUNCTION', 'CORE STRUCTURE'],
      intelligence_gated: ['VISOR', 'MECHANICAL JOINTS', 'POWER CORE']
    };

    const callouts = tierCallouts[morph.tier] || tierCallouts.vertebrate;
    const shuffled = [...callouts].sort(() => Math.random() - 0.5);
    hints.push(shuffled[0], shuffled[1]);

    if (mutation && mutation.splicedFeature) {
      const featureLabels = {
        head: 'MUTANT HEAD', limbs: 'SPLICED LIMBS', surface: 'MUTANT SKIN',
        tail: 'HYBRID TAIL', wings: 'SPLICED WINGS', pattern: 'MUTATION PATTERN'
      };
      hints.push(featureLabels[mutation.splicedFeature] || 'MUTATION');
    }

    if (element.strength > 0.5) {
      const elementLabels = {
        fire: 'EMBER CORE', ice: 'FROST CRYSTALS', storm: 'STATIC CHARGE',
        earth: 'MINERAL DEPOSITS', water: 'FLUID MEMBRANE', light: 'GLOW SOURCE',
        shadow: 'SHADOW TENDRILS', nature: 'MOSS GROWTH'
      };
      hints.push(elementLabels[element.primary.name] || 'ELEMENTAL');
    }

    return hints.slice(0, 4);
  },

  // ==========================================================
  // DEBUG: Readable summary for console
  // ==========================================================
  debugSummary(config) {
    const { primary, mutation, evolution, intelligence, element, domain, palette, pattern } = config;
    const lines = [
      `ENGINE:     Aumage Creature Engine v${ENGINE_VERSION}`,
      `MORPHOLOGY: ${primary.morph.name} (${primary.id}) [${primary.morph.tier}]`,
      `EVOLUTION:  ${evolution.stage}`,
      `INTEL:      ${intelligence.level}`,
      `ELEMENT:    ${element.primary.name} (${element.strength.toFixed(2)})`,
      `DOMAIN:     ${domain}`,
      `PALETTE:    ${palette.name} (${palette.base} / ${palette.second} / ${palette.accent})`,
      `PATTERN:    ${pattern.name || pattern.id}`,
      `FORMAT:     Creature only — card frame rendered by frontend`
    ];
    if (mutation) {
      lines.push(`🧬 MUTATION: Tier ${mutation.tier} — ${mutation.primaryId} + ${mutation.secondaryId} [${mutation.splicedFeature}]`);
    }
    return lines.join('\n');
  }
};

// Export
if (typeof module !== 'undefined') module.exports = AumagePromptBuilder;
if (typeof window !== 'undefined') {
  window.AumagePromptBuilder = AumagePromptBuilder;
  console.log(`✅ Creature Engine v${ENGINE_VERSION} installed`);
}
