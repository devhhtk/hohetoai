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
      }
    });

    // Listen for auth changes (magic link return, etc.)
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null;
      this.updateAuthUI();
      if (event === 'SIGNED_IN') {
        console.log('AumageDB: Signed in');
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
    
    const name = profile.display_name || this.user.email?.split('@')[0] || 'Storyteller';
    const uidTruncated = this.user.id.substring(0, 12).toUpperCase() + '...';

    if (profName) profName.textContent = name;
    if (profUID) profUID.textContent = `UID: ${uidTruncated}`;
    if (greetName) greetName.textContent = name;
    
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
    promptHash, waveformHash
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
   * Get trending creatures (latest public creations).
   */
  async getTrendingCreatures(limit = 8) {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('AumageDB getTrendingCreatures error:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Get creatures that have generated schematic cards.
   */
  async getTrendingCards(limit = 8) {
    if (!this.supabase) return [];
    // We check for card_image_url presence
    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
      .neq('card_image_url', '')
      .not('card_image_url', 'is', null)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('AumageDB getTrendingCards error:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Get creatures of a specific trope that have generated schematic cards.
   */
  async getTrendingCardsByTrope(tropeKey, limit = 8) {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
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
    return data || [];
  },

  /**
   * Get popular creatures (for now, fetching a mixed sample).
   */
  async getPopularCreatures(limit = 20) {
    if (!this.supabase) return [];
    // Currently using random sample of public creatures since no like/view metrics exist yet
    const { data, error } = await this.supabase
      .from('creatures')
      .select('*')
      .eq('is_public', true)
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
  async getExploreCards(limit = 50) {
    try {
      const apiBase = window.Aumage?.PIPELINE_URL || 'https://hohetai-api.devhhtk.workers.dev';
      const resp = await fetch(`${apiBase}/api/explore?limit=${limit}`);
      if (!resp.ok) throw new Error(`Explore API failed: ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.error('AumageDB.getExploreCards error:', e);
      // Fallback to direct supabase if worker fails
      if (!this.supabase) return [];
      const { data } = await this.supabase
        .from('creatures')
        .select('*')
        .eq('is_public', true)
        .not('card_image_url', 'is', null)
        .neq('card_image_url', '')
        .order('created_at', { ascending: false })
        .limit(limit);
      return data || [];
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

window.StreakUI = StreakUI;
window.ConfettiEngine = ConfettiEngine;

// Auto-initialize when possible
(function() {
  const tryInit = () => {
    if (window.AumageDB && window.AumageDB.user && document.getElementById('streakGrid')) {
      window.StreakUI.init();
      window.ConfettiEngine.init();
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
