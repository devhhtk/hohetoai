/**
 * Hoheto Kai Component Loader
 * Loads HTML components into designated placeholders.
 */
const ComponentLoader = {
    async load(placeholderId, componentPath) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;

        try {
            const response = await fetch(componentPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            placeholder.outerHTML = html;
            return true;
        } catch (error) {
            console.error(`Failed to load component: ${componentPath}`, error);
            return false;
        }
    },

    async loadAll(components = []) {
        const promises = components.map(c => this.load(c.id, c.path));
        await Promise.all(promises);
        // Dispatch a custom event when all components are loaded
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
    }
};

window.ComponentLoader = ComponentLoader;
