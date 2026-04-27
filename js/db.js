/**
 * Aumage — Frontend Database Layer
 * Browser-compatible Supabase client for auth, creature storage, and sharing.
 * Loaded AFTER supabase-js CDN script in index.html.
 */

const AumageDB = {
  supabase: null,
  user: null,

  // ============================================================
  // INIT
  // ============================================================

  init() {
    // ACTIVE: Backend-side project (from wrangler.toml)
    // const SUPABASE_URL = 'https://rweykteohelwgvenzpai.supabase.co';
    // const SUPABASE_ANON = 'sb_publishable_MIeAlOW6K62Snbaa_VXRkA_ceOUhodT';

    const SUPABASE_URL = 'https://ddndxmjedlddgnchqxmk.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbmR4bWplZGxkZGduY2hxeG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNTY5ODIsImV4cCI6MjA4NzczMjk4Mn0.NB4VCoHivoTifxPrj-MPDa8JRxQOnis2W0JEMmmWNMA';

    if (typeof window.supabase === 'undefined') {
      console.error('Supabase client not loaded. Make sure supabase-js CDN is included before db.js');
      return;
    }

    this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

    // Check for existing session and verify with server
    this.supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.warn('AumageDB: Session invalid or user deleted', error.message);
        this.user = null;
        this.updateAuthUI();
        return;
      }
      if (data.user) {
        this.user = data.user;
        console.log('AumageDB: Logged in as', this.user.email || this.user.id);
        this.updateAuthUI();
        if (window.NotificationUI) window.NotificationUI.init();
      }
    });

    // Listen for auth changes (magic link return, etc.)
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null;
      this.updateAuthUI();
      if (event === 'SIGNED_IN') {
        console.log('AumageDB: Signed in');
        if (window.NotificationUI) window.NotificationUI.init();
        // Check if returning from share page
        const savedSlug = localStorage.getItem('aumage_creature_state');
        if (savedSlug) {
          localStorage.removeItem('aumage_creature_state');
          window.location.href = '/c/' + savedSlug;
        }
      }
    });

    console.log('AumageDB initialized');
    this.updateSidebarStats();
  },

  /**
   * Fetch live profile and update sidebar XP/Level UI.
   */
  async updateSidebarStats() {
    if (!this.user) return;

    try {
      const profile = await this.getUserProfile();
      if (!profile) return;

      const levelEl = document.querySelector('.xp-level');
      const xpValueEl = document.querySelector('.xp-value');
      const xpFillEl = document.querySelector('.xp-progress-fill');
      const profNameEl = document.getElementById('prof-name');
      const profAvatarEl = document.getElementById('prof-avatar');

      if (levelEl) levelEl.textContent = `Lv. ${profile.level}`;
      if (xpValueEl) xpValueEl.textContent = `${Math.floor(profile.xp)} / ${profile.next_level_xp} XP`;

      if (xpFillEl) {
        const pct = Math.min(100, Math.max(0, (profile.xp / profile.next_level_xp) * 100));
        xpFillEl.style.width = `${pct}%`;
      }

      if (profNameEl) profNameEl.textContent = profile.display_name || this.user.email?.split('@')[0] || 'Storyteller';
      if (profAvatarEl && profile.avatar_url) profAvatarEl.src = profile.avatar_url;

    } catch (e) {
      console.error('AumageDB.updateSidebarStats error:', e);
    }
  },

  /**
   * Check if a user is logged in (auth guard).
   * Redirects if not authenticated.
   */
  async requireAuth(options = {}) {
    const { redirectPath = '../pages/login.html' } = options;

    const { data: { user }, error } = await this.supabase.auth.getUser();

    if (error || !user) {
      console.warn('AumageDB: Unauthorized access — redirecting to', redirectPath);
      window.location.href = redirectPath;
      return null;
    }

    this.user = user;
    this.updateAuthUI();
    return user;
  },

  /**
   * Update header UI to reflect auth state.
   */
  updateAuthUI() {
    const loggedOut = document.getElementById('auth-logged-out');
    const loggedIn = document.getElementById('auth-logged-in');
    const userName = document.getElementById('auth-user-name');
    const signOutBtn = document.getElementById('auth-signout-btn');

    if (this.user) {
      if (loggedOut) loggedOut.classList.add('hidden');
      if (loggedIn) loggedIn.classList.remove('hidden');
      if (userName) userName.textContent = this.user.email?.split('@')[0] || 'Creator';
      if (signOutBtn) {
        signOutBtn.onclick = () => {
          this.supabase.auth.signOut();
          this.user = null;
          this.updateAuthUI();
        };
      }
      // Call progress update
      this.updateSidebarStats();
    } else {
      if (loggedOut) loggedOut.classList.remove('hidden');
      if (loggedIn) loggedIn.classList.add('hidden');
    }
  },

  /**
   * Update sidebar level and XP progress bars with live data.
   */
  async updateSidebarStats() {
    if (!this.user) return;

    // Wait a bit for components to load if they haven't yet
    if (!document.querySelector('.xp-level')) {
      // If sidebar not yet in DOM, wait for the event
      document.addEventListener('componentsLoaded', () => this.updateSidebarStats(), { once: true });
      return;
    }

    const data = await this.getUserProfile();
    if (!data || !data.success) return;

    const { profile, target_level, base_xp } = data;

    const levelEls = document.querySelectorAll('.xp-level');
    const valueEls = document.querySelectorAll('.xp-value');
    const progressFills = document.querySelectorAll('.xp-progress-fill');

    levelEls.forEach(el => el.textContent = `Lv. ${profile.level}`);

    if (valueEls.length > 0 || progressFills.length > 0) {
      const currentXP = profile.total_xp;
      const requiredXP = target_level.xp_required;
      const thresholdXP = base_xp;

      // Progress within the current level
      const xpInLevel = currentXP - thresholdXP;
      const rangeInLevel = requiredXP - thresholdXP;
      const progressPct = Math.min(100, Math.max(0, (xpInLevel / rangeInLevel) * 100));

      valueEls.forEach(el => {
        el.textContent = `${currentXP.toLocaleString()} / ${requiredXP.toLocaleString()} XP`;
      });
      progressFills.forEach(el => {
        el.style.width = `${progressPct}%`;
      });
    }

    // Also update profile card if it exists
    const profName = document.getElementById('prof-name');
    const profUID = document.getElementById('prof-uid');
    const profAvatar = document.getElementById('prof-avatar');
    const greetName = document.getElementById('dash-greeting-name');
    const headerTokens = document.getElementById('header-token-count');

    // Fetch latest currency directly from Supabase to ensure it's fresh
    let currentCurrency = profile.currency || 0;
    try {
      const { data: latestProf } = await this.supabase
        .from('profiles')
        .select('currency')
        .eq('id', this.user.id)
        .maybeSingle();
      if (latestProf && latestProf.currency !== undefined) {
        currentCurrency = latestProf.currency;
      }
    } catch (e) {
      console.warn('Failed to fetch latest currency from Supabase:', e);
    }

    const name = profile.display_name || this.user.email?.split('@')[0] || 'Storyteller';
    const uidTruncated = this.user.id.substring(0, 12).toUpperCase() + '...';

    if (profName) profName.textContent = name;
    if (profUID) profUID.textContent = `UID: ${uidTruncated}`;
    if (greetName) greetName.textContent = name;

    if (headerTokens) {
      headerTokens.textContent = currentCurrency.toLocaleString();
    }

    if (profAvatar) {
      if (profile.avatar_url) {
        profAvatar.src = profile.avatar_url;
      } else {
        profAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=08D2C1&color=fff&size=128`;
      }
    }
  },

  // ============================================================
  // AUTH
  // ============================================================

  async signInWithEmail(email) {
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/auth/dashboard.html' }
    });
    if (error) throw error;
  },

  // ============================================================
  // CREATURE CRUD
  // ============================================================

  /**
   * Save a new creature record.
   * Returns the saved record with id and share_slug.
   */
  async saveCreature({
    imageUrl, videoUrl, audioSource, audioStoragePath, linkUrl,
    fingerprint, seed, mode, style, features, visuals, promptText,
    rarity, morphology, tier, domain, trope, element,
    region, climate, season, hemisphere,
    stats, traits, flavorText, creatureName,
    serialNumber, catalogId, ars,
    isPublic, folderId, frameVariant,
    promptHash, waveformHash,
    isTradeable, price
  }) {
    if (!this.supabase) return null;

    // Generate a short share slug if not triggers-managed
    const shareSlug = this._generateSlug();
    const timestamp = new Date().toISOString();

    const record = {
      user_id: this.user?.id || null,
      image_url: imageUrl,
      video_url: videoUrl || null,
      audio_source: audioSource || 'record',
      audio_storage_path: audioStoragePath || null,
      link_url: linkUrl || null,
      fingerprint: fingerprint || null,
      seed: seed || null,
      mode: mode || 'creature',
      style: style || 'realistic',
      features: features || {},
      visuals: visuals || {},
      prompt_text: promptText || null,
      share_slug: shareSlug,
      is_public: isPublic !== undefined ? isPublic : true,
      created_at: timestamp,
      folder_id: folderId || null,
      serial_number: serialNumber || null,
      catalog_id: catalogId || null,
      base_rarity: rarity || 'common',
      ars: ars || 0.5,
      trope_class: trope || null,
      morphology: morphology || null,
      tier: tier || '1',
      element: element || 'neutral',
      domain: domain || 'terrestrial',
      variant_tags: { ...(stats || {}), ...(traits || {}) },
      mint_timestamp: timestamp,
      residence_region: region || 'Unknown',
      climate_zone: climate || 'Temperate',
      season: season || 'spring',
      hemisphere: hemisphere || 'northern',
      waveform_hash: waveformHash || null,
      prompt_hash: promptHash || null,
      creature_name: creatureName || null,
      flavor_text: flavorText || null,
      frame_variant: frameVariant || 'standard',
      is_tradeable: isTradeable || false,
      price: price || 0
    };

    const { data, error } = await this.supabase
      .from('creatures')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('AumageDB saveCreature error:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update an existing creature record (e.g., after augmentation).
   */
  async updateCreature(id, updates) {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('creatures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('AumageDB updateCreature error:', error);
      throw error;
    }

    return data;
  },

  /**
   * Set a creature's tradeable status and price.
   */
  async setTradeStatus(id, isTradeable, price) {
    if (!this.supabase) return null;

    const updates = {
      is_tradeable: isTradeable,
      price: price
    };

    // If listing for trade, also make it public so it shows up in Explore/Marketplace
    if (isTradeable) {
      updates.is_public = true;
    }

    const { data, error } = await this.supabase
      .from('creatures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('AumageDB setTradeStatus error:', error);
      throw error;
    }

    return data;
  },

  /**
   * Purchase a creature from another user.
   */
  async purchaseCreature(creature) {
    if (!this.supabase || !this.user) throw new Error('Auth required');
    if (creature.user_id === this.user.id) throw new Error('You already own this creature');
    if (!creature.is_tradeable) throw new Error('Creature not for sale');

    try {
      // 1. Get buyer profile to check currency
      const { data: buyerProfile, error: buyerErr } = await this.supabase
        .from('profiles')
        .select('currency')
        .eq('id', this.user.id)
        .single();

      if (buyerErr) throw buyerErr;
      if ((buyerProfile.currency || 0) < creature.price) {
        throw new Error(`Insufficient funds. You need ${creature.price} tokens.`);
      }

      // 2. Get seller profile (if it exists) to add currency
      if (creature.user_id) {
        const { data: sellerProfile, error: sellerErr } = await this.supabase
          .from('profiles')
          .select('currency')
          .eq('id', creature.user_id)
          .single();

        if (!sellerErr && sellerProfile) {
          await this.supabase
            .from('profiles')
            .update({ currency: (sellerProfile.currency || 0) + creature.price })
            .eq('id', creature.user_id);
        }
      }

      // 3. Deduct from buyer
      await this.supabase
        .from('profiles')
        .update({ currency: buyerProfile.currency - creature.price })
        .eq('id', this.user.id);

      // 4. Transfer ownership and delist
      const { data: updated, error: transferErr } = await this.supabase
        .from('creatures')
        .update({
          user_id: this.user.id,
          is_tradeable: false,
          is_public: true // Keep public but not tradeable
        })
        .eq('id', creature.id)
        .select()
        .single();

      if (transferErr) throw transferErr;

      // Update sidebar stats to reflect new currency
      this.updateSidebarStats();

      return updated;
    } catch (e) {
      console.error('AumageDB.purchaseCreature error:', e);
      throw e;
    }
  },

  /**
   * Get a creature by its share slug (for /c/{slug} pages).
   */
  async getCreatureBySlug(slug) {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
      .eq('share_slug', slug)
      .single();

    if (error) {
      console.error('AumageDB getCreatureBySlug error:', error);
      return null;
    }

    return data;
  },

  /**
   * Get all creatures for the current user (for collection sidebar).
   */
  async getMyCreatures() {
    if (!this.supabase || !this.user) return [];

    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('AumageDB getMyCreatures error:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all creatures for the current user filtered by trope.
   */
  async getCreaturesByTrope(tropeKey) {
    if (!this.supabase || !this.user) return [];

    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
      .eq('user_id', this.user.id)
      .ilike('trope_class', tropeKey)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('AumageDB getCreaturesByTrope error:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get creature counts grouped by trope_class for the current user.
   */
  async getCreatureCountsByTrope() {
    if (!this.supabase || !this.user) return {};

    const { data, error } = await this.supabase
      .from('creatures')
      .select('trope_class')
      .eq('user_id', this.user.id);

    if (error) {
      console.error('AumageDB getCreatureCountsByTrope error:', error);
      return {};
    }

    const counts = {};
    data.forEach(c => {
      const trope = (c.trope_class || 'unknown').toLowerCase();
      counts[trope] = (counts[trope] || 0) + 1;
    });

    return counts;
  },

  // ============================================================
  // TEAMS
  // ============================================================

  async getTeam() {
    if (!this.user) return null;

    try {
      const session = await this.supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';

      const response = await fetch(`${apiBase}/api/teams`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const result = await response.json();
      return result.success ? result.team : null;
    } catch (e) {
      console.error('AumageDB.getTeam error:', e);
      return null;
    }
  },

  async saveTeam(creatureIds, name = 'My Squad') {
    if (!this.user) throw new Error('Auth required');

    try {
      const session = await this.supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';

      const response = await fetch(`${apiBase}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ creature_ids: creatureIds, name })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to save team');
      return result.team;
    } catch (e) {
      console.error('AumageDB.saveTeam error:', e);
      throw e;
    }
  },

  // ============================================================

  // FOLDERS
  // ============================================================

  async getFolders() {
    if (!this.supabase || !this.user) return [];

    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('AumageDB getFolders error:', error);
      return [];
    }

    return data || [];
  },

  async createFolder(name, trope) {
    if (!this.supabase || !this.user) return null;

    const { data, error } = await this.supabase
      .from('folders')
      .insert({
        user_id: this.user.id,
        name: name,
        trope: trope,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('AumageDB createFolder error:', error);
      return null;
    }

    return data;
  },

  // ============================================================
  // AUDIO UPLOAD
  // ============================================================

  /**
   * Upload audio blob to Supabase Storage.
   * Returns the public URL or null on failure.
   */
  async uploadAudio(blob, filename) {
    if (!this.supabase) return null;

    const path = `audio/${this.user?.id || 'anon'}/${filename}`;

    const { error } = await this.supabase.storage
      .from('aumage-audio')
      .upload(path, blob, {
        contentType: blob.type || 'audio/webm',
        upsert: false
      });

    if (error) {
      console.error('AumageDB uploadAudio error:', error);
      return null;
    }

    const { data: urlData } = this.supabase.storage
      .from('aumage-audio')
      .getPublicUrl(path);

    return urlData?.publicUrl || null;
  },

  // ============================================================
  // CARD IMAGE UPLOAD
  // ============================================================

  /**
   * Upload final collectible card image to Backblaze B2 via Backend API.
   * Returns the public URL or null on failure.
   */
  async uploadCardImage(blob, creatureId, creatureName = '') {
    if (!this.supabase) return null;

    try {
      const formData = new FormData();
      formData.append('card', blob, `card-${creatureId}.png`);
      formData.append('creature_id', creatureId);
      formData.append('creature_name', creatureName);

      // Get auth token if available via Supabase session
      const session = await this.supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      const apiBase = window.CONFIG?.API_BASE_URL || 'https://hohetai-api.devhhtk.workers.dev';

      const response = await fetch(`${apiBase}/api/save-card`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('AumageDB: Card uploaded to B2 via Worker:', result.card_url);
      return result.card_url;
    } catch (error) {
      console.error('AumageDB.uploadCardImage error:', error.message);
      return null;
    }
  },

  // ============================================================
  // SHARE HELPERS
  // ============================================================

  getShareUrl(slug) {
    return window.location.origin + '/c/' + slug;
  },

  /**
   * Save creature state to localStorage (survives auth redirects).
   */
  saveCreatureState(slug) {
    if (slug) localStorage.setItem('aumage_creature_state', slug);
  },

  // ============================================================
  // COMMUNITY & EXPLORE
  // ============================================================

  /**
   * Get trending creatures of the current user (most likes/comments).
   */
  async getTrendingCreatures(limit = 8) {
    if (!this.supabase || !this.user) return [];

    try {
      const { data, error } = await this.supabase
        .from('creatures')
        .select(`
          *,
          likes_count:creature_likes(count),
          comments_count:creature_comments(count)
        `)
        .eq('user_id', this.user.id)
        .eq('is_public', true) // Matching explore logic: trending is usually public
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform + calculate score (same logic as explore)
      const creatures = (data || []).map(c => ({
        ...c,
        likes_count: c.likes_count?.[0]?.count || 0,
        comments_count: c.comments_count?.[0]?.count || 0,
      }));

      // Sort by combined engagement (same as explore)
      creatures.sort((a, b) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count));

      return creatures.slice(0, limit);
    } catch (e) {
      console.error('AumageDB.getTrendingCreatures error:', e);
      return [];
    }
  },

  /**
   * Get creatures of the current user that have generated schematic cards,
   * sorted by most engagement (likes + comments).
   */
  async getTrendingCards(limit = 8) {
    if (!this.supabase || !this.user) return [];

    try {
      // 1. Fetch creatures first (with filters)
      const { data: creaturesData, error: creaturesError } = await this.supabase
        .from('creatures')
        .select('*')
        .neq('card_image_url', null)
        .neq('card_image_url', '')
        .eq('user_id', this.user.id)
        .eq('is_public', true);

      if (creaturesError) throw creaturesError;
      if (!creaturesData || creaturesData.length === 0) return [];

      const ids = creaturesData.map(c => c.id);

      // 2. Fetch likes and comments separately for these IDs
      // We only fetch the creature_id to count them
      const [likesRes, commentsRes] = await Promise.all([
        this.supabase.from('creature_likes').select('creature_id, user_id').in('creature_id', ids),
        this.supabase.from('creature_comments').select('creature_id').in('creature_id', ids)
      ]);

      const likesData = likesRes.data || [];
      const commentsData = commentsRes.data || [];

      // 3. Aggregate counts
      const likesMap = {};
      const commentsMap = {};

      likesData.forEach(l => {
        likesMap[l.creature_id] = (likesMap[l.creature_id] || 0) + 1;
      });
      commentsData.forEach(c => {
        commentsMap[c.creature_id] = (commentsMap[c.creature_id] || 0) + 1;
      });

      // 4. Map back to creatures
      const creatures = creaturesData.map(c => {
        const isLiked = likesData.some(l => l.creature_id === c.id && l.user_id === this.user.id);
        return {
          ...c,
          likes_count: likesMap[c.id] || 0,
          comments_count: commentsMap[c.id] || 0,
          isLiked: isLiked,
          likedStyle: isLiked ? 'style="color: #ff4d4f"' : ''
        };
      });

      // 5. Sort primarily by likes (descending), then by comments, then by recency (created_at)
      creatures.sort((a, b) => {
        if (b.likes_count !== a.likes_count) {
          return b.likes_count - a.likes_count;
        }
        if (b.comments_count !== a.comments_count) {
          return b.comments_count - a.comments_count;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });

      console.log("creatures (aggregated)", creatures);

      return creatures.slice(0, limit);
    } catch (e) {
      console.error('AumageDB.getTrendingCards error:', e);
      return [];
    }
  },

  /**
   * Get creatures of a specific trope that have generated schematic cards.
   */
  async getTrendingCardsByTrope(tropeKey, limit = 8) {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('creatures')
      .select(`
        *,
        profiles:user_id(display_name, avatar_url),
        likes:creature_likes(user_id),
        comments:creature_comments(count)
      `)
      .neq('card_image_url', '')
      .not('card_image_url', 'is', null)
      .eq('is_public', true)
      .ilike('trope_class', tropeKey)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('AumageDB getTrendingCardsByTrope error:', error);
      return [];
    }

    return (data || []).map(c => {
      const isLiked = c.likes?.some(l => l.user_id === this.user?.id) || false;
      return {
        ...c,
        likes_count: c.likes?.length || 0,
        comments_count: c.comments?.[0]?.count || 0,
        isLiked: isLiked,
        likedStyle: isLiked ? 'style="color: #ff4d4f"' : ''
      };
    });
  },

  /**
   * Get latest creatures of the current user (User's "Popular" definition).
   */
  async getPopularCreatures(limit = 20) {
    if (!this.supabase || !this.user) return [];

    // Fetch current user's creatures ordered by latest
    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('AumageDB getPopularCreatures error:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Get public creatures through the Worker API for Explore.
   * This ensures we get card_image_url filtered data.
   */
  async getExploreCards(limit = 50, sort = 'latest') {
    if (!this.supabase) return [];

    // Ensure auth is rehydrated before calculating isLiked
    if (!this.user) {
      const { data: { user } } = await this.supabase.auth.getUser();
      this.user = user;
    }

    if (sort === 'tradeable') {
      try {
        const { data, error } = await this.supabase
          .from('creatures')
          .select(`
            *,
            profiles:user_id(display_name, avatar_url),
            likes:creature_likes(user_id),
            comments:creature_comments(count)
          `)
          .eq('is_public', true)
          .eq('is_tradeable', true)
          .not('card_image_url', 'is', null)
          .neq('card_image_url', '')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('AumageDB.getExploreCards (tradeable) query error:', error);
          throw error;
        }

        // Transform counts and ensure format matches Worker API
        const transformed = (data || []).map(c => {
          const isLiked = c.likes?.some(l => l.user_id === this.user?.id) || false;
          return {
            ...c,
            likes_count: c.likes?.length || 0,
            comments_count: c.comments?.[0]?.count || 0,
            isLiked: isLiked,
            likedStyle: isLiked ? 'style="color: #ff4d4f"' : ''
          };
        });

        console.log(`Found ${transformed.length} tradeable creatures`);
        return transformed;
      } catch (e) {
        console.error('AumageDB.getExploreCards (tradeable) catch block:', e);
        return [];
      }
    }

    try {
      // On page refresh, we must ensure the auth state has rehydrated
      // We check session first, if missing we wait a tiny bit or check user
      let sessionData = await this.supabase.auth.getSession();

      // If we don't have a session immediately, try getUser which is more definitive on load
      if (!sessionData?.data?.session) {
        await this.supabase.auth.getUser();
        sessionData = await this.supabase.auth.getSession();
      }

      const token = sessionData?.data?.session?.access_token;

      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';
      const resp = await fetch(`${apiBase}/api/explore?limit=${limit}&sort=${sort}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!resp.ok) throw new Error(`Explore API failed: ${resp.status}`);
      const data = await resp.json();
      return (data || []).map(c => {
        const isLiked = c.user_has_liked || c.is_liked || c.isLiked || false;
        return {
          ...c,
          isLiked: isLiked,
          likedStyle: isLiked ? 'style="color: #ff4d4f"' : ''
        };
      });
    } catch (e) {
      console.error('AumageDB.getExploreCards error:', e);
      // Fallback to direct supabase if worker fails
      if (!this.supabase) return [];
      const { data, error } = await this.supabase
        .from('creatures')
        .select(`
          *,
          profiles:user_id(display_name, avatar_url),
          likes:creature_likes(user_id),
          comments:creature_comments(count)
        `)
        .eq('is_public', true)
        .not('card_image_url', 'is', null)
        .neq('card_image_url', '')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('AumageDB.getExploreCards fallback error:', error);
        return [];
      }

      return (data || []).map(c => {
        const isLiked = c.likes?.some(l => l.user_id === this.user?.id) || false;
        return {
          ...c,
          likes_count: c.likes?.length || 0,
          comments_count: c.comments?.[0]?.count || 0,
          isLiked: isLiked,
          likedStyle: isLiked ? 'style="color: #ff4d4f"' : ''
        };
      });
    }
  },

  /**
   * Get the most recent creature for a specific user ID.
   */
  async getUserRecentCreature(userId) {
    if (!this.supabase || !userId) return null;

    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn('AumageDB getUserRecentCreature warning:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Get the most recent creature CARD for a specific user ID.
   */
  async getUserRecentCard(userId) {
    if (!this.supabase || !userId) return null;

    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .neq('card_image_url', '')
      .not('card_image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn('AumageDB getUserRecentCard warning:', error.message);
      return null;
    }
    return data;
  },

  // ============================================================
  // UTILS
  // ============================================================

  /**
   * Generate a short alphanumeric share slug.
   */
  _generateSlug() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let slug = '';
    for (let i = 0; i < 7; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  },

  // ============================================================
  // PROFILE & PROGRESS
  // ============================================================

  /**
   * Fetch live user profile and level data from backend.
   */
  async getUserProfile() {
    if (!this.user) return null;

    try {
      const session = await this.supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      // Extract PIPELINE_URL from Aumage if available, or use default

      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';

      const resp = await fetch(`${apiBase}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!resp.ok) throw new Error(`Profile fetch failed: ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.error('AumageDB.getUserProfile error:', e);
      return null;
    }
  },

  /**
   * Update the JSONB settings column for the current profile.
   */
  async updateUserSettings(settings) {
    if (!this.user || !this.supabase) return null;
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ settings })
      .eq('id', this.user.id)
      .select('settings')
      .single();

    if (error) {
      console.error('AumageDB updateUserSettings error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Fetch the JSONB settings directly from Supabase.
   */
  async getUserSettings() {
    if (!this.user || !this.supabase) return {};
    const { data, error } = await this.supabase
      .from('profiles')
      .select('settings')
      .eq('id', this.user.id)
      .single();

    if (error) {
      console.warn('AumageDB getUserSettings warning:', error.message);
      return {};
    }
    return data.settings || {};
  },

  /**
   * Get global leaderboard (users with most creatures).
   */
  async getLeaderboard(limit = 6) {
    if (!this.supabase) return [];

    try {
      // 1. Get profiles with levels and XP
      const { data: profiles, error: profErr } = await this.supabase
        .from('profiles')
        .select('id, level, display_name, total_xp')
        .order('total_xp', { ascending: false })
        .limit(40); // Fetch more to allow count-based sorting if preferred

      if (profErr) throw profErr;

      const leaderboard = await Promise.all(profiles.map(async (p) => {
        const { count } = await this.supabase
          .from('creatures')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', p.id)
          .neq('card_image_url', '')
          .not('card_image_url', 'is', null);

        return {
          ...p,
          creature_count: count || 0
        };
      }));

      // Sort by creature count primarily, then XP
      return leaderboard
        .sort((a, b) => {
          if (b.creature_count !== a.creature_count) {
            return b.creature_count - a.creature_count;
          }
          return (b.total_xp || 0) - (a.total_xp || 0);
        })
        .slice(0, limit);
    } catch (e) {
      console.error('AumageDB.getLeaderboard error:', e);
      return [];
    }
  },

  /**
   * Fetch login streak status and rewards.
   */
  async getStreakStatus() {
    if (!this.user) return null;

    try {
      const session = await this.supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';

      const resp = await fetch(`${apiBase}/api/streak/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!resp.ok) throw new Error(`Streak status fetch failed: ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.error('AumageDB.getStreakStatus error:', e);
      return null;
    }
  },

  /**
   * Claim the next reward in the streak sequence.
   */
  async claimStreakReward() {
    if (!this.user) return null;

    try {
      const session = await this.supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';

      const resp = await fetch(`${apiBase}/api/streak/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!resp.ok) {
        const result = await resp.json();
        throw new Error(result.error || `Claim failed: ${resp.status}`);
      }
      return await resp.json();
    } catch (e) {
      console.error('AumageDB.claimStreakReward error:', e);
      throw e;
    }
  },

  // ============================================================
  // SOCIAL: LIKES & COMMENTS
  // ============================================================

  /**
   * Toggle like for a creature.
   */
  async toggleLike(creatureId) {
    if (!this.user) {
      alert('Please log in to like creatures!');
      return null;
    }

    try {
      const session = await this.supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';

      const resp = await fetch(`${apiBase}/api/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ creature_id: creatureId })
      });

      if (!resp.ok) throw new Error(`Like failed: ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.error('AumageDB.toggleLike error:', e);
      return null;
    }
  },

  /**
   * Get comments for a creature.
   */
  async getComments(creatureId) {
    try {
      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';
      const resp = await fetch(`${apiBase}/api/comments?creature_id=${creatureId}`);
      if (!resp.ok) throw new Error(`Comments fetch failed: ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.error('AumageDB.getComments error:', e);
      return [];
    }
  },

  /**
   * Post a comment for a creature.
   */
  async postComment(creatureId, content) {
    if (!this.user) {
      alert('Please log in to comment!');
      return null;
    }

    try {
      const session = await this.supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';

      const resp = await fetch(`${apiBase}/api/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ creature_id: creatureId, content })
      });

      if (!resp.ok) throw new Error(`Comment failed: ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.error('AumageDB.postComment error:', e);
      return null;
    }
  },

  /**
   * Calculate user achievements based on history.
   */
  async getAchievements() {
    if (!this.user) return null;

    try {
      // 1. Get creature count
      const { count: creatureCount, error: countErr } = await this.supabase
        .from('creatures')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.user.id);

      if (countErr) throw countErr;

      // 2. Check for rare creatures
      const { count: rareCount, error: rareErr } = await this.supabase
        .from('creatures')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.user.id)
        .neq('base_rarity', 'common');

      if (rareErr) throw rareErr;

      // 3. Get profile for level and streak
      const profileData = await this.getUserProfile();
      const profile = profileData?.profile || {};

      return {
        success: true,
        achievements: {
          pioneer: creatureCount > 0,
          elite: rareCount > 0,
          ascended: (profile.level || 1) >= 2,
          loyal: (profile.streak_count || 0) >= 1
        }
      };
    } catch (e) {
      console.error('AumageDB.getAchievements error:', e);
      return null;
    }
  },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  /**
   * Fetch notifications for the current user.
   */
  async getNotifications(limit = 20) {
    if (!this.supabase || !this.user) return [];

    try {
      // 1. Fetch notifications with creature details
      const { data: notifs, error } = await this.supabase
        .from('notifications')
        .select(`
          *,
          creature:creature_id(creature_name, image_url)
        `)
        .eq('recipient_id', this.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!notifs || notifs.length === 0) return [];

      // 2. Fetch unique actor profiles manually
      const actorIds = [...new Set(notifs.map(n => n.actor_id).filter(Boolean))];
      if (actorIds.length > 0) {
        const { data: profiles } = await this.supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', actorIds);

        if (profiles) {
          const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
          notifs.forEach(n => {
            if (n.actor_id && profileMap[n.actor_id]) {
              n.actor = profileMap[n.actor_id];
            }
          });
        }
      }

      return notifs;
    } catch (e) {
      console.error('AumageDB.getNotifications error:', e);
      return [];
    }
  },

  /**
   * Get unread notification count for the current user.
   */
  async getUnreadNotificationCount() {
    if (!this.supabase || !this.user) return 0;

    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', this.user.id)
      .eq('is_read', false);

    if (error) {
      console.error('AumageDB getUnreadNotificationCount error:', error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Mark a notification as read.
   */
  async markNotificationAsRead(id) {
    if (!this.supabase || !this.user) return null;

    const { data, error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('recipient_id', this.user.id)
      .select()
      .single();

    if (error) {
      console.error('AumageDB markNotificationAsRead error:', error);
      return null;
    }

    return data;
  },

  /**
   * Mark all notifications as read.
   */
  async markAllNotificationsAsRead() {
    if (!this.supabase || !this.user) return false;

    return true;
  },

  // ============================================================
  // CONNECTIONS
  // ============================================================

  /**
   * Send a connection request to another user.
   */
  async sendConnectionRequest(receiverId) {
    if (!this.supabase || !this.user) return null;

    try {
      // 1. Create connection record
      const { data, error } = await this.supabase
        .from('connections')
        .insert({
          requester_id: this.user.id,
          receiver_id: receiverId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Duplicate connection
          return { success: false, error: 'Connection already exists or is pending.' };
        }
        throw error;
      }

      // 2. Create notification for receiver
      await this.supabase.from('notifications').insert({
        recipient_id: receiverId,
        actor_id: this.user.id,
        type: 'connection_request',
        metadata: {
          connection_id: data.id,
          message: 'wants to connect with you'
        }
      });

      return { success: true, data };
    } catch (e) {
      console.error('AumageDB.sendConnectionRequest error:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Accept a connection request.
   */
  async acceptConnectionRequest(connectionId) {
    if (!this.supabase || !this.user) return null;

    try {
      // 1. Update connection status
      const { data: connection, error } = await this.supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .eq('receiver_id', this.user.id)
        .select()
        .single();

      if (error) throw error;

      // 2. Notify the requester
      await this.supabase.from('notifications').insert({
        recipient_id: connection.requester_id,
        actor_id: this.user.id,
        type: 'connection_accepted',
        metadata: {
          connection_id: connection.id,
          message: 'accepted your connection request'
        }
      });

      return { success: true, connection };
    } catch (e) {
      console.error('AumageDB.acceptConnectionRequest error:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Get connection status with another user.
   */
  async getConnectionStatus(otherUserId) {
    if (!this.supabase || !this.user) return null;

    try {
      const { data, error } = await this.supabase
        .from('connections')
        .select('*')
        .or(`and(requester_id.eq.${this.user.id},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${this.user.id})`)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('AumageDB.getConnectionStatus error:', e);
      return null;
    }
  },

  /**
   * Fetch all accepted conversations (connections) for the current user.
   */
  async getConversations() {
    if (!this.supabase || !this.user) return [];

    try {
      // 1. Fetch connection records
      const { data: conns, error } = await this.supabase
        .from('connections')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${this.user.id},receiver_id.eq.${this.user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!conns || conns.length === 0) return [];

      // 2. Collect unique user IDs to fetch profiles
      const userIds = new Set();
      conns.forEach(c => {
        userIds.add(c.requester_id);
        userIds.add(c.receiver_id);
      });
      userIds.delete(this.user.id); // We don't need our own profile here

      // 3. Fetch profiles
      const { data: profiles } = await this.supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', Array.from(userIds));

      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

      // 4. Transform and fetch last message/unread count
      const conversations = await Promise.all(conns.map(async (c) => {
        const otherUserId = c.requester_id === this.user.id ? c.receiver_id : c.requester_id;
        const otherUser = profileMap[otherUserId] || { id: otherUserId, display_name: 'Explorer' };

        // Fetch last message
        const { data: lastMsg } = await this.supabase
          .from('messages')
          .select('*')
          .eq('connection_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Count unread
        const { count: unreadCount } = await this.supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('connection_id', c.id)
          .eq('is_read', false)
          .neq('sender_id', this.user.id);

        return {
          ...c,
          otherUser,
          lastMessage: lastMsg,
          unreadCount: unreadCount || 0
        };
      }));

      return conversations;
    } catch (e) {
      console.error('AumageDB.getConversations error:', e);
      return [];
    }
  },

  /**
   * Fetch messages for a specific connection.
   */
  async getMessages(connectionId, limit = 50) {
    if (!this.supabase || !this.user) return [];

    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('AumageDB.getMessages error:', e);
      return [];
    }
  },

  /**
   * Send a message.
   */
  async sendMessage(connectionId, content, type = 'text') {
    if (!this.supabase || !this.user) return null;

    try {
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          connection_id: connectionId,
          sender_id: this.user.id,
          content: content,
          message_type: type
        })
        .select()
        .single();

      if (error) throw error;

      // Update connection's updated_at to bring it to top of inbox
      await this.supabase
        .from('connections')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      return data;
    } catch (e) {
      console.error('AumageDB.sendMessage error:', e);
      return null;
    }
  },

  /**
   * Mark messages as read for a connection.
   */
  async markMessagesAsRead(connectionId) {
    if (!this.supabase || !this.user) return false;

    try {
      const { error } = await this.supabase
        .from('messages')
        .update({ is_read: true })
        .eq('connection_id', connectionId)
        .neq('sender_id', this.user.id)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('AumageDB.markMessagesAsRead error:', e);
      return false;
    }
  },

  /**
   * Fetch all connections for the current user (Pending, Accepted, etc.).
   */
  async getAllConnections() {
    if (!this.supabase || !this.user) return [];

    try {
      const { data: conns, error } = await this.supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${this.user.id},receiver_id.eq.${this.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!conns || conns.length === 0) return [];

      const userIds = new Set();
      conns.forEach(c => {
        userIds.add(c.requester_id);
        userIds.add(c.receiver_id);
      });
      userIds.delete(this.user.id);

      const { data: profiles } = await this.supabase
        .from('profiles')
        .select('*') // Get all fields just in case
        .in('id', Array.from(userIds));

      const profileMap = {};
      if (profiles) {
        profiles.forEach(p => {
          profileMap[p.id] = p;
        });
      }

      return conns.map(c => {
        // Use a more robust comparison for IDs
        const currentId = this.user.id;
        const isRequester = c.requester_id === currentId;
        const otherUserId = isRequester ? c.receiver_id : c.requester_id;

        return {
          ...c,
          otherUser: profileMap[otherUserId] || {
            id: otherUserId,
            display_name: 'Explorer #' + otherUserId.substring(0, 4)
          }
        };
      });
    } catch (e) {
      console.error('AumageDB.getAllConnections error:', e);
      return [];
    }
  },

  /**
   * Fetch creatures for a specific user.
   */
  async getCreaturesByUserId(userId, limit = 2) {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('creatures')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('AumageDB.getCreaturesByUserId error:', e);
      return [];
    }
  }
};

// Make globally available
window.AumageDB = AumageDB;

/**
 * Streak System Controller
 * Handles the UI logic for the daily streak rewards modal.
 */
const StreakUI = {
  async init() {
    const grid = document.getElementById('streakGrid');
    if (!grid) return;

    console.log('StreakUI: Initializing...');

    try {
      // Ensure AumageDB is ready
      if (!window.AumageDB || !window.AumageDB.user) {
        console.log('StreakUI: Waiting for AumageDB user...');
        return;
      }

      // 1. Fetch status from API
      const status = await window.AumageDB.getStreakStatus();
      if (!status || !status.success) {
        grid.innerHTML = '<p class="error-msg" style="color: #ef4444; padding: 20px; text-align: center;">Failed to load streak status.</p>';
        return;
      }

      const { streak_count, last_reward_index, rewards } = status;

      // 2. Update Header Counter
      const countEl = document.querySelector('.streak-count');
      if (countEl) countEl.textContent = streak_count;

      // 3. Populate Grid
      grid.innerHTML = '';

      for (let day = 1; day <= 30; day++) {
        const xp = rewards[day] || 0;
        const isClaimed = day <= last_reward_index;
        const isAvailable = day === (last_reward_index + 1) && day <= streak_count;

        const item = document.createElement('div');
        item.className = 'streak-item';
        if (isClaimed) item.classList.add('streak-item--claimed');
        if (isAvailable) item.classList.add('streak-item--active');

        // Special styling for Day 30
        if (day === 30) {
          item.style.borderColor = '#ffd700';
          if (!isClaimed) item.style.background = 'rgba(255, 215, 0, 0.05)';
        }

        item.innerHTML = `
          <span class="streak-day" ${day === 30 ? 'style="color: #ffd700;"' : ''}>Day ${day}</span>
          <div class="streak-icon" ${day === 30 && !isClaimed ? 'style="color: #ffd700;"' : ''}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <span class="streak-reward">${xp} XP</span>
        `;

        if (isAvailable) {
          item.style.cursor = 'pointer';
          item.title = 'Click to Claim Day ' + day + '!';
          item.onclick = (e) => {
            e.preventDefault();
            this.claim(day);
          };
        }

        grid.appendChild(item);
      }
    } catch (err) {
      console.error('StreakUI.init error:', err);
      grid.innerHTML = '<p class="error-msg" style="color: #ef4444; padding: 20px; text-align: center;">Error loading rewards.</p>';
    }
  },

  async claim(day) {
    try {
      // Disable clicking while processing
      const grid = document.getElementById('streakGrid');
      if (grid) {
        grid.style.pointerEvents = 'none';
        grid.style.opacity = '0.7';
      }

      const result = await window.AumageDB.claimStreakReward();

      if (result.success) {
        console.log('Reward claimed!', result);

        // Refresh UI
        await this.init();

        // Update main sidebar stats
        if (window.AumageDB.updateSidebarStats) {
          window.AumageDB.updateSidebarStats();
        }

        // Level Up Modal
        if (result.leveledUp) {
          const oldLvl = document.getElementById('lvl-old');
          const newLvl = document.getElementById('lvl-new');
          const toggle = document.getElementById('levelUpModalToggle');

          if (oldLvl) oldLvl.textContent = result.profile.level - 1;
          if (newLvl) newLvl.textContent = result.profile.level;
          if (toggle) toggle.checked = true;
        }
      }
    } catch (err) {
      console.error('Claim error:', err);
      alert(err.message || 'Failed to claim reward');
    } finally {
      const grid = document.getElementById('streakGrid');
      if (grid) {
        grid.style.pointerEvents = 'auto';
        grid.style.opacity = '1';
      }
    }
  }
};

/**
 * High-performance Canvas Particle Engine
 */
const ConfettiEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,
  active: false,

  init() {
    this.canvas = document.getElementById('levelUpCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  },

  burst() {
    this.particles = [];
    const colors = ['#08D2C1', '#00f2e0', '#ffffff', '#ffd700', '#ff6b00'];

    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 5,
        gravity: 0.3,
        friction: 0.95,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    if (!this.active) {
      this.active = true;
      this.render();
    }

    // Add "active" class to overlay for the CSS flash effect
    const overlay = document.querySelector('.level-up-modal-overlay');
    if (overlay) {
      overlay.classList.add('active');
      setTimeout(() => overlay.classList.remove('active'), 1000);
    }
  },

  render() {
    if (!this.active) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let alive = false;
    this.particles.forEach(p => {
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (p.y < this.canvas.height) {
        alive = true;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation * Math.PI / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }
    });

    if (alive) {
      this.animationId = requestAnimationFrame(() => this.render());
    } else {
      this.active = false;
    }
  }
};

/**
 * Notification System Controller
 * Handles fetching, counting, and displaying notifications.
 */
const NotificationUI = {
  pollInterval: null,
  currentFilter: 'all',

  async init() {
    console.log('NotificationUI: Initializing...');
    await this.refresh();

    // Set up polling (every 30 seconds)
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => this.refresh(), 30000);

    // Listen for offcanvas open to refresh or mark as read
    document.addEventListener('change', (e) => {
      if (e.target.id === 'notiOffcanvasToggle' && e.target.checked) {
        this.loadNotifications();
      }
    });

    // Mark all as read button
    document.addEventListener('click', async (e) => {
      if (e.target.closest('.noti-action-btn')) {
        await window.AumageDB.markAllNotificationsAsRead();
        this.refresh();
        this.loadNotifications();
      }
    });

    // Filter buttons
    document.addEventListener('click', (e) => {
      const filterBtn = e.target.closest('.noti-filter');
      if (filterBtn) {
        const filter = filterBtn.dataset.filter;
        this.currentFilter = filter;

        // Update active class
        const filterContainer = filterBtn.parentElement;
        if (filterContainer) {
          filterContainer.querySelectorAll('.noti-filter').forEach(btn => btn.classList.remove('active'));
          filterBtn.classList.add('active');
        }

        this.loadNotifications();
      }
    });
  },

  async refresh() {
    if (!window.AumageDB || !window.AumageDB.user) return;

    const count = await window.AumageDB.getUnreadNotificationCount();
    this.updateCounter(count);
  },

  updateCounter(count) {
    const badge = document.getElementById('noti-badge');
    if (badge) {
      if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count > 99 ? '99+' : count;
      } else {
        badge.style.display = 'none';
      }
    }
  },

  async loadNotifications() {
    const list = document.querySelector('.noti-list');
    if (!list) {
      console.warn('NotificationUI: .noti-list element not found');
      return;
    }

    console.log('NotificationUI: Loading notifications...');
    list.innerHTML = '<div class="noti-loading" style="padding: 20px; text-align: center; color: var(--text-muted);">Loading...</div>';

    try {
      const notifs = await window.AumageDB.getNotifications();
      console.log('NotificationUI: Fetched', notifs?.length || 0, 'notifications');

      if (!notifs || notifs.length === 0) {
        list.innerHTML = '<div class="noti-empty" style="padding: 40px 20px; text-align: center; color: var(--text-muted);">No notifications yet.</div>';
        return;
      }

      // Filter logic
      let filtered = notifs;
      if (this.currentFilter === 'unread') {
        filtered = notifs.filter(n => !n.is_read);
      } else if (this.currentFilter === 'read') {
        filtered = notifs.filter(n => n.is_read);
      }

      if (filtered.length === 0) {
        list.innerHTML = `<div class="noti-empty" style="padding: 40px 20px; text-align: center; color: var(--text-muted);">No ${this.currentFilter} notifications.</div>`;
        return;
      }

      list.innerHTML = filtered.map(n => this.renderNotification(n)).join('');

      // Add click events to mark as read
      list.querySelectorAll('.noti-item').forEach(item => {
        item.onclick = async () => {
          const id = item.dataset.id;
          if (item.classList.contains('noti-item--unread')) {
            await window.AumageDB.markNotificationAsRead(id);
            this.refresh();
            // Instead of reloading everything, just update the local item state
            item.classList.remove('noti-item--unread');
            const statusDot = item.querySelector('.noti-item__status');
            if (statusDot) statusDot.remove();

            // If we are in "unread" filter, remove it from list
            if (this.currentFilter === 'unread') {
              item.style.opacity = '0';
              setTimeout(() => item.remove(), 300);
            }
          }
        };

        // Handle Connection Accept/Reject buttons
        const acceptBtn = item.querySelector('.btn-noti-accept');
        const rejectBtn = item.querySelector('.btn-noti-reject');

        if (acceptBtn) {
          acceptBtn.onclick = async (e) => {
            e.stopPropagation();
            const connId = acceptBtn.dataset.connId;
            acceptBtn.disabled = true;
            acceptBtn.textContent = '...';
            const res = await window.AumageDB.acceptConnectionRequest(connId);
            if (res.success) {
              acceptBtn.parentElement.innerHTML = '<span style="color: var(--color-primary); font-size: 12px;">Connected ✓</span>';
              // Mark notification as read
              await window.AumageDB.markNotificationAsRead(item.dataset.id);
              item.classList.remove('noti-item--unread');
              const statusDot = item.querySelector('.noti-item__status');
              if (statusDot) statusDot.remove();
              this.refresh();
            } else {
              acceptBtn.disabled = false;
              acceptBtn.textContent = 'Accept';
              alert('Failed to accept: ' + res.error);
            }
          };
        }

        if (rejectBtn) {
          rejectBtn.onclick = async (e) => {
            e.stopPropagation();
            // Just mark as read for now, we don't have a "reject" logic that does more
            await window.AumageDB.markNotificationAsRead(item.dataset.id);
            item.style.opacity = '0.5';
            rejectBtn.parentElement.innerHTML = '<span style="color: #888; font-size: 12px;">Ignored</span>';
            this.refresh();
          };
        }
      });
    } catch (err) {
      console.error('NotificationUI: Error loading notifications:', err);
      list.innerHTML = '<div class="noti-error" style="padding: 20px; text-align: center; color: var(--color-danger);">Failed to load.</div>';
    }
  },

  renderNotification(n) {
    const isUnread = !n.is_read;
    const time = this.formatTime(n.created_at);

    // Default values
    let avatar = 'https://ui-avatars.com/api/?name=System&background=fbbf24&color=fff';
    let text = n.metadata?.message || 'New notification';
    let iconBg = '#08D2C1';
    let iconSvg = '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>';

    const actorName = n.actor?.display_name || 'Someone';
    const creatureName = n.creature?.creature_name || 'your creature';

    // Set avatar from actor or creature
    if (n.actor?.avatar_url) {
      avatar = n.actor.avatar_url;
    } else if (n.creature?.image_url) {
      avatar = n.creature.image_url;
    }

    // Custom rendering based on type
    if (n.type === 'like') {
      iconBg = '#ff4d4f';
      iconSvg = '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>';
      text = `<strong>${actorName}</strong> liked your creature <strong>${creatureName}</strong>.`;
    } else if (n.type === 'comment') {
      iconBg = '#60a5fa';
      iconSvg = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>';
      text = `<strong>${actorName}</strong> commented on <strong>${creatureName}</strong>.`;
    } else if (n.type === 'system') {
      iconBg = '#fbbf24';
      iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
    } else if (n.type === 'connection_request') {
      iconBg = '#8b5cf6';
      iconSvg = '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>';
      text = `<strong>${actorName}</strong> wants to connect with you.`;
    } else if (n.type === 'connection_accepted') {
      iconBg = '#10b981';
      iconSvg = '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline>';
      text = `<strong>${actorName}</strong> accepted your connection request.`;
    }

    // Add buttons for connection requests
    let actions = '';
    if (n.type === 'connection_request' && isUnread) {
      actions = `
        <div class="noti-item__actions" style="margin-top: 8px; display: flex; gap: 8px;">
          <button class="btn-noti-accept" data-conn-id="${n.metadata?.connection_id}" style="padding: 4px 12px; background: var(--color-primary); color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Accept</button>
          <button class="btn-noti-reject" data-conn-id="${n.metadata?.connection_id}" style="padding: 4px 12px; background: #eee; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Ignore</button>
        </div>
      `;
    }

    return `
      <div class="noti-item ${isUnread ? 'noti-item--unread' : ''}" data-id="${n.id}">
        <div class="noti-item__avatar">
          <img src="${avatar}" alt="Notification">
          <div class="noti-item__type-icon" style="background: ${iconBg};">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              ${iconSvg}
            </svg>
          </div>
        </div>
        <div class="noti-item__content">
          <div class="noti-item__text">${text}</div>
          <div class="noti-item__time">${time}</div>
          ${actions}
        </div>
        ${isUnread ? '<div class="noti-item__status"></div>' : ''}
      </div>
    `;
  },

  formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000; // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return date.toLocaleDateString();
  }
};

window.StreakUI = StreakUI;
window.NotificationUI = NotificationUI;
window.ConfettiEngine = ConfettiEngine;

// Auto-initialize when possible
(function () {
  const tryInit = () => {
    if (window.AumageDB && window.AumageDB.user) {
      if (document.getElementById('streakGrid')) window.StreakUI.init();
      if (document.getElementById('levelUpCanvas')) window.ConfettiEngine.init();
      window.NotificationUI.init();
      return true;
    }
    return false;
  };

  // Listen for signals that UI or data might be ready
  document.addEventListener('componentsLoaded', tryInit);

  // Re-init on manual modal open
  document.addEventListener('change', (e) => {
    if (e.target.id === 'streakModalToggle' && e.target.checked) {
      window.StreakUI.init();
    }
    if (e.target.id === 'levelUpModalToggle' && e.target.checked) {
      setTimeout(() => window.ConfettiEngine.burst(), 100);
    }
  });

  // Polling fallback
  const poll = setInterval(() => {
    if (tryInit()) clearInterval(poll);
  }, 1000);
  setTimeout(() => clearInterval(poll), 15000);
})();
