/**
 * Aumage — Sketch Prompt Builder
 *
 * Generates 3 secondary sketch prompts from the same visuals config
 * used for the main creature. Each sketch is a different angle/pose.
 *
 * Sketch style: delicate cyan-tinted technical line art on pale background,
 * like a naturalist's field sketch or blueprint study.
 */

const AumageSketchPrompts = {

  WORKER_URL: 'https://aumage-api.admin-it-e6e.workers.dev',

  // The 3 sketch types — always the same 3 per generation for consistency
  SKETCH_TYPES: [
    {
      id: 'rest',
      pose: 'The creature is curled up in a compact resting or sleeping pose, seen from slightly above.',
    },
    {
      id: 'head',
      pose: 'Close-up portrait of just the creature\'s head and upper shoulders, front-facing, showing eye detail and facial features.',
    },
    {
      id: 'profile',
      pose: 'Full body side-profile silhouette of the creature standing still, showing its complete outline and proportions.',
    },
  ],

  SKETCH_STYLE: [
    'Delicate technical line art illustration on a very pale blue-white background (#eaf4f6).',
    'Thin precise ink lines, minimal shading, naturalist field sketch quality.',
    'Slight cyan tint to all lines — like a blueprint or scientific illustration.',
    'Clean sparse linework — NOT painted, NOT colored, NOT rendered.',
    'The creature is drawn small, centered, with generous white space around it.',
    'No color fill. No background scenery. No frame. No text. No labels.',
    'Graceful minimal strokes, like a Miyazaki production sketch.',
  ].join(' '),

  NEGATIVE: 'color, painted, full color, vibrant, saturated, watercolor, background, scenery, frame, border, text, labels, watermark, signature',

  /**
   * Build a sketch prompt for one pose type.
   * Uses the same morphology/element/palette as the main creature
   * so it looks like the same species.
   */
  buildSketchPrompt(visuals, sketchType) {
    const morph = visuals.primary?.morph;
    const element = visuals.element?.primary;
    const palette = visuals.palette;

    const creatureDesc = morph?.prompt
      ? morph.prompt.split('.')[0]  // just the first sentence of the morphology
      : 'a fantastical creature';

    const colorHint = palette
      ? `${palette.base} coloring with ${palette.second} markings`
      : '';

    const elementHint = (visuals.element?.strength > 0.5 && element?.name)
      ? `with ${element.name} elemental qualities`
      : '';

    return [
      this.SKETCH_STYLE,
      sketchType.pose,
      `The subject is: ${creatureDesc}.`,
      colorHint,
      elementHint,
    ].filter(Boolean).join(' ');
  },

  /**
   * Fire all 3 sketch requests in parallel.
   * Returns array of 3 promises, each resolving to an image URL or null.
   */
  async fetchAll(visuals, seed, fingerprint) {
    return Promise.all(
      this.SKETCH_TYPES.map((type, i) =>
        this._fetchSketch(visuals, type, seed + i + 1, fingerprint)
      )
    );
  },

  async _fetchSketch(visuals, sketchType, seed, fingerprint) {
    try {
      const prompt = this.buildSketchPrompt(visuals, sketchType);
      console.log(`[Sketch] Firing ${sketchType.id} call, seed ${seed}`);
      const response = await fetch(this.WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negative_prompt: this.NEGATIVE,
          seed,
          mode: 'creature',
          fingerprint: fingerprint || 'sketch-' + seed,
          source: 'sketch',
        }),
      });
      const result = await response.json();
      if (result.error) { console.warn(`[Sketch] ${sketchType.id} failed:`, result.error); return null; }
      console.log(`[Sketch] ${sketchType.id} got URL:`, result.image_url?.substring(0,60));
      return result.image_url || null;
    } catch (e) {
      console.warn('Sketch fetch error:', e);
      return null;
    }
  },
};

if (typeof window !== 'undefined') window.AumageSketchPrompts = AumageSketchPrompts;
