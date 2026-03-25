// ============================================================
// AUMAGE CREATURE ENGINE — MORPHOLOGY DATABASE
// 79 morphologies across 10 tiers
// ============================================================

const AumageMorphologies = {

  // ----------------------------------------------------------
  // TIER: MICROBIAL (8) — single-cell / primitive only
  // ----------------------------------------------------------
  bacterium: {
    tier: 'microbial', name: 'Bacterium',
    prompt: 'A single microscopic organism. A simple rounded or rod-shaped cell body with a translucent membrane wall. One or more thin whip-like flagella extend from the body for propulsion. No eyes, no face. Internal structures faintly visible through the semi-transparent cell wall. Viewed as if under a microscope with dramatic lighting.',
    domain: { aerial: 0, aquatic: 0.4, terrestrial: 0.3, insectoid: 0, subterranean: 0.3, classic: 0.3 },
    evolution: ['single-cell', 'primitive'],
    framing: 'dark_micro',
    donations: { head: 'Smooth featureless dome head with no face', limbs: 'Whip-like flagella replacing limbs', surface: 'Translucent cell-membrane skin wrapping the body', tail: 'Long single flagellum tail', pattern: 'Internal organelles visible through translucent skin' }
  },
  virus: {
    tier: 'microbial', name: 'Virus',
    prompt: 'A microscopic geometric structure — not a living creature but an intricate protein machine. Its body is a precise icosahedral (20-sided) capsid shell with geometric faceted surfaces. Thin spider-like landing legs extend beneath. A central injection spike or crown of protein spikes protrude from the top. Symmetrical, angular, alien, and beautiful. Viewed as if through an electron microscope.',
    domain: { aerial: 0, aquatic: 0.3, terrestrial: 0.3, insectoid: 0, subterranean: 0.2, classic: 0.4 },
    evolution: ['single-cell', 'primitive'],
    framing: 'dark_micro',
    donations: { head: 'Geometric icosahedral head capsid', limbs: 'Spider-like injection legs', surface: 'Faceted geometric protein shell plating', tail: 'Injection spike tail', pattern: 'Geometric faceted surface pattern' }
  },
  amoeba: {
    tier: 'microbial', name: 'Amoeba',
    prompt: 'A shapeless translucent blob of living gel. Its body has no fixed form — pseudopod extensions reach outward in multiple directions like slow-motion splashes. Internal organelles are visible as darker spots and bubbles floating inside the transparent body. It looks wet, alive, and constantly shifting. Microscopic scale.',
    domain: { aerial: 0, aquatic: 0.5, terrestrial: 0.3, insectoid: 0, subterranean: 0.3, classic: 0.3 },
    evolution: ['single-cell', 'primitive'],
    framing: 'dark_micro',
    donations: { head: 'Shapeless blob head that constantly shifts', limbs: 'Pseudopod extensions replacing limbs', surface: 'Gelatinous translucent skin with visible internal structures', tail: 'Trailing pseudopod mass', pattern: 'Flowing internal color currents visible through transparent body' }
  },
  diatom: {
    tier: 'microbial', name: 'Diatom',
    prompt: 'A microscopic organism encased in an impossibly intricate geometric glass shell. The shell is made of translucent silica with elaborate symmetrical patterns — radial spokes, honeycomb lattices, and delicate perforations. It looks like a tiny jeweled spacecraft or a living stained-glass window. Perfectly symmetrical. Stunning geometric detail.',
    domain: { aerial: 0, aquatic: 0.6, terrestrial: 0.1, insectoid: 0, subterranean: 0.1, classic: 0.4 },
    evolution: ['single-cell', 'primitive'],
    framing: 'dark_micro',
    donations: { head: 'Intricate geometric glass-shell head crest', surface: 'Ornate silica glass armor with geometric perforations', pattern: 'Symmetrical geometric lattice pattern across body' }
  },
  tardigrade: {
    tier: 'microbial', name: 'Tardigrade',
    prompt: 'A plump microscopic creature with a barrel-shaped segmented body and eight stubby clawed legs. Its body is translucent and you can see internal organs through the skin. A round head with a tiny circular mouth. Stubby and adorable despite being microscopic. It looks indestructible and weirdly cute. Viewed under magnification.',
    domain: { aerial: 0, aquatic: 0.3, terrestrial: 0.4, insectoid: 0.2, subterranean: 0.3, classic: 0.4 },
    evolution: ['single-cell', 'primitive'],
    framing: 'dark_micro',
    donations: { head: 'Cute round tardigrade face with tiny circular mouth', limbs: 'Eight stubby clawed tardigrade legs', surface: 'Plump translucent tardigrade skin', pattern: 'Translucent body showing internal organs' }
  },
  phage: {
    tier: 'microbial', name: 'Bacteriophage',
    prompt: 'A microscopic biological machine with a precise geometric icosahedral head sitting atop a rigid cylindrical tail shaft. At the base, six articulated spider-like tail fibers splay outward as landing gear. A baseplate connects the tail to the fibers. It looks like an alien lunar lander designed by a mathematician. Crystalline and mechanical despite being organic.',
    domain: { aerial: 0, aquatic: 0.3, terrestrial: 0.3, insectoid: 0.2, subterranean: 0.2, classic: 0.4 },
    evolution: ['single-cell', 'primitive'],
    framing: 'dark_micro',
    donations: { head: 'Geometric icosahedral head on a stalk neck', limbs: 'Six articulated spider-fiber legs', tail: 'Rigid cylindrical tail shaft' }
  },
  radiolarian: {
    tier: 'microbial', name: 'Radiolarian',
    prompt: 'A single-celled organism with a breathtaking internal skeleton of mineral spines radiating outward in perfect symmetry like a living sea urchin crossed with a snowflake. Its central body is a sphere of translucent protoplasm. Hundreds of impossibly thin needle-like spines project outward in geometric patterns. Microscopic but monumentally beautiful.',
    domain: { aerial: 0.1, aquatic: 0.5, terrestrial: 0.1, insectoid: 0, subterranean: 0.1, classic: 0.5 },
    evolution: ['single-cell', 'primitive'],
    framing: 'dark_micro',
    donations: { head: 'Radiating crown of mineral needle-spines from the head', limbs: 'Radiating needle-spine limbs', surface: 'Mineral spine-covered surface', pattern: 'Radiating geometric spine pattern' }
  },
  colonial_micro: {
    tier: 'microbial', name: 'Colonial Microbe',
    prompt: 'A colony of dozens of identical microscopic cells arranged in a perfect geometric formation — a hollow sphere, a flat disc, or a spiraling chain. Each individual cell is simple and round, but together they form an emergent macro-structure. Some cells are slightly larger or differently colored, suggesting specialization. The colony rotates slowly as a unit. Translucent and ethereal.',
    domain: { aerial: 0.1, aquatic: 0.5, terrestrial: 0.2, insectoid: 0.1, subterranean: 0.1, classic: 0.4 },
    evolution: ['single-cell', 'primitive'],
    framing: 'dark_micro',
    donations: { head: 'Head is a cluster of tiny identical units', limbs: 'Limbs made of swarming micro-units', surface: 'Surface covered in tiny colonial organisms', tail: 'Trailing cloud of individual units', pattern: 'Living mosaic of tiny individual cells' }
  },

  // ----------------------------------------------------------
  // TIER: VERTEBRATE / OTHER (9) — primitive+
  // ----------------------------------------------------------
  quadruped: {
    tier: 'vertebrate', name: 'Quadruped',
    prompt: 'A four-legged creature with a horizontal spine. Its legs are sturdy and evenly spaced, supporting a compact body. Its head extends forward on a flexible neck.',
    domain: { aerial: 0.1, aquatic: 0.2, terrestrial: 1.0, insectoid: 0.1, subterranean: 0.5, classic: 0.9 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Forward-facing mammalian head on a flexible neck', limbs: 'Four sturdy evenly-spaced legs', surface: 'Furred or scaled vertebrate skin', tail: 'Muscular expressive tail' }
  },
  biped: {
    tier: 'vertebrate', name: 'Biped',
    prompt: 'A two-legged upright creature. Its torso is vertical with two arms or forelimbs free for manipulation. It stands balanced on powerful hind legs.',
    domain: { aerial: 0.2, aquatic: 0.1, terrestrial: 0.9, insectoid: 0.1, subterranean: 0.4, classic: 1.0 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Upright expressive face with forward-facing eyes', limbs: 'Two manipulating arms and two powerful standing legs', surface: 'Smooth or furred upright body skin' }
  },
  serpentine: {
    tier: 'vertebrate', name: 'Serpentine',
    prompt: 'A long sinuous creature with no legs. Its body is one continuous muscular form that coils and undulates. It moves with fluid lateral motion.',
    domain: { aerial: 0.3, aquatic: 0.8, terrestrial: 0.7, insectoid: 0.2, subterranean: 0.9, classic: 0.6 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Sleek wedge-shaped head with lidless eyes', surface: 'Smooth scaled serpentine skin', tail: 'Long tapering muscular tail that IS the body' }
  },
  avian: {
    tier: 'vertebrate', name: 'Avian',
    prompt: 'A winged creature with a lightweight skeletal frame. Broad wings extend from its torso. Its body is aerodynamic and compact, built for flight.',
    domain: { aerial: 1.0, aquatic: 0.1, terrestrial: 0.3, insectoid: 0.3, subterranean: 0.0, classic: 0.5 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Sleek aerodynamic head with sharp beak and keen eyes', limbs: 'Two powerful wings and two lightweight legs', surface: 'Layered feathered plumage', tail: 'Fanned tail feathers for steering', wings: 'Broad feathered wings with visible primary flight feathers' }
  },
  radial: {
    tier: 'vertebrate', name: 'Radial',
    prompt: 'A radially symmetric creature — its body radiates outward from a central point. Multiple identical arms or rays extend in a star pattern. No clear front or back.',
    domain: { aerial: 0.3, aquatic: 0.9, terrestrial: 0.2, insectoid: 0.1, subterranean: 0.2, classic: 0.5 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { limbs: 'Multiple identical radiating star-pattern arms', surface: 'Textured radial body with tube feet', pattern: 'Perfect radial symmetry pattern' }
  },
  colonial: {
    tier: 'vertebrate', name: 'Colonial',
    prompt: 'A creature that is actually many small organisms acting as one. Hundreds of tiny units cluster together forming a macro-body. Parts can detach and reattach. The edges are fuzzy and shifting.',
    domain: { aerial: 0.4, aquatic: 0.7, terrestrial: 0.3, insectoid: 0.5, subterranean: 0.4, classic: 0.4 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Head is a dense cluster of tiny cooperating units', limbs: 'Limbs formed by columns of tiny units', surface: 'Crawling shifting surface of individual organisms', tail: 'Dispersing trail of individual units', pattern: 'Swarming mosaic texture' }
  },
  vermiform: {
    tier: 'vertebrate', name: 'Vermiform',
    prompt: 'A segmented worm-like creature. Its body is a long chain of repeating ring segments. Each segment may have tiny paired appendages. It moves by sequential contractions.',
    domain: { aerial: 0.1, aquatic: 0.4, terrestrial: 0.5, insectoid: 0.7, subterranean: 1.0, classic: 0.3 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { surface: 'Segmented ringed body armor', tail: 'Long segmented worm body trailing behind', pattern: 'Repeating ring segment pattern' }
  },
  arboreal: {
    tier: 'vertebrate', name: 'Arboreal',
    prompt: 'A long-limbed creature built for climbing. Its limbs are disproportionately long with gripping hands/feet. A prehensile tail curls behind it. Large forward-facing eyes.',
    domain: { aerial: 0.5, aquatic: 0.1, terrestrial: 0.8, insectoid: 0.3, subterranean: 0.1, classic: 0.6 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Large-eyed primate-like face with forward vision', limbs: 'Disproportionately long gripping limbs with prehensile digits', tail: 'Curling prehensile tail' }
  },
  amphibian: {
    tier: 'vertebrate', name: 'Amphibian',
    prompt: 'A moist-skinned creature with smooth glistening skin showing no scales or fur. Large bulging eyes sit atop a wide flat head. Webbed feet with long toes. A wide mouth. Compact stocky body with powerful hind legs built for leaping. Visible throat pouch.',
    domain: { aerial: 0.0, aquatic: 0.7, terrestrial: 0.7, insectoid: 0.1, subterranean: 0.4, classic: 0.5 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Wide flat head with bulging eyes on top and wide mouth', limbs: 'Webbed feet with long toes and powerful jumping hind legs', surface: 'Smooth moist glistening scaleless skin', pattern: 'Mottled wet-skin camouflage pattern' }
  },

  // ----------------------------------------------------------
  // TIER: ARTHROPOD (10) — primitive+
  // ----------------------------------------------------------
  beetle: {
    tier: 'arthropod', name: 'Beetle',
    prompt: 'A heavily armored insect creature with a thick rounded shell covering its back. Hard wing cases (elytra) protect folded flight wings beneath. A broad head with prominent mandibles or horns. Six sturdy jointed legs with gripping claws. The body has a tank-like solidity — compact, dense, and powerfully built. Glossy exoskeleton with visible plate segments.',
    domain: { aerial: 0.3, aquatic: 0.1, terrestrial: 0.8, insectoid: 1.0, subterranean: 0.6, classic: 0.5 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Broad armored beetle head with mandibles', limbs: 'Six sturdy jointed beetle legs', surface: 'Hard glossy elytra shell covering the back', wings: 'Hidden flight wings beneath elytra', pattern: 'Metallic exoskeleton sheen' }
  },
  lepidoptera: {
    tier: 'arthropod', name: 'Lepidoptera',
    prompt: 'A delicate winged insect creature with two pairs of enormous elaborate wings that dwarf its small furry body. The wings are broad, flat, and covered in intricate patterns. A small round head with large compound eyes and feathery or clubbed antennae. A curled proboscis tucked beneath the head. The body is soft and fuzzy. Six thin delicate legs.',
    domain: { aerial: 0.9, aquatic: 0.0, terrestrial: 0.5, insectoid: 1.0, subterranean: 0.1, classic: 0.4 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Round fuzzy head with feathery antennae and coiled proboscis', limbs: 'Six delicate thin legs', surface: 'Fine fuzzy scale-covered skin', wings: 'Enormous elaborate patterned butterfly wings', pattern: 'Intricate wing-pattern coloring across body' }
  },
  mantid: {
    tier: 'arthropod', name: 'Mantid',
    prompt: 'An elongated insect predator with a distinctive triangular head that swivels freely on a long neck-like prothorax. Two massive raptorial forelegs folded in a prayer position, lined with spines for grasping prey. Large bulging compound eyes with visible pseudo-pupils that seem to track the viewer. A long slender body with four walking legs and folded wings along the back. Alert, still, and menacing.',
    domain: { aerial: 0.3, aquatic: 0.0, terrestrial: 0.8, insectoid: 1.0, subterranean: 0.2, classic: 0.5 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Triangular swiveling mantis head with huge tracking eyes', limbs: 'Raptorial grasping forelegs with spines', wings: 'Folded mantis wings along the back' }
  },
  hymenoptera: {
    tier: 'arthropod', name: 'Hymenoptera',
    prompt: 'An insect creature with a dramatically narrow waist connecting its thorax to a bulbous, segmented abdomen. A compact head with large compound eyes, short bent antennae, and strong mandibles. Two pairs of transparent membranous wings with visible veining. The body is sleek and aerodynamic. Six jointed legs.',
    domain: { aerial: 0.8, aquatic: 0.0, terrestrial: 0.6, insectoid: 1.0, subterranean: 0.3, classic: 0.5 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Compact wasp head with bent antennae and mandibles', limbs: 'Six wasp legs', surface: 'Smooth wasp-like chitinous exoskeleton', tail: 'Bulbous segmented stinger abdomen', wings: 'Transparent veined wasp wings', pattern: 'Bold warning-band stripes' }
  },
  odonata: {
    tier: 'arthropod', name: 'Odonata',
    prompt: 'An aerial insect predator with an enormously long slender abdomen extending behind it like a tail. Four large independent wings spread outward — transparent with intricate geometric vein networks. A massive head dominated almost entirely by two enormous compound eyes that wrap around and nearly touch. Six legs bunched forward in a basket formation. Built for speed and aerial agility.',
    domain: { aerial: 1.0, aquatic: 0.3, terrestrial: 0.3, insectoid: 0.9, subterranean: 0.0, classic: 0.4 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Massive compound-eye dominated dragonfly head', limbs: 'Six legs bunched in forward basket', tail: 'Enormously long slender dragonfly abdomen', wings: 'Four independent transparent geometric-veined wings' }
  },
  arachnid: {
    tier: 'arthropod', name: 'Arachnid',
    prompt: 'An eight-legged creature with two distinct body segments — a compact front cephalothorax and a larger rounded abdomen connected by a narrow stalk. Multiple small eyes clustered on the front of the head in an asymmetric pattern. Fangs (chelicerae) visible beneath the eyes. Long articulated legs with multiple joints, ending in tiny claws. Silk spinnerets visible at the abdomen tip.',
    domain: { aerial: 0.1, aquatic: 0.1, terrestrial: 0.9, insectoid: 0.9, subterranean: 0.7, classic: 0.6 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Cluster of multiple eyes on a compact head, visible fangs', limbs: 'Eight long articulated spider legs', tail: 'Bulbous silk-producing abdomen with spinnerets' }
  },
  myriapod: {
    tier: 'arthropod', name: 'Myriapod',
    prompt: 'A long segmented creature with dozens of identical body segments, each bearing one or two pairs of legs. The legs create a rippling wave pattern along the body when in motion. A distinct head with antennae, mandibles, and simple eyes. The body can curl into a defensive spiral. Each segment is armored with a chitinous plate.',
    domain: { aerial: 0.0, aquatic: 0.1, terrestrial: 0.7, insectoid: 0.8, subterranean: 1.0, classic: 0.4 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Blunt head with antennae and mandibles', limbs: 'Dozens of paired legs in wave-motion rows', surface: 'Segmented chitinous armor plates in rows', tail: 'Long segmented tail of repeating leg-bearing segments', pattern: 'Repeating segment pattern' }
  },
  crustacean_arthro: {
    tier: 'arthropod', name: 'Crustacean',
    prompt: 'An armored creature with a hard segmented carapace. Jointed legs extend beneath a broad shell. Two large asymmetric claws — one massive crusher, one smaller cutter. Stalked turret eyes. Antennae sweep forward. Low-slung body built close to the ground.',
    domain: { aerial: 0.0, aquatic: 0.9, terrestrial: 0.5, insectoid: 0.7, subterranean: 0.4, classic: 0.4 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Stalked turret eyes and sweeping antennae', limbs: 'Multiple walking legs plus two large asymmetric claws', surface: 'Hard barnacle-encrusted carapace shell', pattern: 'Encrusted rough shell texture' }
  },
  scorpionid: {
    tier: 'arthropod', name: 'Scorpionid',
    prompt: 'A low-bodied armored predator with a broad flat cephalothorax, two large pincer claws held forward, and a long segmented tail that curves upward and over the back ending in a bulbous stinger. Eight walking legs spread wide for stability. Multiple small eyes glint on the head. Tough chitinous armor plates.',
    domain: { aerial: 0.0, aquatic: 0.0, terrestrial: 0.9, insectoid: 0.9, subterranean: 0.8, classic: 0.5 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Flat head with multiple small eyes and pedipalps', limbs: 'Eight legs plus two large pincer claws', surface: 'Tough chitinous armor plating', tail: 'Long segmented tail curving up to a bulbous stinger', pattern: 'Armored plate segmentation' }
  },
  colonial_insect: {
    tier: 'arthropod', name: 'Colonial Insect',
    prompt: 'Not a single creature but a visible swarm of hundreds of small identical insects moving as one unified organism. The swarm holds a coherent shape — roughly creature-like — as individual insects circulate within it. Dense at the core, sparse at the edges. The swarm moves and turns as a single intelligence.',
    domain: { aerial: 0.9, aquatic: 0.2, terrestrial: 0.6, insectoid: 1.0, subterranean: 0.3, classic: 0.4 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Head is a dense cluster of swarming insects', limbs: 'Limbs are columns of swarming insects holding shape', surface: 'Surface is a crawling layer of individual insects', tail: 'Trailing dispersing swarm tail', wings: 'Swarm cloud forming wing shapes', pattern: 'Shifting buzzing surface texture' }
  },

  // ----------------------------------------------------------
  // TIER: MOLLUSK (10) — primitive+ with per-type gating
  // ----------------------------------------------------------
  nudibranch: {
    tier: 'mollusk', name: 'Nudibranch',
    prompt: 'A soft-bodied shell-less sea creature with an impossibly ornate body. Elaborate frilled gills (cerata) extend from its back like feathery plumes, ruffled fans, or branching tree-like structures. Rhinophores (sensory horns) rise from its head. Its body is smooth and flowing with no hard edges. Every surface is vividly colored in complex patterns. It moves by rippling its flat muscular foot. Ethereal and alien.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.1, classic: 0.4 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Rhinophore horns and elaborate cerata gill crown on head', surface: 'Smooth nudibranch skin with elaborate external gill cerata', wings: 'Cerata frills along sides like ruffled fins', pattern: 'Vivid nudibranch color riot' }
  },
  bivalve: {
    tier: 'mollusk', name: 'Bivalve',
    prompt: 'A creature enclosed between two hard shell halves that hinge open to reveal a fleshy mantle interior. The shells are ridged, layered, and textured with growth rings. When open, a colorful fleshy mantle is visible with rows of tiny jewel-like eyes along the mantle edge. Sensory tentacles fringe the opening. The interior surface is smooth iridescent mother-of-pearl.',
    domain: { aerial: 0.0, aquatic: 0.9, terrestrial: 0.2, insectoid: 0.0, subterranean: 0.3, classic: 0.3 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { surface: 'Two hinged shell halves encasing the torso', pattern: 'Mother-of-pearl nacre iridescence' }
  },
  nautiloid: {
    tier: 'mollusk', name: 'Nautiloid',
    prompt: 'A creature living inside a large spiraling chambered shell with a perfect logarithmic spiral cross-section. The shell is smooth with elegant brown-and-cream tiger stripe patterns. From the shell opening, dozens of thin smooth tentacles extend outward. Two large primitive eyes with pinhole pupils peer out. A fleshy hood partially covers the shell opening.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.2, classic: 0.5 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Spiral chambered shell encasing the head', limbs: 'Dozens of smooth ridged tentacles', surface: 'Smooth shell with tiger-stripe patterning', pattern: 'Nautilus stripe pattern' }
  },
  chiton: {
    tier: 'mollusk', name: 'Chiton',
    prompt: 'A broad oval creature clinging flat to a surface. Its back is armored with eight overlapping articulated shell plates arranged in a row down the spine, allowing the body to flex and even curl into a ball. A tough leathery girdle surrounds the plates. Underneath, a broad muscular foot grips the surface. Tiny eyes embedded in the shell plates themselves — hundreds of pinpoint mineral lenses. Low, flat, ancient.',
    domain: { aerial: 0.0, aquatic: 0.7, terrestrial: 0.4, insectoid: 0.1, subterranean: 0.5, classic: 0.3 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { surface: 'Eight overlapping articulated armor plates down the spine', pattern: 'Segmented plate armor with embedded pinhole eyes' }
  },
  sea_angel: {
    tier: 'mollusk', name: 'Sea Angel',
    prompt: 'A small translucent creature that swims by flapping two wing-like lobes (parapodia) extending from its body — it flies through water like an underwater angel. Its body is mostly transparent, revealing internal organs as colorful shapes visible through glass-like skin. A tiny head with small horns. The wing-lobes are delicate and membranous, beating in slow rhythmic strokes. Ethereal, fragile, and otherworldly.',
    domain: { aerial: 0.5, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.0, classic: 0.4 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'dark_aquatic',
    donations: { head: 'Tiny horned translucent head', surface: 'Completely transparent body showing organs', wings: 'Two wing-like parapodia lobes for swimming/flying', pattern: 'Transparent with vivid internal organs' }
  },
  cone_snail: {
    tier: 'mollusk', name: 'Cone Snail',
    prompt: 'A creature with a perfectly conical tapering shell covered in intricate geometric patterns — tessellated triangles, maze-like lines, and dot patterns in contrasting colors. From the shell opening, a fleshy body extends with a visible siphon tube and a long retractable proboscis — a hidden biological harpoon. Two stalked eyes peer forward. Beautiful and quietly lethal.',
    domain: { aerial: 0.0, aquatic: 0.8, terrestrial: 0.3, insectoid: 0.0, subterranean: 0.3, classic: 0.4 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Conical tapering shell helmet', limbs: 'Retractable harpoon proboscis arm', surface: 'Geometric-patterned conical shell covering', pattern: 'Intricate geometric tessellation pattern' }
  },
  giant_squid: {
    tier: 'mollusk', name: 'Giant Squid',
    prompt: 'An enormous deep-sea cephalopod with a torpedo-shaped mantle body, two massive dinner-plate-sized eyes that glow with bioluminescence. Eight thick muscular arms covered in toothed suckers surround a sharp beak. Two longer tentacles extend far beyond the arms, ending in club-shaped pads lined with swiveling hooks. The skin shifts color in waves. Fins at the mantle tip steer like rudders. Colossal and abyssal.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.4, classic: 0.5 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'dark_deep',
    donations: { head: 'Massive head with dinner-plate bioluminescent eyes', limbs: 'Eight suckered arms plus two long tentacle clubs', surface: 'Color-shifting chromatophore skin', wings: 'Mantle fins at the rear', pattern: 'Rippling chromatophore color waves' }
  },
  slug_hybrid: {
    tier: 'mollusk', name: 'Slug Hybrid',
    prompt: 'A large terrestrial slug creature with no shell — its entire body is exposed soft muscular tissue. A prominent mantle shield covers the head region. Two pairs of tentacles: upper optical tentacles with eyes at the tips, lower sensory tentacles near the mouth. The body surface is covered in wrinkles, ridges, and mucus-glistening folds. A single rippling muscular foot underneath. A slime trail glistens behind it.',
    domain: { aerial: 0.0, aquatic: 0.3, terrestrial: 0.8, insectoid: 0.1, subterranean: 0.7, classic: 0.5 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Soft expressive slug face with optical tentacles', surface: 'Glistening mucus-covered wrinkled skin', tail: 'Slime-trailing tapered body', pattern: 'Wet glistening mucus sheen' }
  },
  gastropod: {
    tier: 'mollusk', name: 'Gastropod',
    prompt: 'A soft-bodied creature that moves on a single broad muscular foot. Its body is compact and rounded, with a coiled shell on its back. Two sensory stalks on its head with eyes at the tips. A small expressive mouth. The shell is spiraling with visible growth lines.',
    domain: { aerial: 0.0, aquatic: 0.5, terrestrial: 0.6, insectoid: 0.2, subterranean: 0.8, classic: 0.3 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Small head with two eye-stalks', surface: 'Soft moist skin with coiled shell on back', tail: 'Coiled shell', pattern: 'Spiral shell pattern' }
  },
  cephalopod: {
    tier: 'mollusk', name: 'Cephalopod',
    prompt: 'A soft-bodied creature dominated by a large bulbous head. Multiple flexible tentacles radiate from below its head. Its body can change shape fluidly. Large intelligent eyes with horizontal pupils. Chromatophore skin that shifts color.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.2, insectoid: 0.1, subterranean: 0.3, classic: 0.4 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Large head with intelligent eyes and beak', limbs: 'Eight flexible suckered tentacles', surface: 'Color-shifting chromatophore skin', pattern: 'Living chromatophore display' }
  },

  // ----------------------------------------------------------
  // TIER: FISH (10) — primitive+ with per-type gating
  // ----------------------------------------------------------
  reef_fish: {
    tier: 'fish', name: 'Reef Fish',
    prompt: 'A laterally compressed tropical fish with a tall flat body profile. Elaborate flowing fins — a dramatic dorsal fin, sweeping pectoral fins, and a fan-shaped tail. The body is vividly colored in bold patterns. Large expressive eyes with visible irises. Scales are individually visible, each catching light differently. The fins are semi-transparent with visible ray structures and color gradients.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.0, classic: 0.4 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Laterally compressed head with large expressive eye', surface: 'Individually visible iridescent scales', tail: 'Fan-shaped ornamental tail fin', wings: 'Elaborate flowing dorsal and pectoral fins', pattern: 'Bold tropical color blocks' }
  },
  predator_fish: {
    tier: 'fish', name: 'Predator Fish',
    prompt: 'A powerfully built predatory fish with a sleek torpedo-shaped body designed for explosive speed. A pointed snout leads to a wide mouth lined with visible teeth. The body tapers to a powerful crescent-shaped tail fin. Pectoral fins angle outward like fighter jet wings. The skin is smooth and taut over dense muscle. Cold calculating eyes.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.1, classic: 0.4 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Pointed snout with wide tooth-lined jaw', surface: 'Smooth taut sharkskin', tail: 'Powerful crescent tail fin', wings: 'Fighter-jet pectoral fins', pattern: 'Sleek countershading gradient' }
  },
  flatfish: {
    tier: 'fish', name: 'Flatfish',
    prompt: 'A broad flat creature that lies horizontal against the seafloor. Its body is a wide disc or diamond shape, extremely thin in profile. Both eyes sit on the top surface, peering upward. The top is textured and camouflaged. The underside is pale. Wide pectoral fins merge seamlessly with the body. It ripples along the bottom.',
    domain: { aerial: 0.0, aquatic: 0.9, terrestrial: 0.1, insectoid: 0.0, subterranean: 0.4, classic: 0.3 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Both-eyes-on-top flat head', surface: 'Camouflage-textured skin', tail: 'Flat undulating body taper', wings: 'Merged body-wide flat fins', pattern: 'Seafloor camouflage mottling' }
  },
  seahorse: {
    tier: 'fish', name: 'Seahorse',
    prompt: 'A creature that swims upright with a vertical posture. Its body is encased in bony armor rings stacked in segments. A long tubular snout ends in a tiny mouth. A curling prehensile tail coils downward. A small dorsal fin flutters rapidly on its back. A bony crowned head with independently swiveling eyes.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.1, classic: 0.6 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Bony crowned horse-like head with tubular snout', surface: 'Bony armor ring segments', tail: 'Curling prehensile tail', wings: 'Small fluttering dorsal fin', pattern: 'Armored ring segmentation' }
  },
  eel_form: {
    tier: 'fish', name: 'Eel',
    prompt: 'A long sinuous fish with a snake-like body that undulates in flowing S-curves. A continuous fin runs along the entire dorsal edge merging with the tail and anal fin into one ribbon-like structure. The head has a blunt or pointed snout with a wide mouth that gapes open revealing teeth. Small round eyes. No pelvic or pectoral fins — the body is one long muscular tube. Smooth, scaleless, glistening with mucus.',
    domain: { aerial: 0.0, aquatic: 0.9, terrestrial: 0.1, insectoid: 0.0, subterranean: 0.6, classic: 0.4 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Blunt or pointed head with gaping mouth', surface: 'Smooth scaleless glistening skin', tail: 'Long sinuous body-tail continuum', wings: 'Continuous ribbon dorsal fin', pattern: 'Smooth glistening moray pattern' }
  },
  pufferfish: {
    tier: 'fish', name: 'Pufferfish',
    prompt: 'A round or boxy fish with a comically inflated body. When puffed up, it is a near-perfect sphere covered in short sharp spines that stand erect. Large round eyes with an almost cartoonishly worried or grumpy expression. A small puckered beak-like mouth. Tiny fins that seem inadequate for its inflated size.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.0, classic: 0.5 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Round inflated head with worried expression and beak mouth', surface: 'Spike-covered inflatable skin', pattern: 'Inflated spike-ball texture' }
  },
  flying_fish: {
    tier: 'fish', name: 'Flying Fish',
    prompt: 'A sleek fish with enormously oversized pectoral fins that extend outward like aircraft wings. The fins are broad, rigid, and translucent with visible ray structures — designed for gliding above the water surface. A streamlined body with a powerful asymmetric tail fin. The fish is captured mid-flight — airborne above a water surface, fins fully spread, droplets trailing.',
    domain: { aerial: 0.7, aquatic: 0.9, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.0, classic: 0.5 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Streamlined aerodynamic head', surface: 'Sleek reflective scales', tail: 'Asymmetric launching tail', wings: 'Enormous rigid gliding pectoral wing-fins' }
  },
  lionfish: {
    tier: 'fish', name: 'Lionfish',
    prompt: 'An extravagantly ornamental fish with enormous fan-like pectoral fins spread wide and multiple long venomous dorsal spines radiating upward like a crown. Bold striped patterns cover the body in alternating bands. The fins are elaborate and layered — multiple tiers of webbed spines and soft rays. Every spine and fin ray is visible individually. Full display — all fins extended, all spines erect.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.1, classic: 0.4 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Ornamental head with elaborate fin-spine crown', surface: 'Striped body', wings: 'Multiple tiers of elaborate venomous fin spines', pattern: 'Bold alternating warning stripes' }
  },
  ancient_fish: {
    tier: 'fish', name: 'Ancient Fish',
    prompt: 'A heavy-bodied primitive fish that looks like it swam out of the fossil record. Thick armored scales arranged in visible rows — each scale is a hard bony plate. Fleshy lobed fins that look almost like stubby limbs. A broad flat head with small ancient eyes. Dense, dark, and heavily built. A body plan unchanged for hundreds of millions of years.',
    domain: { aerial: 0.0, aquatic: 0.9, terrestrial: 0.2, insectoid: 0.0, subterranean: 0.5, classic: 0.5 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Broad flat primitive head with small ancient eyes', limbs: 'Fleshy lobed proto-limb fins', surface: 'Thick bony armored plate scales', tail: 'Heavy primitive tail', wings: 'Lobed fleshy fins that look like stubby legs', pattern: 'Ancient armored scale rows' }
  },
  betta: {
    tier: 'fish', name: 'Betta',
    prompt: 'A small-bodied fish with spectacularly oversized flowing fins that billow and trail far behind and below the body like underwater silk scarves. The tail fin alone is several times the body length, rippling in slow-motion waves. The dorsal and anal fins cascade downward in layered curtains. Semi-transparent with visible color gradients. The body is compact but the fins make it enormous. A living ball gown.',
    domain: { aerial: 0.1, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.0, classic: 0.6 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { tail: 'Spectacularly oversized flowing silk tail fins', wings: 'Cascading layered curtain fins on all surfaces', pattern: 'Gradient color flowing through translucent fins' }
  },

  // ----------------------------------------------------------
  // TIER: DEEP SEA (8) — developed+ or dark audio trigger
  // ----------------------------------------------------------
  anglerfish: {
    tier: 'deep_sea', name: 'Anglerfish',
    prompt: 'A grotesque deep-sea predator with an enormous gaping mouth filled with long translucent needle-like teeth that point inward. Its body is bulbous, dark, and lumpy. A bioluminescent lure — a glowing appendage on a long flexible stalk — extends from the top of its head, dangling in front of the jaws. Tiny beady eyes nearly lost in the flesh. Disproportionately huge head relative to body. Fleshy skin with no scales.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.3, classic: 0.4 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'dark_deep',
    donations: { head: 'Enormous gaping needle-toothed mouth with bioluminescent head lure on a stalk', surface: 'Dark lumpy fleshy scaleless skin', pattern: 'Bioluminescent lure glow' }
  },
  tube_worm: {
    tier: 'deep_sea', name: 'Tube Worm',
    prompt: 'A creature living inside a tall rigid white tube that rises from the ground like a chimney. From the tube opening, an elaborate crown of bright red feathery gill plumes fans outward like a blooming flower. The plumes are delicate, branching, and blood-red. The tube is chalky white and encrusted with mineral deposits. No eyes, no face — the gill crown IS the creature. Hydrothermal vent environment.',
    domain: { aerial: 0.0, aquatic: 0.9, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.7, classic: 0.3 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'dark_deep',
    donations: { head: 'Crown of blood-red feathery gill plumes replacing the head', surface: 'Chalky mineral-encrusted tube casing', tail: 'Rigid tube body extending behind', wings: 'Feathery gill plume fans' }
  },
  siphonophore: {
    tier: 'deep_sea', name: 'Siphonophore',
    prompt: 'An impossibly long chain-like colonial organism stretching far into the distance. Not one creature but hundreds of specialized units (zooids) linked together — some gas-filled floats, some feeding polyps with trailing tentacles, some reproductive units. The chain is translucent and bioluminescent, glowing in blues, purples, and pinks. Each unit is a different shape. Ethereal and infinite-looking.',
    domain: { aerial: 0.2, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.1, classic: 0.4 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'dark_deep',
    donations: { head: 'Chain of specialized zooid units replacing the head', limbs: 'Trailing tentacle units from specialized zooids', tail: 'Impossibly long chain-body of linked units trailing behind', wings: 'Gas-filled float bladders', pattern: 'Bioluminescent chain glow' }
  },
  jellyfish_deep: {
    tier: 'deep_sea', name: 'Abyssal Jellyfish',
    prompt: 'A deep-sea jellyfish with a massive undulating bell that pulses with slow rhythmic contractions. The bell is translucent or semi-transparent, revealing internal canal structures in contrasting colors. Long trailing tentacles hang beneath. The bell edge is scalloped with glowing bioluminescent points. Oral arms hang from the center like elaborate curtains. It drifts in absolute darkness, self-illuminated.',
    domain: { aerial: 0.3, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.1, classic: 0.5 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'dark_deep',
    donations: { head: 'Massive pulsing translucent bell dome head', limbs: 'Long trailing tentacles of varying thickness', surface: 'Translucent gelatinous body', tail: 'Trailing curtain-like oral arms', pattern: 'Internal canal pattern visible through transparent bell' }
  },
  viperfish: {
    tier: 'deep_sea', name: 'Viperfish',
    prompt: 'A sleek torpedo-shaped deep-sea predator with a hinged jaw that opens impossibly wide to reveal fangs so long they protrude past the eyes when the mouth is closed. A row of photophores runs along the belly and flanks like a string of tiny blue-green lights. Huge reflective eyes. Dark metallic body with an oily sheen. A thin bioluminescent barbel hangs from the chin. Silent and lethal.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.2, classic: 0.3 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'dark_deep',
    donations: { head: 'Hinged jaw with protruding fangs too large for the mouth, chin barbel', surface: 'Dark metallic oily-sheen skin', pattern: 'Row of photophore lights along flanks' }
  },
  sea_cucumber: {
    tier: 'deep_sea', name: 'Sea Cucumber',
    prompt: 'A soft sausage-shaped creature lying on the seafloor. Plump and leathery with rows of tiny tube feet on the underside. Around the mouth, a ring of branching feeding tentacles extends outward. The body surface is warty, bumpy, textured with papillae. Some areas translucent enough to see internal structures. A living pillow — soft, slow, and ancient.',
    domain: { aerial: 0.0, aquatic: 0.8, terrestrial: 0.2, insectoid: 0.0, subterranean: 0.5, classic: 0.3 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Ringed feeding tentacle mouth', limbs: 'Rows of tiny tube feet underneath', surface: 'Soft warty leathery skin', pattern: 'Warty bumpy papillae texture' }
  },
  vent_crab: {
    tier: 'deep_sea', name: 'Vent Crab',
    prompt: 'A pale eyeless crustacean adapted to hydrothermal vents. Its body is covered in dense forests of silky white hair-like filaments (setae) that cultivate chemosynthetic bacteria. No visible eyes. Mineral deposits encrust parts of its shell in metallic colors — black smoker sulfides, copper greens, iron reds. Robust claws for clinging to vent chimneys.',
    domain: { aerial: 0.0, aquatic: 0.9, terrestrial: 0.1, insectoid: 0.3, subterranean: 0.7, classic: 0.3 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'dark_deep',
    donations: { head: 'Eyeless head covered in dense white bacterial hair-filaments', limbs: 'Robust clinging claws', surface: 'Mineral-encrusted shell with sulfide deposits', pattern: 'Mineral deposit coloring (copper green, iron red, sulfide black)' }
  },
  barreleye: {
    tier: 'deep_sea', name: 'Barreleye',
    prompt: 'A small deep-sea fish with a completely transparent fluid-filled head — the skull is a clear dome through which you can see the brain, green tubular eyes, and internal structures in vivid detail. The tubular eyes point straight upward through the transparent head. The body below the head is normal and opaque. A small downturned mouth. Surreal and beautiful.',
    domain: { aerial: 0.0, aquatic: 1.0, terrestrial: 0.0, insectoid: 0.0, subterranean: 0.1, classic: 0.5 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'dark_deep',
    donations: { head: 'Completely transparent dome head showing brain and tubular green eyes inside', surface: 'Half transparent, half opaque body', pattern: 'Transparent skull with visible internal organs' }
  },

  // ----------------------------------------------------------
  // TIER: CARNIVOROUS PLANT (6) — primitive+ with per-type gating
  // ----------------------------------------------------------
  flytrap: {
    tier: 'carnivorous_plant', name: 'Venus Flytrap',
    prompt: 'A creature that is part plant, part predator. Its body is a cluster of jaw-like traps — each trap is two hinged lobes lined with interlocking spike-like teeth (cilia) along the edges. The interior of each trap is vivid red or purple. Thin trigger hairs visible on the inner surface. Traps grow from a central rosette of fleshy green leaves. Some traps open and waiting, some clamped shut.',
    domain: { aerial: 0.0, aquatic: 0.2, terrestrial: 1.0, insectoid: 0.2, subterranean: 0.3, classic: 0.5 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Jaw-trap head with interlocking teeth-cilia and trigger hairs', pattern: 'Red interior / green exterior contrast' }
  },
  sundew: {
    tier: 'carnivorous_plant', name: 'Sundew',
    prompt: 'A creature covered in hundreds of hair-like tentacles, each tipped with a single glistening jewel-like droplet of sticky dew that catches the light like a tiny crystal ball. The dewdrops are translucent and rainbow-refractive, sparkling brilliantly. The tentacles slowly curl inward toward anything that touches them. The base body is a rosette of spoon-shaped leaves. Every surface sparkles and glistens. A living chandelier of liquid gemstones.',
    domain: { aerial: 0.0, aquatic: 0.2, terrestrial: 0.9, insectoid: 0.2, subterranean: 0.2, classic: 0.6 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Crown of dewdrop-tipped glistening tentacles on the head', limbs: 'Slowly curling sticky tentacle-arms tipped with jeweled dewdrops', surface: 'Glistening adhesive dewdrop-covered surface', pattern: 'Prismatic dewdrop sparkle across entire body' }
  },
  pitcher: {
    tier: 'carnivorous_plant', name: 'Pitcher Plant',
    prompt: 'A creature composed of multiple tall elegant tubular vessels (pitchers) rising from a central base. Each pitcher is a deep vase-shaped chamber with a flared rim and a hood or lid partially covering the opening. The rim is glossy and slippery — visibly wet with nectar. The interior darkens toward the bottom where digestive fluid pools. Veined patterns run along the exterior. Elegant, architectural, sinister.',
    domain: { aerial: 0.0, aquatic: 0.3, terrestrial: 0.9, insectoid: 0.2, subterranean: 0.2, classic: 0.5 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Deep tubular pitcher vessel replacing the head, with slippery nectar rim', surface: 'Veined pitcher-wall skin with slippery waxy surface', pattern: 'Interior gradient from light rim to dark digestive base' }
  },
  tentacle_plant: {
    tier: 'carnivorous_plant', name: 'Tentacle Plant',
    prompt: 'A mound-shaped plant creature bristling with long muscular tentacles that actively reach, grasp, and coil around things. Unlike passive plants, this one visibly moves — tentacles whip outward, curl, and retract. Each tentacle tipped with either a sticky globule or a small gripping pad. The central body is a dense fleshy mass of overlapping leaves. Mucilage glistens on every surface. A plant behaving like an octopus.',
    domain: { aerial: 0.1, aquatic: 0.4, terrestrial: 0.8, insectoid: 0.3, subterranean: 0.4, classic: 0.5 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { limbs: 'Actively grasping muscular plant tentacles with sticky or gripping tips', surface: 'Mucilage-glistening plant-flesh surface', pattern: 'Glistening mucilage sheen' }
  },
  dewdrop_orchid: {
    tier: 'carnivorous_plant', name: 'Dewdrop Orchid',
    prompt: 'An impossibly beautiful flower-creature. Elaborate orchid-like petals unfurl in layers, each petal surface covered in tiny glistening dewdrops that catch and refract light into rainbow spectrums. The flower center conceals a hidden trap — a deep funnel lined with downward-pointing hairs. Delicate tendrils extend from between petals, each beaded with crystalline sticky droplets like a string of pearls. Sparkles and shimmers everywhere.',
    domain: { aerial: 0.2, aquatic: 0.2, terrestrial: 0.8, insectoid: 0.2, subterranean: 0.1, classic: 0.7 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Elaborate orchid petal layers unfurling from the head with hidden funnel trap center', limbs: 'Tendril arms beaded with crystalline droplets like pearl strings', wings: 'Petal-like fin structures', pattern: 'Rainbow-refractive dewdrop prismatic sparkle' }
  },
  mycelium_trap: {
    tier: 'carnivorous_plant', name: 'Mycelium Trap',
    prompt: 'A creature that is mostly underground — a vast network of pale fungal threads (mycelium) spreading outward like roots, visible beneath translucent soil. Above ground, it sends up glowing mushroom-like lure structures that pulse with bioluminescent light. The lures are beautiful — delicate, glowing, ethereal. Fine threadlike tendrils reach up from the soil around the lures. Beautiful bait on an invisible web.',
    domain: { aerial: 0.0, aquatic: 0.0, terrestrial: 0.6, insectoid: 0.3, subterranean: 1.0, classic: 0.5 },
    evolution: ['primitive', 'basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Glowing mushroom lure structures rising from the head', limbs: 'Fine threadlike mycelium tendrils as grasping limbs', tail: 'Underground mycelium network trailing behind', pattern: 'Bioluminescent mushroom glow' }
  },

  // ----------------------------------------------------------
  // TIER: MYTHOLOGICAL (8) — developed+
  // ----------------------------------------------------------
  draconic: {
    tier: 'mythological', name: 'Draconic',
    prompt: 'A powerful reptilian creature with massive leathery wings. Its body is muscular and scaled, with a long whip-like tail. Its jaws are prominent and its eyes are ancient and fierce.',
    domain: { aerial: 0.9, aquatic: 0.3, terrestrial: 0.7, insectoid: 0.1, subterranean: 0.4, classic: 0.8 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Horned reptilian dragon head with ancient fierce eyes', limbs: 'Powerful clawed dragon legs', surface: 'Thick scaled dragon hide', tail: 'Long whip-like dragon tail', wings: 'Massive leathery bat-like dragon wings' }
  },
  centauroid: {
    tier: 'mythological', name: 'Centauroid',
    prompt: 'A creature with a four-legged lower body and an upright torso rising from the front. The lower body is powerful and beast-like. The upper torso has two arms and an expressive face.',
    domain: { aerial: 0.1, aquatic: 0.1, terrestrial: 0.9, insectoid: 0.3, subterranean: 0.2, classic: 0.7 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { limbs: 'Four-legged beast lower body with upright torso and arms', tail: 'Beast tail from lower body' }
  },
  chimeric: {
    tier: 'mythological', name: 'Chimeric',
    prompt: 'A creature clearly assembled from multiple different species. Its front half differs dramatically from its back half. Different textures, proportions, and features merge at visible seam lines.',
    domain: { aerial: 0.5, aquatic: 0.5, terrestrial: 0.7, insectoid: 0.4, subterranean: 0.4, classic: 0.8 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Head is visibly from a different species than the body', limbs: 'Mixed-species limbs (each limb different)', surface: 'Patchwork of different textures at visible seam lines', tail: 'Tail from a different species than the body', wings: 'Wings from yet another species', pattern: 'Multi-texture seam pattern' }
  },
  elemental_golem: {
    tier: 'mythological', name: 'Elemental Golem',
    prompt: 'A creature whose body is constructed from raw elemental matter — stone, crystal, magma, or ice. It has a roughly humanoid or beast form but is clearly not organic. Cracks and seams show its material nature.',
    domain: { aerial: 0.2, aquatic: 0.3, terrestrial: 0.8, insectoid: 0.1, subterranean: 0.9, classic: 0.6 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Head carved from raw element (stone, crystal, ice, magma)', limbs: 'Limbs made of raw elemental matter with cracks and seams', surface: 'Raw element surface (stone, crystal, etc.)', pattern: 'Elemental crack-and-glow pattern' }
  },
  leviathan: {
    tier: 'mythological', name: 'Leviathan',
    prompt: 'A massive creature of extraordinary scale. Its body is vast and whale-like, with enormous fins or flippers. It dwarfs everything around it. Ancient and monumental.',
    domain: { aerial: 0.7, aquatic: 1.0, terrestrial: 0.3, insectoid: 0.0, subterranean: 0.5, classic: 0.5 },
    evolution: ['advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Massive ancient whale-scale head', limbs: 'Enormous fins/flippers', tail: 'Massive fluked tail' }
  },
  wraith: {
    tier: 'mythological', name: 'Wraith',
    prompt: 'A semi-corporeal creature. Its upper body is somewhat solid but its lower half dissolves into trailing wisps of mist or shadow. It floats rather than walks. Its edges are always dissolving.',
    domain: { aerial: 0.8, aquatic: 0.3, terrestrial: 0.5, insectoid: 0.1, subterranean: 0.7, classic: 0.6 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Semi-corporeal dissolving head trailing mist', limbs: 'Arms that fade to smoke at the fingertips', surface: 'Semi-transparent ghostly body', tail: 'Lower body dissolves entirely into mist/shadow', pattern: 'Corporeal-to-incorporeal fade' }
  },
  symbiote: {
    tier: 'mythological', name: 'Symbiote',
    prompt: 'A creature that is clearly two organisms fused into one. One organism wraps around or grows through the other. Both are alive and distinct — different colors, different textures — but permanently joined.',
    domain: { aerial: 0.3, aquatic: 0.5, terrestrial: 0.6, insectoid: 0.6, subterranean: 0.5, classic: 0.5 },
    evolution: ['developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Two distinct faces/heads merged — one organism wrapping the other', limbs: 'Secondary organism tendrils wrapping the primary limbs', surface: 'Two different textures visibly merged on the body surface', tail: 'Second organism tail grafted alongside the first', pattern: 'Two-organism color split' }
  },
  phoenix: {
    tier: 'mythological', name: 'Phoenix',
    prompt: 'An avian creature wreathed in transformative energy. Its feathers are made of light or flame. Its form constantly shifts between solid and energy. Trailing streamers of radiance behind it.',
    domain: { aerial: 1.0, aquatic: 0.0, terrestrial: 0.3, insectoid: 0.0, subterranean: 0.1, classic: 0.5 },
    evolution: ['advanced', 'apex'],
    framing: 'standard',
    donations: { surface: 'Body constantly shifting between solid and energy states', tail: 'Trailing streamers of radiance', wings: 'Wings made of pure energy/flame', pattern: 'Perpetual transformation shimmer' }
  },

  // ----------------------------------------------------------
  // TIER: HYBRID BLENDS (6) — basic+
  // ----------------------------------------------------------
  florafauna: {
    tier: 'hybrid', name: 'Florafauna',
    prompt: 'Half plant, half animal. Its body has an organic animal core but bark-like skin, leaf-like ears or mane, root-like feet that grip the ground. Flowers or fruiting bodies bloom from its back and shoulders. Vines curl around its limbs.',
    domain: { aerial: 0.1, aquatic: 0.2, terrestrial: 0.9, insectoid: 0.3, subterranean: 0.3, classic: 0.6 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Leaf-mane and bark-faced head with flower crown', limbs: 'Root-feet and vine-wrapped limbs', surface: 'Bark skin with moss and flower growth', tail: 'Trailing root tail', wings: 'Leaf-wing structures', pattern: 'Organic plant growth pattern' }
  },
  crystallimb: {
    tier: 'hybrid', name: 'Crystallimb',
    prompt: 'A creature with an organic fleshy core but crystalline mineral growths replacing or encasing its limbs. Its arms and legs are faceted translucent crystal formations. Light refracts through its joints creating prismatic highlights.',
    domain: { aerial: 0.2, aquatic: 0.1, terrestrial: 0.7, insectoid: 0.2, subterranean: 0.9, classic: 0.5 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Crystal-encased head with faceted features', limbs: 'Faceted crystal limbs refracting light', surface: 'Crystal growths erupting from organic skin', tail: 'Crystal formation tail', wings: 'Crystal blade fins', pattern: 'Prismatic crystal refraction' }
  },
  nebulobeast: {
    tier: 'hybrid', name: 'Nebulobeast',
    prompt: 'A creature with a dense glowing solid core surrounded by swirling clouds of colorful gas. Its limbs are nebula-like tendrils of luminous vapor. The gas clouds shift and billow, making its silhouette constantly change.',
    domain: { aerial: 0.9, aquatic: 0.3, terrestrial: 0.3, insectoid: 0.1, subterranean: 0.2, classic: 0.6 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Glowing nebula-core head surrounded by gas clouds', limbs: 'Nebula gas tendril limbs', tail: 'Dissipating gas cloud tail', wings: 'Gas cloud wing formations', pattern: 'Swirling nebula color clouds' }
  },
  tectonicrawler: {
    tier: 'hybrid', name: 'Tectonicrawler',
    prompt: 'A massive flat creature like a living tectonic plate. Its dorsal surface is rocky terrain with cracks revealing glowing magma underneath. Tiny legs beneath like an enormous isopod. Plants or crystals grow on its back.',
    domain: { aerial: 0.0, aquatic: 0.3, terrestrial: 0.8, insectoid: 0.2, subterranean: 1.0, classic: 0.4 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Rocky terrain dorsal head surface with magma cracks', limbs: 'Tiny isopod legs underneath a massive flat body', surface: 'Rocky terrain surface with growing crystals/plants', pattern: 'Magma crack glow pattern' }
  },
  echomaw: {
    tier: 'hybrid', name: 'Echomaw',
    prompt: 'A creature built for sound. Its body is dominated by a wide resonant bell-shaped chamber. Vibrating membranes stretch across openings in its body. Tentacle-like tonal tubes extend from its sides. Sound-hole openings dot its form.',
    domain: { aerial: 0.4, aquatic: 0.7, terrestrial: 0.5, insectoid: 0.3, subterranean: 0.6, classic: 0.5 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Resonant bell-chamber head with vibrating membranes and sound holes', limbs: 'Tonal tube tentacle limbs', wings: 'Vibrating membrane fin structures', pattern: 'Sound-wave ripple pattern' }
  },
  sporeling: {
    tier: 'hybrid', name: 'Sporeling',
    prompt: 'A fungal organism that walks. A large mushroom cap serves as its head, with bioluminescent gills underneath. Its body is woven from mycelial networks. Spore clouds drift behind it as it moves. Small secondary mushrooms sprout from its shoulders.',
    domain: { aerial: 0.1, aquatic: 0.3, terrestrial: 0.7, insectoid: 0.4, subterranean: 0.9, classic: 0.4 },
    evolution: ['basic', 'developed', 'advanced', 'apex'],
    framing: 'standard',
    donations: { head: 'Mushroom cap head with bioluminescent gills underneath', surface: 'Fungal texture with small secondary mushroom growths', tail: 'Spore cloud trailing behind', pattern: 'Bioluminescent gill glow' }
  },

  // ----------------------------------------------------------
  // TIER: INTELLIGENCE-GATED (4) — advanced+ AND intelligent+
  // ----------------------------------------------------------
  cyborg: {
    tier: 'intelligence_gated', name: 'Cyborg',
    prompt: 'An organic creature with visible mechanical augmentations. One eye is replaced with a glowing cybernetic lens. Metal plating reinforces one side of its body. Exposed wiring and hydraulic tubes run along its limbs. Servo-driven joints click and whir. Part clearly alive, part clearly machine.',
    domain: { aerial: 0.4, aquatic: 0.3, terrestrial: 0.8, insectoid: 0.5, subterranean: 0.5, classic: 0.7 },
    evolution: ['advanced', 'apex'],
    intelligenceGate: 'intelligent',
    framing: 'standard',
    donations: { head: 'Half-organic half-mechanical head with cybernetic eye', limbs: 'Servo-driven mechanical limb replacements with hydraulics', surface: 'Metal plating on one side with exposed wiring', tail: 'Mechanical tail with actuators', wings: 'Mechanical wing structures', pattern: 'Circuit trace line pattern' }
  },
  mech_pilot: {
    tier: 'intelligence_gated', name: 'Mech Pilot',
    prompt: 'A small organic creature visible inside a transparent cockpit dome, piloting a larger mechanical walker body. The pilot is tiny and expressive. The mech body is industrial — welded metal, hydraulic legs, tool arms. The creature grips controls inside the cockpit.',
    domain: { aerial: 0.5, aquatic: 0.4, terrestrial: 0.8, insectoid: 0.4, subterranean: 0.5, classic: 0.7 },
    evolution: ['advanced', 'apex'],
    intelligenceGate: 'intelligent',
    framing: 'standard',
    donations: { head: 'Tiny pilot creature visible in a cockpit dome on the head', limbs: 'Mechanical walker legs controlled by the pilot', surface: 'Industrial welded metal hull', pattern: 'Industrial rivet and weld pattern' }
  },
  android: {
    tier: 'intelligence_gated', name: 'Android',
    prompt: 'A fully synthetic creature designed to mimic organic life. Smooth body with visible panel seams. Glowing circuit-trace patterns pulse beneath translucent synthetic skin. Camera-lens eyes with aperture irises. Perfect bilateral symmetry. Elegant and uncanny.',
    domain: { aerial: 0.3, aquatic: 0.2, terrestrial: 0.9, insectoid: 0.3, subterranean: 0.4, classic: 0.8 },
    evolution: ['apex'],
    intelligenceGate: 'transcendent',
    framing: 'standard',
    donations: { head: 'Smooth synthetic head with camera-lens aperture eyes and panel seams', limbs: 'Synthetic limbs with visible panel seams and internal glow', surface: 'Translucent synthetic skin with circuit traces underneath', pattern: 'Glowing circuit trace network' }
  },
  nanoswarm: {
    tier: 'intelligence_gated', name: 'Nanoswarm',
    prompt: 'A creature made of thousands of tiny metallic units swarming into a coherent shape. The silhouette is recognizable as a creature but the edges shimmer and shift as individual units rearrange. Slightly transparent — you can see through the gaps. The surface ripples like a flock of starlings.',
    domain: { aerial: 0.6, aquatic: 0.4, terrestrial: 0.7, insectoid: 0.5, subterranean: 0.5, classic: 0.6 },
    evolution: ['apex'],
    intelligenceGate: 'transcendent',
    framing: 'standard',
    donations: { head: 'Head formed by dense swarm of metallic nano-units', limbs: 'Limbs are columns of swarming nano-units', surface: 'Surface is a shimmering layer of rearranging nano-units', tail: 'Dispersing trail of nano-units', wings: 'Wing shapes formed by coordinated nano-unit clouds', pattern: 'Shimmering particulate surface' }
  }
};

// Export for use in mapping engine
if (typeof module !== 'undefined') module.exports = AumageMorphologies;
if (typeof window !== 'undefined') window.AumageMorphologies = AumageMorphologies;
