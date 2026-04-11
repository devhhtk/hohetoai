/**
 * Creature Details — Page Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Components
    await ComponentLoader.loadAll([
        { id: 'comp-sidebar', path: '../components/sidebar.html' },
        { id: 'comp-header', path: '../components/header.html' },
        { id: 'comp-footer', path: '../components/footer.html' }
    ]);

    // 2. Auth & DB Init
    if (window.AumageDB) {
        window.AumageDB.init();
        await window.AumageDB.requireAuth();
    }

    // Update Header Title
    const headerTitle = document.querySelector('.top-bar__title');
    if (headerTitle) headerTitle.textContent = 'Creature Manifest';

    // 3. Parse Slug/ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('s'); // Share slug
    const id = urlParams.get('id');   // Direct ID

    if (!slug && !id) {
        showError('No identifier provided.');
        return;
    }

    // 4. Fetch Data
    try {
        let creature = null;
        if (slug) {
            creature = await window.AumageDB.getCreatureBySlug(slug);
        } else if (id) {
            const { data, error } = await window.AumageDB.supabase
                .from('creatures')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            creature = data;
        }

        if (creature) {
            renderCreature(creature);
        } else {
            showError('Biological record not found.');
        }
    } catch (err) {
        console.error('Fetch error:', err);
        showError('System error retrieving neural data.');
    }
});

function renderCreature(c) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('details-view').style.display = 'flex';

    // Basic Info
    document.title = (c.creature_name || 'Unnamed') + ' — HoHeTo Kai';
    document.getElementById('creature-name').textContent = c.creature_name || 'Unnamed Specimen';
    document.getElementById('creature-img').src = c.card_image_url || c.image_url || '../img/placeholder.png';
    document.getElementById('creature-serial').textContent = c.serial_number || 'SN-UNKNOWN';
    
    // Rarity
    const rarity = (c.base_rarity || 'common').toLowerCase();
    const rarityEl = document.getElementById('creature-rarity');
    rarityEl.textContent = rarity.toUpperCase();
    rarityEl.className = `rarity-badge rarity-${rarity}`;

    // Flavor Text
    document.getElementById('creature-flavor').textContent = c.flavor_text || 'A unique biological manifestation extracted from visual signals.';

    // Stats Grid
    const statsGrid = document.getElementById('stats-grid');
    const stats = c.variant_tags || {};
    // Fallback if variant_tags is empty but ars exists
    if (Object.keys(stats).length === 0 && c.ars) {
        stats.intensity = Math.floor(c.ars * 100);
        stats.complexity = 30 + Math.floor(Math.random() * 40);
        stats.harmony = 50;
    }

    const statFields = [
        { key: 'complexity', label: 'Complexity' },
        { key: 'intensity', label: 'Intensity' },
        { key: 'harmony', label: 'Harmony' },
        { key: 'power', label: 'Power' },
        { key: 'defense', label: 'Shielding' },
        { key: 'agility', label: 'Agility' }
    ];

    statsGrid.innerHTML = statFields.map(f => {
        const val = stats[f.key] || stats[f.label.toLowerCase()] || 0;
        if (val === 0 && !['complexity', 'intensity', 'harmony'].includes(f.key)) return ''; // Hide empty stats unless core
        return `
            <div class="stat-item">
                <div class="stat-header">
                    <span class="stat-name">${f.label}</span>
                    <span class="stat-value">${val}%</span>
                </div>
                <div class="stat-bar-outer">
                    <div class="stat-bar-inner" style="width: ${val}%"></div>
                </div>
            </div>
        `;
    }).join('');

    // Taxonomy Tags
    const tagsFlex = document.getElementById('tags-flex');
    const tags = [
        { label: 'Trope Class', val: c.trope_class },
        { label: 'Element', val: c.element },
        { label: 'Domain', val: c.domain },
        { label: 'Morphology', val: c.morphology },
        { label: 'Tier', val: c.tier },
        { label: 'Climate', val: c.climate_zone }
    ];

    tagsFlex.innerHTML = tags.map(t => {
        if (!t.val) return '';
        return `
            <div class="tag-badge">
                <span class="tag-key">${t.label}</span>
                <span class="tag-val">${t.val}</span>
            </div>
        `;
    }).join('');

    // Action Buttons
    const downloadBtn = document.getElementById('downloadImageBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = c.card_image_url || c.image_url;
            link.download = `${c.creature_name || 'creature'}.png`;
            link.target = '_blank';
            link.click();
        };
    }

    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.onclick = () => {
            const slug = c.share_slug;
            const id = c.id;
            const param = slug ? `s=${slug}` : `id=${id}`;
            const url = `${window.location.origin}/auth/creature-details.html?${param}`;
            navigator.clipboard.writeText(url).then(() => {
                const originalText = shareBtn.textContent;
                shareBtn.textContent = 'Link Copied!';
                setTimeout(() => shareBtn.textContent = originalText, 2000);
            });
        };
    }
}

function showError(msg) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
    console.error('Creature Details Error:', msg);
}
