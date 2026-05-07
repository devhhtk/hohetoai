/**
 * Hoheto Kai Admin Component Loader
 * Loads admin-specific HTML components into placeholders.
 */
const AdminComponentLoader = {
    async load(placeholderId, componentPath) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;

        try {
            const response = await fetch(componentPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            
            // Replace placeholder with component content
            placeholder.outerHTML = html;
            return true;
        } catch (error) {
            console.error(`Failed to load admin component: ${componentPath}`, error);
            return false;
        }
    },

    async loadAll(components = []) {
        const promises = components.map(c => this.load(c.id, c.path));
        await Promise.all(promises);
        // Dispatch event for any post-load initialization
        document.dispatchEvent(new CustomEvent('adminComponentsLoaded'));
    }
};

window.AdminComponentLoader = AdminComponentLoader;
