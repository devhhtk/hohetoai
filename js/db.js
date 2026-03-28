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
    } else {
      if (loggedOut) loggedOut.classList.remove('hidden');
      if (loggedIn) loggedIn.classList.add('hidden');
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
  }
};

// Make globally available
window.AumageDB = AumageDB;
