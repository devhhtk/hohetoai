// ============================================================
// AUMAGE CREATURE ENGINE — COLORATION DATABASE
// 20 palettes, 55 color distribution patterns
// ============================================================

const AumageColoration = {

  // ----------------------------------------------------------
  // 20 COLOR PALETTES — each with 4 distinct colors
  // ----------------------------------------------------------
  PALETTES: [
    { idx: 0,  name: 'crimson_storm',     base: 'deep crimson red',       second: 'charcoal black',         accent: 'electric blue',              detail: 'white',          temp: 'warm' },
    { idx: 1,  name: 'solar_flare',       base: 'bright golden yellow',   second: 'burnt orange',           accent: 'hot magenta pink',           detail: 'black',          temp: 'warm' },
    { idx: 2,  name: 'jungle_canopy',     base: 'rich emerald green',     second: 'dark brown',             accent: 'bright yellow',              detail: 'cream',          temp: 'warm' },
    { idx: 3,  name: 'ocean_abyss',       base: 'deep navy blue',         second: 'teal green',             accent: 'bioluminescent cyan glow',   detail: 'pearl white',    temp: 'cool' },
    { idx: 4,  name: 'arctic_fox',        base: 'pure white',             second: 'pale ice blue',          accent: 'vivid coral pink',           detail: 'silver gray',    temp: 'cool' },
    { idx: 5,  name: 'volcanic_core',     base: 'obsidian black',         second: 'molten orange-red',      accent: 'bright sulfur yellow',       detail: 'ash gray',       temp: 'warm' },
    { idx: 6,  name: 'toxic_bloom',       base: 'neon lime green',        second: 'deep purple',            accent: 'hot pink',                   detail: 'bone white',     temp: 'neutral' },
    { idx: 7,  name: 'desert_monarch',    base: 'sandy gold',             second: 'rich burgundy',          accent: 'turquoise blue',             detail: 'ivory',          temp: 'warm' },
    { idx: 8,  name: 'twilight_orchid',   base: 'deep violet purple',     second: 'dusty rose pink',        accent: 'pale mint green',            detail: 'silver',         temp: 'cool' },
    { idx: 9,  name: 'coral_reef',        base: 'bright coral orange',    second: 'aquamarine blue',        accent: 'vivid yellow',               detail: 'white',          temp: 'warm' },
    { idx: 10, name: 'thunder_plum',      base: 'dark plum purple',       second: 'steel gray',             accent: 'lightning white',            detail: 'electric yellow', temp: 'cool' },
    { idx: 11, name: 'moss_and_rust',     base: 'sage green',             second: 'rusty terracotta',       accent: 'pale lavender',              detail: 'warm brown',     temp: 'neutral' },
    { idx: 12, name: 'candy_venom',       base: 'bright bubblegum pink',  second: 'electric lime',          accent: 'deep black',                 detail: 'white',          temp: 'neutral' },
    { idx: 13, name: 'glacial_sapphire',  base: 'icy sapphire blue',      second: 'frosty white',           accent: 'rose gold',                  detail: 'charcoal',       temp: 'cool' },
    { idx: 14, name: 'savanna_dusk',      base: 'warm tawny amber',       second: 'deep indigo',            accent: 'bright vermillion red',      detail: 'cream',          temp: 'warm' },
    { idx: 15, name: 'neon_depths',       base: 'dark teal',              second: 'neon magenta',           accent: 'electric cyan',              detail: 'black',          temp: 'cool' },
    { idx: 16, name: 'autumn_ember',      base: 'rich copper orange',     second: 'deep forest green',      accent: 'bright gold',                detail: 'dark brown',     temp: 'warm' },
    { idx: 17, name: 'phantom_silk',      base: 'ghostly pale gray',      second: 'deep midnight blue',     accent: 'luminous green',             detail: 'black',          temp: 'cool' },
    { idx: 18, name: 'tropical_parrot',   base: 'vivid scarlet red',      second: 'bright cobalt blue',     accent: 'sunny yellow',               detail: 'emerald green',  temp: 'warm' },
    { idx: 19, name: 'moonstone_dream',   base: 'iridescent pearl white', second: 'soft lavender',          accent: 'pale gold',                  detail: 'blush pink',     temp: 'cool' }
  ],

  // ----------------------------------------------------------
  // STANDARD PATTERNS (20) — available to most morphologies
  // ----------------------------------------------------------
  STANDARD_PATTERNS: [
    // Natural (10)
    { id: 'countershade',       name: 'Countershading',      prompt: 'Dark coloring on the back and top of the body, gradually transitioning to a much lighter or white underbelly and inner limbs.',                                                    complexity: [0, 0.5] },
    { id: 'spots',              name: 'Spotted',             prompt: 'Distinct rounded spots of a contrasting color scattered across the body. Spots vary slightly in size. Like a leopard or fawn.',                                                       complexity: [0.25, 0.75] },
    { id: 'stripes',            name: 'Striped',             prompt: 'Bold parallel stripes of alternating colors running across the body. Stripes follow the body contours. Like a tiger or zebra.',                                                       complexity: [0.25, 0.75] },
    { id: 'patches',            name: 'Patched',             prompt: 'Large irregular patches of two or three distinct colors, like a calico cat or pinto horse. Sharp boundaries between color zones.',                                                    complexity: [0.25, 0.75] },
    { id: 'gradient',           name: 'Gradient',            prompt: 'Color smoothly transitions from one hue at the head to a completely different hue at the tail. A full spectrum shift across the body length.',                                        complexity: [0, 0.5] },
    { id: 'rings',              name: 'Ringed',              prompt: 'Alternating bands of color encircle the body, tail, and limbs like a ring-tailed lemur or coral snake.',                                                                              complexity: [0.5, 1.0] },
    { id: 'dorsal_accent',      name: 'Dorsal Accent',       prompt: 'A bold stripe or crest of contrasting color running along the spine from head to tail tip. The rest of the body is a different color.',                                               complexity: [0.25, 0.75] },
    { id: 'mask',               name: 'Masked',              prompt: 'The face has dramatically different coloring from the body — a bold facial mask, eye patches, or muzzle marking. Like a raccoon or panda.',                                          complexity: [0.25, 0.75] },
    { id: 'tipped',             name: 'Tipped',              prompt: 'The extremities (ears, tail tip, paws/claws, horn tips, wing edges) are a vivid contrasting color while the body is a different base color. Like a Siamese cat.',                     complexity: [0, 0.5] },
    { id: 'speckled',           name: 'Speckled',            prompt: 'Hundreds of tiny contrasting flecks dusted across the body like freckles or a starry sky. Fine-grained color variation.',                                                             complexity: [0.25, 0.75] },
    // Fantastical (10)
    { id: 'biolum_veins',       name: 'Bioluminescent Veins', prompt: 'Glowing veins of bright contrasting color visible beneath the skin, tracing the circulatory system. The body is dark but lit from within by neon pathways.',                        complexity: [0.5, 1.0] },
    { id: 'elemental_fade',     name: 'Elemental Fade',      prompt: 'One half of the body is one element/color, the other half completely different. A sharp or smoky transition line divides them down the center.',                                      complexity: [0.5, 1.0] },
    { id: 'prismatic',          name: 'Prismatic',           prompt: 'The body refracts light into rainbow iridescence. Different angles reveal different colors. Holographic shimmer. Multiple colors visible simultaneously.',                             complexity: [0.75, 1.0] },
    { id: 'camo_shift',         name: 'Camo Shift',          prompt: 'Abstract organic camouflage shapes in 3-4 colors, like military camo but with vibrant unnatural colors instead of earth tones.',                                                     complexity: [0.5, 1.0] },
    { id: 'constellation',      name: 'Constellation',       prompt: 'Dark body covered in glowing pinpoint dots of light arranged in patterns, like stars in a night sky. Connected by faint luminous lines.',                                            complexity: [0.75, 1.0] },
    { id: 'circuit_trace',      name: 'Circuit Trace',       prompt: 'Geometric glowing lines trace across the body in precise angular patterns, like a circuit board. The lines are one color, the body another.',                                        complexity: [0.75, 1.0] },
    { id: 'marbled',            name: 'Marbled',             prompt: 'Colors swirl through the body like marble stone — two or three contrasting colors flowing and intertwining in organic veins throughout.',                                              complexity: [0.5, 1.0] },
    { id: 'sectioned',          name: 'Sectioned',           prompt: 'Distinct body regions are completely different colors — head one color, torso another, each limb a different shade. Like a living color wheel.',                                      complexity: [0.75, 1.0] },
    { id: 'warning_flash',      name: 'Warning Display',     prompt: 'Concealed bright warning colors on inner surfaces — under wings, inside mouth, belly folds. Mostly one color but reveals shocking contrast when opened.',                             complexity: [0.5, 1.0] },
    { id: 'crystalline_facets', name: 'Crystalline Facets',  prompt: 'Body surface divided into geometric faceted planes, each a slightly different shade or color, like a cut gemstone or stained glass.',                                                 complexity: [0.75, 1.0] }
  ],

  // ----------------------------------------------------------
  // TIER-SPECIFIC PATTERNS
  // ----------------------------------------------------------
  MICROBIAL_PATTERNS: [
    { id: 'translucent_glow',    name: 'Translucent Glow',    prompt: 'Semi-transparent body with internal structures glowing in contrasting colors. The cell membrane is one color, organelles another, nucleus another. Backlit stained glass organism.' },
    { id: 'fluorescent_stain',   name: 'Fluorescent Stain',   prompt: 'Vivid artificial-looking fluorescent colors as if stained with laboratory dyes. Bright neon green, electric blue, hot magenta — the colors of microscopy imaging.' },
    { id: 'iridescent_shell',    name: 'Iridescent Shell',    prompt: 'The outer shell or membrane shifts colors depending on angle — like an oil slick or soap bubble. Rainbow iridescence on a microscopic scale.' },
    { id: 'biolum_core',         name: 'Bioluminescent Core', prompt: 'A dark or translucent body with a single brilliant glowing core of light inside. The glow casts color onto the surrounding membrane from within.' },
    { id: 'mineral_lattice',     name: 'Mineral Lattice',     prompt: 'The shell is crystalline with geometric patterns in multiple colors. Each geometric section is a different mineral hue. A living kaleidoscope.' }
  ],

  ARTHROPOD_PATTERNS: [
    { id: 'warning_bands',     name: 'Warning Bands',     prompt: 'Bold alternating bands of high-contrast warning colors — black and yellow, red and black, orange and blue. Aposematic "I am dangerous" coloration.' },
    { id: 'metallic_sheen',    name: 'Metallic Sheen',    prompt: 'Intense metallic luster on the exoskeleton — iridescent greens, coppers, golds, deep metallic blues. Like polished metal or a jewel beetle. Color shifts with viewing angle.' },
    { id: 'eyespot',           name: 'Eyespot Display',   prompt: 'Large false eye patterns on wings or body — concentric rings of contrasting colors mimicking a much larger predator eyes. Bold and graphic.' },
    { id: 'leaf_mimic',        name: 'Leaf Mimic',        prompt: 'Body colored and textured to resemble a dead or living leaf — complete with vein patterns, brown edges, and irregular shapes. Even limbs look like stems.' },
    { id: 'chitin_gradient',   name: 'Chitin Gradient',   prompt: 'Exoskeleton smoothly shifts color from one segment to the next — head emerald, thorax teal, abdomen cyan. Each segment a step in the gradient.' },
    { id: 'segment_contrast',  name: 'Segment Contrast',  prompt: 'Each body segment or plate is a distinctly different color from its neighbors, creating a patchwork mosaic across the body. Bold and graphic.' },
    { id: 'wing_art',          name: 'Wing Art',          prompt: 'Wings display elaborate artistic patterns — complex geometric designs, fractal spirals, or intricate lacework in multiple contrasting colors. Body plain, wings are the canvas.' },
    { id: 'uv_fluorescent',    name: 'UV Fluorescent',    prompt: 'Parts of the exoskeleton fluoresce in vivid neon colors — electric blues, bright magentas, luminous greens — as if lit by blacklight. Glowing patches against darker body.' }
  ],

  MOLLUSK_PATTERNS: [
    { id: 'chromatophore_wave', name: 'Chromatophore Wave', prompt: 'Living color that moves. Waves of color pulse and ripple across the body surface in real-time, like a cuttlefish display. Multiple colors flow and shift hypnotically.' },
    { id: 'nacre_iridescence',  name: 'Mother of Pearl',   prompt: 'Deep iridescent nacre (mother-of-pearl) finish. Colors shift between pink, green, blue, and gold with viewing angle. Deep lustrous sheen with visible layered depth.' },
    { id: 'cerata_tips',        name: 'Cerata Tips',       prompt: 'Body is one color but dozens of external appendages (cerata, tentacles, gills) are each tipped with vivid contrasting color — like a Christmas tree of colored tips.' },
    { id: 'tessellation',       name: 'Tessellated Shell', prompt: 'Shell or body surface covered in precise geometric tessellating patterns — interlocking triangles, hexagons, or mazes in two or three contrasting colors. Mathematical beauty.' },
    { id: 'ink_cloud',          name: 'Ink Cloud',         prompt: 'Visible cloud of expelled ink or pigment surrounding the creature — dark purple, sepia, or bioluminescent blue billowing from the body. Partially obscured by own color.' },
    { id: 'transparent_organs', name: 'Transparent Body',  prompt: 'Mostly transparent or translucent body with vividly colored internal organs — bright orange digestive gland, purple gonad, red heart visible beating inside. Living anatomy lesson.' },
    { id: 'mantle_display',     name: 'Mantle Display',    prompt: 'Dramatic fleshy mantle unfurls to reveal hidden vivid colors on the inner surface — like opening a plain book to find illuminated manuscript pages. Exterior camouflaged, interior spectacular.' }
  ],

  DEEP_SEA_PATTERNS: [
    { id: 'biolum_array',         name: 'Bioluminescent Array',  prompt: 'Rows, clusters, or patterns of glowing photophore organs across the body, each a different color — blue, green, red, violet. A constellation of colored lights against dark body.' },
    { id: 'abyssal_red',          name: 'Abyssal Red',           prompt: 'Deep blood-red or maroon body — the color invisible in the deep sea. Camouflaged by its own colors absence. Only bioluminescent highlights reveal its shape.' },
    { id: 'transparent_abyss',    name: 'Transparent Abyss',     prompt: 'Almost completely transparent body. Only the eyes, gut, and gonads are visible as opaque colored structures floating in a glass-like body. A ghost made of water.' },
    { id: 'counter_illumination', name: 'Counter Illumination',  prompt: 'Belly lined with calibrated photophores matching faint light from above — the creature erases its own silhouette. From below invisible, from the side the belly glows in a gradient.' },
    { id: 'deep_chrome',          name: 'Deep Chrome',           prompt: 'Mirror-like reflective surface — deep metallic silver, chrome, or dark mercury. Reflects back whatever bioluminescence hits it, appearing to shift color based on surroundings.' }
  ],

  CARNIVOROUS_PLANT_PATTERNS: [
    { id: 'dewdrop_prismatic',  name: 'Dewdrop Prismatic',  prompt: 'Every surface covered in tiny spherical droplets each acting as a tiny lens, refracting light into rainbow micro-spectrums. Thousands of points of prismatic light. Living disco ball of morning dew.' },
    { id: 'venation',           name: 'Venation',           prompt: 'Bold contrasting veins through translucent flesh — dark red veins through pale green, or glowing blue through dark purple. Vascular system IS the pattern. Stained glass with visible leading.' },
    { id: 'lure_glow',          name: 'Lure Glow',          prompt: 'Predatory parts (trap interiors, tentacle tips, lures) are vivid neon warning colors — hot pink, electric yellow, luminous red — while structural parts are camouflaged green/brown.' },
    { id: 'digestive_gradient', name: 'Digestive Gradient', prompt: 'Visible color gradient from healthy living tissue at extremities (vibrant green) to darker sinister digestive zones (deep red, purple, black) at center. Life at edges, death at core.' }
  ],

  FISH_PATTERNS: [
    { id: 'lateral_stripe',  name: 'Lateral Stripe',  prompt: 'Bold horizontal stripe of contrasting color from snout to tail along the midline. Above and below the stripe are different colors.' },
    { id: 'scale_mosaic',    name: 'Scale Mosaic',    prompt: 'Each individual scale is a slightly different shade from its neighbors, creating a shimmering mosaic. Like tiny tiles in a Roman bath. Complex pointillist pattern.' },
    { id: 'fin_display',     name: 'Fin Display',     prompt: 'Body is relatively plain or dark, but fins are spectacular — vivid gradients, spots, stripes, or translucent color washes on every fin surface. Fins are the canvas, body is the frame.' },
    { id: 'neon_outline',    name: 'Neon Outline',    prompt: 'Bright neon-colored lines trace the edges of every fin, gill cover, jawline, and eye ring. Body interior is darker. The fish looks outlined in light, like a neon sign.' },
    { id: 'vertical_bars',   name: 'Vertical Bars',   prompt: 'Bold vertical bars of alternating colors from dorsal to ventral. Each bar is a distinct stripe. The fish looks like a barcode made of color.' },
    { id: 'dappled_light',   name: 'Dappled Light',   prompt: 'Body colored in broken patches of light and shadow, as if permanent dappled sunlight projected onto its surface. Mottled, organic, shifting — reef camouflage.' }
  ],

  // ----------------------------------------------------------
  // ACCENT PLACEMENT BY MORPHOLOGY TYPE
  // ----------------------------------------------------------
  ACCENT_PLACEMENTS: {
    vertebrate:        ['ear tips', 'tail tip', 'paw tips', 'muzzle', 'underbelly'],
    arthropod:         ['wing markings', 'leg joints', 'antennae tips', 'thorax plate', 'mandible edges'],
    mollusk:           ['tentacle tips', 'mantle edges', 'eye rings', 'shell rim', 'siphon'],
    fish:              ['fin edges', 'tail tip', 'gill covers', 'dorsal crest', 'pectoral fin base'],
    deep_sea:          ['photophore organs', 'lure tip', 'fin edges', 'eye rings', 'barbel tip'],
    carnivorous_plant: ['trap interiors', 'dewdrop tips', 'tendril ends', 'petal edges', 'lure structures'],
    microbial:         ['flagella tips', 'membrane edges', 'organelle spots', 'spine tips'],
    mythological:      ['horn tips', 'wing edges', 'tail blade', 'chest plate', 'eye glow'],
    hybrid:            ['growth tips', 'crystal facets', 'gas cloud edges', 'membrane rims'],
    intelligence_gated: ['circuit traces', 'visor glow', 'joint servos', 'chest panel', 'weapon tips']
  },

  // ----------------------------------------------------------
  // ANTI-MONOCHROME SAFEGUARD (appended to every creature prompt)
  // ----------------------------------------------------------
  ANTI_MONO: 'This creature displays at least 3 distinctly different colors on its body. The colors are NOT all shades of the same hue. There is clear visual contrast between the main body color, the secondary pattern color, and the accent highlights.',

  // ----------------------------------------------------------
  // FRAMING TEMPLATES
  // ----------------------------------------------------------
  FRAMING: {
    standard:     'Product photography on a pure white background. Studio lit, clean white backdrop.',
    dark_micro:   'Viewed as if through a high-powered microscope or electron microscope. Dramatic scientific lighting. The background is dark or gradient, not white. The organism floats in liquid or vacuum.',
    dark_deep:    'Set in the deep ocean abyss. Pitch-black background. The creature is the only light source — illuminated by its own bioluminescence. No sunlight. Particles of marine snow drift in the water.',
    dark_aquatic: 'Floating in dark water. Dramatic side-lighting reveals translucent body structures. Dark gradient background.'
  }
};

if (typeof module !== 'undefined') module.exports = AumageColoration;
if (typeof window !== 'undefined') window.AumageColoration = AumageColoration;
