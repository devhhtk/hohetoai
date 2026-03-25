/**
 * Aumage — Prompt Builder + Fingerprinting
 * Builds image generation prompts from visual descriptors.
 * Generates deterministic fingerprint + seed from features.
 *
 * CRITICAL: Prompts contain ONLY abstract visual descriptors.
 * NEVER real-world nouns that identify the sound source.
 */

const AumagePrompt = {

  STYLE_SUFFIX: 'High-end digital art, stylized and imaginative. ' +
    'Deep layered depth effect, feels three-dimensional. ' +
    'High detail, 4K quality, vivid and colorful. ' +
    'Rich color depth with visible brushwork. ' +
    'Not photorealistic — painterly and expressive with intentional imperfection.',

  NEGATIVE_PROMPT: 'text, watermark, signature, logo, words, letters, ' +
    'photograph of a real animal, stock photo, ' +
    'blurry, low quality, pixelated, jpeg artifacts, ' +
    'generic, bland, clipart, cartoon, anime, flat shading, ' +
    'human face, recognizable person, celebrity, ' +
    'brand logo, product placement, advertisement, ' +
    'thick rubbery skin, plastic looking, clay-like, smooth featureless surface, ' +
    'quilted texture, cracked mud, dried clay, pottery, ceramic, ' +
    'heavy wrinkled skin, elephant skin, rhino skin, crocodile skin, ' +
    'stitched together, sewn, patchwork, bumpy warts',

  STYLES: {
    realistic: 'High-end digital creature design with physically accurate material rendering. ' +
      'The creature is stylized and imaginative but its MATERIALS are hyperrealistic — ' +
      'fur looks like real fur you could touch, scales look like real scales, skin looks like real skin. ' +
      'Macro photography level of material detail. Subsurface scattering on skin, individual hair strands on fur. ' +
      'Deep layered depth effect, three-dimensional, 8K material texture quality. ' +
      'Vivid saturated colors with rich depth. Soft studio lighting with gentle shadows.',
    anime: 'Japanese anime art style. Bold black outlines, cel-shaded flat coloring, dramatic speed lines. ' +
      'Vibrant saturated colors, detailed anime illustration. Sharp clean linework. 2D illustration.',
    kawaii: 'Kawaii cute Japanese style. Chibi proportions with huge head and tiny body. ' +
      'Giant sparkly eyes with star reflections. Pastel colors, rounded soft shapes. Adorable and squeezable.',
    emoji: 'Emoji style icon. Simple bold shapes, flat bright colors, thick outlines. ' +
      'Minimal detail, instantly readable at small size. Round and compact. Single expression. Icon-like.',
    jelly: 'Made entirely of translucent colorful jelly or gummy candy. Glossy, wobbly, squishy looking. ' +
      'Light passes through the body casting colored shadows. Gummy bear texture. Delicious looking.',
    soundwave: 'Body dissolving and morphing into visible sound waves, frequency bars, and audio waveforms. ' +
      'Parts of the creature are becoming pure vibration energy. Equalizer bars emanating from the body.',
    roblox: 'Roblox game character style. Blocky low-poly shapes, bright flat colors, simple geometry. ' +
      'Cube-shaped head and body. Minimal facial features. Playful video game aesthetic.',
    claymation: 'Claymation stop-motion style. Made of real modeling clay with visible fingerprints and tool marks. ' +
      'Slightly lumpy and imperfect. Warm tactile feeling. Wallace and Gromit style craftsmanship.',
    sticker: 'Die-cut vinyl sticker design with thick clean white border around the entire creature. ' +
      'Flat graphic illustration style, bold colors, no background. Ready to peel and stick. Vector-clean edges.',
    pixel: 'Retro 16-bit pixel art sprite. Visible square pixels, limited color palette, crisp edges. ' +
      'Classic SNES or GBA era video game character. Nostalgic pixel-perfect rendering on white background.',
    watercolor: 'Delicate traditional watercolor painting. Soft wet-on-wet washes bleeding into each other. ' +
      'Visible paper texture and water blooms. Loose expressive brushstrokes. Gentle and artistic.',
    cyberpunk: 'Cyberpunk neon style on a DARK BLACK background. Glowing neon outlines in cyan, magenta, and electric purple. ' +
      'Holographic shimmer, circuit board patterns on skin, LED-lit eyes. Sci-fi futuristic. Dark moody atmosphere.',
    plushie: 'Stuffed animal plush toy made of soft fabric. Visible stitching and seams. Button eyes. ' +
      'Soft fleece or velvet texture, slightly overstuffed and puffy. Cuddly and huggable. Looks like a real toy you can buy.',
    darkfantasy: 'FANTASY CHARACTER ART with magical effects. Keep the creature EXACTLY as bright and colorful as it is. ' +
      'ADD these effects: glowing bioluminescent eyes emitting bright light, sparkle particles and light motes floating around the creature, ' +
      'subtle magical energy aura glowing around the body edges, crystalline or gem-like accents on the body that catch light. ' +
      'Replace the white background with a fantasy landscape in rich twilight blue and purple tones with volumetric light rays. ' +
      'The background should be softer and less saturated than the creature. The creature remains the brightest element in the image. ' +
      'Video game character art quality, like a creature spotlight in a fantasy RPG. 8K detail.'
  },

  // All augmentation style keys (excludes 'realistic' which is the default)
  AUGMENTATION_STYLES: ['anime', 'kawaii', 'emoji', 'jelly', 'soundwave', 'roblox', 'claymation', 'sticker', 'pixel', 'watercolor', 'cyberpunk', 'plushie', 'darkfantasy'],
  
  // Human-readable labels for UI buttons
  STYLE_LABELS: {
    anime: 'Anime',
    kawaii: 'Kawaii',
    emoji: 'Emoji-core',
    jelly: 'Jelly Art',
    soundwave: 'Soundwave Morph',
    roblox: 'Roblox',
    claymation: 'Claymation',
    sticker: 'Sticker',
    pixel: 'Pixel Art',
    watercolor: 'Watercolor',
    cyberpunk: 'Cyberpunk',
    plushie: 'Plushie',
    darkfantasy: '🌑 Dark Fantasy'
  },

  // Trope-specific dark fantasy environments
  _getDarkFantasyEnv(tropeKey) {
    const envs = {
      sonatrope: 'Background: crystalline cavern with glowing purple and blue crystals, visible sound wave energy rings in the air. ',
      terratrope: 'Background: ancient stone canyon with glowing amber mineral veins and warm magma light from below. ',
      aquatrope: 'Background: underwater scene with bioluminescent coral, soft cyan light rays filtering down from above. ',
      aerotrope: 'Background: floating sky islands with aurora borealis colors, soft clouds and starlight. ',
      lumitrope: 'Background: crystal palace with prismatic rainbow light refractions and golden floating particles. ',
      pyrotrope: 'Background: volcanic landscape with warm lava glow, ember particles, and orange-lit stone. ',
      primatrope: 'Background: enchanted forest with glowing mushrooms, fireflies, and soft green bioluminescent moss. ',
      megatrope: 'Background: epic mountain vista with dramatic clouds and lightning, vast sense of scale. '
    };
    return envs[tropeKey] || 'Background: fantasy landscape with soft atmospheric lighting and magical particles. ';
  },

  // Build augmentation prompt with background awareness
  buildAugmentPrompt(styleKey, tropeKey) {
    const styleLabel = this.STYLE_LABELS[styleKey];
    const styleDesc = this.STYLES[styleKey];
    const isDark = styleKey === 'darkfantasy' || styleKey === 'cyberpunk';
    const bgDirective = isDark ? 'Dark dramatic environment background, NOT white.' : 'White background.';
    const tropeFlavor = isDark ? this._getDarkFantasyEnv(tropeKey) : '';
    return `Take this exact creature and redraw it in ${styleLabel} style. Keep the exact same creature, same body shape, same number of limbs, same pose, same colors, same proportions. Only change the art style and rendering technique to: ${styleDesc} ${tropeFlavor}Do not change the creature itself. ${bgDirective}`;
  },

  /**
   * Pick N random augmentation styles
   */
  getRandomStyles(count) {
    const shuffled = [...this.AUGMENTATION_STYLES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  /**
   * Build prompt for a given mode + visual descriptors + art style.
   */
  build(mode, visuals, style) {
    this._activeStyle = this.STYLES[style] || this.STYLES.realistic;

    const builders = {
      creature: this._buildCreature,
      landscape: this._buildLandscape,
      abstract: this._buildAbstract
    };

    const builder = builders[mode];
    if (!builder) throw new Error(`Unknown mode: ${mode}`);

    return {
      prompt: builder.call(this, visuals),
      negative_prompt: this.NEGATIVE_PROMPT
    };
  },

  _buildCreature(v) {
    const { colors: c, form: f, texture: t, atmosphere: a, creatureDomain: d, evolution: e, intelligence: i, element: el, trope: tr } = v;
    
    // Gentle creatures get soft features, fierce ones get claws and teeth
    // Three tiers: fierce, neutral, gentle
    const isFierce = a.mood.includes('explosive') || a.mood.includes('fierce') || a.mood.includes('aggressive');
    const isNeutral = a.mood.includes('playful') || a.mood.includes('energetic');
    const isRough = t.material && /armored|bark|stone|scales|wiry|toad|chitin|plates/.test(t.material);
    // Trope-based aggression: terratrope, pyrotrope, megatrope lean tough
    const isToughTrope = v.trope && ['terratrope', 'pyrotrope', 'megatrope'].includes(v.trope.key);

    let softening;
    if (isFierce || isToughTrope) {
      softening = 'Sharp claws, fangs, spikes, or horns allowed. Intimidating posture. Fierce expression. ';
    } else if (isNeutral || isRough) {
      softening = 'Natural animal features — claws, teeth, and horns are fine if they look natural. Confident expression. ';
    } else {
      softening = 'Soft rounded paws or flippers. Friendly expressive face. ';
    }

    // Elemental description — only apply strongly if the score is high enough
    const elementDesc = el.strength > 0.55 ? `${el.primary.desc} ${el.primary.aura}. ` : '';
    const elementSkin = el.strength > 0.5 ? `${el.primary.skinMod}. ` : '';

    // Determine if this is a non-earth palette that needs anti-brown reinforcement
    const earthTones = ['fiery', 'volcanic', 'solar'];
    const needsColorForce = !earthTones.includes(c.temperature);
    const antiBrown = needsColorForce ? `The creature is NOT brown, NOT tan, NOT beige, NOT gray. ` : '';
    
    // TEXTURE FIRST — FLUX prioritizes early tokens
    const textureBlock = this._buildTextureBlock(t, el, elementSkin);

    // TROPE FLAVORING — shapes the creature's overall vibe
    const tropeFlavor = this._getTropeFlavor(tr?.key);

    return `A ${c.baseHues[0]} and ${c.baseHues[1]} colored creature. ${tropeFlavor}${textureBlock} ` +
      `${antiBrown}` +
      `Product photography on a pure white background, studio lit, clean white backdrop, soft shadows. ` +
      `${e.desc} ${e.scale} ` +
      `${d.desc}. ${d.body} ` +
      `${softening}` +
      `${i.desc} ${i.eyeDetail} ` +
      `${f.bodyComplexity} ` +
      `Its body exhibits ${f.baseForm} with ${f.edges}. ` +
      `It has a ${f.weight} build with ${f.detail}. ` +
      `The creature's form suggests ${f.motion}. It appears ${f.symmetry}. ` +
      `Color palette: ${c.saturation} ${c.temperature} tones — ` +
      `primarily ${c.baseHues.join(', ')} with striking ${c.accent} and ${c.secondaryAccent || c.accent} accents. ` +
      `The coloring is ${c.luminosity} with ${c.harmony}. ${c.colorDetail || ''} ${c.colorShift || ''} ` +
      `${elementDesc}` +
      `The creature has a ${a.mood} presence. ` +
      `Energy suggests ${a.arc}. ` +
      `${f.pose}. Full body visible on white background. ${this._activeStyle}`;
  },

  // Trope-specific prompt additions that shape the creature's look
  _getTropeFlavor(tropeKey) {
    const flavors = {
      sonatrope: 'This is an extremely rare, perfectly harmonious creature. Its body is symmetrical and elegant with flowing musical curves. Sound waves and frequency ripples are subtly visible across its surface. It radiates inner harmony and balance. Iridescent purple and violet shimmering tones. ',
      terratrope: 'This creature is grounded and sturdy, built close to the earth. Its body feels heavy and dense, like living stone or packed soil. Earthy natural tones dominate. ',
      aquatrope: 'This creature is fluid and graceful, as if shaped by water. Smooth flowing lines, glistening wet-look surfaces, and an aquatic elegance. Cool blue and teal tones shimmer across its body. ',
      aerotrope: 'This creature is light and airy, almost weightless. Wispy trailing features, translucent membranes, and a delicate ethereal quality. Pale soft colors like morning mist. ',
      lumitrope: 'This creature glows with inner light. Bioluminescent patches, crystalline features, and prismatic light refractions across its body. Warm golden and white radiance. ',
      pyrotrope: 'This creature radiates heat and intensity. Warm deep reds, oranges, and ember-like glowing accents. Its presence feels hot and powerful. ',
      primatrope: 'This is a tiny, simple, baby-like creature in its earliest form. Minimal features, wide innocent eyes, small and adorable. It looks newborn and vulnerable. ',
      megatrope: 'This is an enormous, powerful, awe-inspiring creature. Massive scale, commanding presence, complex evolved anatomy. It towers and dominates. '
    };
    return flavors[tropeKey] || '';
  },

  // Builds a focused, non-contradictory texture description
  // Uses macro photography language for realistic rendering
  _buildTextureBlock(t, el, elementSkin) {
    // Pick ONE primary material — don't layer contradictions
    const primaryMaterial = t.material;
    
    // Determine material category for rendering cues
    const isFurry = /fur|fleece|wool|coat|angora|cashmere|fluffy|silky/.test(primaryMaterial);
    const isScaly = /scale|chitin|exoskeleton|plates|pine cone/.test(primaryMaterial);
    const isFeathered = /feather|downy/.test(primaryMaterial);
    const isSkinned = /skin|hide|leather|dolphin|peach|jellyfish|toad/.test(primaryMaterial);

    let renderCues;
    if (isFurry) {
      renderCues = 'Every individual hair strand is visible and distinct. ' +
        'The fur has realistic depth with visible undercoat beneath the guard hairs. ' +
        'Light catches individual fibers creating a soft luminous edge. ' +
        'The fur looks touchably soft and naturally groomed. ';
    } else if (isScaly) {
      renderCues = 'Each individual scale is distinct with visible edges and micro-texture. ' +
        'Scales overlap precisely with thin shadow lines between them. ' +
        'Light reflects differently off each scale creating a mosaic of highlights. ';
    } else if (isFeathered) {
      renderCues = 'Individual feather barbs are visible with realistic micro-structure. ' +
        'Feathers overlap in natural rows with soft fluffy down visible underneath. ' +
        'Light passes through thin feather edges creating a translucent glow. ';
    } else if (isSkinned) {
      renderCues = 'Skin shows realistic subsurface scattering with light penetrating the surface. ' +
        'Natural skin texture with subtle pores and elasticity. ' +
        'Skin thickness varies naturally — thinner around eyes and joints. ';
    } else {
      renderCues = 'Surface has realistic material properties with accurate light interaction. ';
    }

    // Keep it tight: material + render cues + one detail line
    return `The creature is made of ${primaryMaterial}. ${renderCues}` +
      `${t.grain}. ${t.textureDetail}. ` +
      `${elementSkin ? elementSkin + ' ' : ''}`;
  },

  _buildLandscape(v) {
    const { colors: c, form: f, texture: t, atmosphere: a } = v;
    
    // Landscape-specific terrain types driven by the same features
    // but translated to landscape vocabulary
    const terrains = [
      'towering crystalline spires rising from a shattered plain',
      'massive sand dunes with razor-sharp ridges',
      'a vast fungal forest with mushroom canopies the size of mountains',
      'rolling hills of thick moss and grass stretching to the horizon',
      'jagged volcanic peaks with rivers of cooling lava between them',
      'an endless ocean of clouds viewed from above with islands poking through',
      'a frozen tundra with enormous ice formations and aurora overhead',
      'a bioluminescent swamp with glowing pools and twisted roots',
      'floating rock islands connected by natural stone bridges',
      'a desert of colored glass with prismatic light refractions',
      'ancient petrified forest turned to stone with mineral veins',
      'a coral reef landscape above water, massive and alien'
    ];
    
    // Use pitch class to pick terrain type (same as color palette index)
    const pitch = parseInt(c.baseHues.length) || 0;
    const terrainIdx = (v._pitchClass || Math.floor(Math.random() * 12)) % 12;
    
    return `An otherworldly alien landscape. ` +
      `The scene depicts ${terrains[terrainIdx]}. ` +
      `Color: ${c.saturation} ${c.temperature} atmosphere — ` +
      `dominated by ${c.baseHues.join(', ')} with ${c.accent} and ${c.secondaryAccent || c.accent} highlights. ` +
      `Scene is ${c.luminosity} with ${c.harmony}. ${c.colorDetail || ''} ${c.colorShift || ''} ` +
      `Atmosphere is ${a.mood}. ${a.lighting}. ` +
      `Environment feels like ${a.environment}. Scene conveys ${a.arc}. ` +
      `Wide panoramic composition, deep perspective, vast scale. ` +
      `No people, no animals, no man-made structures. ${this._activeStyle}`;
  },

  _buildAbstract(v) {
    const { colors: c, form: f, atmosphere: a } = v;
    
    // Abstract-specific shape language — NO biological terms
    const shapes = [
      'swirling concentric circles and spirals',
      'sharp angular lines intersecting at dramatic angles',
      'soft gradient blobs floating and overlapping',
      'dense stippled dots forming patterns like pointillism',
      'thick bold brushstrokes layered over each other',
      'geometric triangles and polygons tessellating',
      'flowing liquid ribbons of color weaving through space',
      'explosive splatter and drip patterns like action painting',
      'smooth undulating waves and curves',
      'cracked mosaic fragments with color bleeding between gaps',
      'layered transparent color fields overlapping like stained glass',
      'organic amorphous shapes like ink dropped in water'
    ];
    
    const shapeIdx = (v._pitchClass || 0) % 12;
    
    return `Pure abstract art on a white background. Absolutely no creatures, no animals, no faces, no figures, no objects. ` +
      `Visual composition of ${shapes[shapeIdx]}. ` +
      `Color: ${c.saturation} ${c.temperature} palette — ` +
      `${c.baseHues.join(', ')} with ${c.accent} and ${c.secondaryAccent || c.accent}. ` +
      `${c.luminosity} with ${c.harmony}. ${c.colorDetail || ''} ${c.colorShift || ''} ` +
      `Emotional register: ${a.mood}. ${a.lighting}. ` +
      `Non-representational. No faces, figures, objects, eyes, or text. ` +
      `Pure visual energy and emotion. ${this._activeStyle}`;
  },

  // ============================================================
  // FINGERPRINTING — deterministic seed from features
  // ============================================================

  /**
   * Generate a stable fingerprint hash from audio features.
   * Same audio → same fingerprint → same visual output.
   */
  generateFingerprint(features) {
    const stableKeys = [
      'spectral_centroid_mean', 'spectral_flatness_mean',
      'spectral_rolloff_mean', 'tempo',
      'harmonic_ratio', 'percussive_ratio',
      'dominant_pitch_class', 'brightness', 'warmth',
      'complexity', 'roughness', 'intensity'
    ];

    const values = stableKeys.map(k => {
      const v = features[k] || 0;
      return typeof v === 'number' ? Math.round(v * 10000) / 10000 : v;
    });

    return this._sha256(JSON.stringify(values));
  },

  /**
   * Convert fingerprint to numerical seed for image gen.
   */
  fingerprintToSeed(fingerprint) {
    // Use first 12 hex chars as integer seed
    return parseInt(fingerprint.substring(0, 12), 16);
  },

  /**
   * SHA-256 hash (browser native crypto API).
   */
  async _sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

window.AumagePrompt = AumagePrompt;
