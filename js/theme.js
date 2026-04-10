/**
 * Hoheto Kai Theme Manager
 * Centralizes theme toggling and initialization.
 */
const ThemeManager = {
    init() {
        // 1. Immediately apply theme to avoid flash
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
        }

        // 2. Wait for components (header) to load, then setup the button and icon
        // Check if header is already loaded or wait for the event
        if (document.getElementById('themeToggle')) {
            this.setupToggle();
        } else {
            document.addEventListener('componentsLoaded', () => {
                this.setupToggle();
            });
        }
    },

    setupToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const body = document.body;
        
        const updateThemeIcon = (theme) => {
            const icon = themeToggle.querySelector('svg');
            if (!icon) return;
            if (theme === 'light') {
                icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
            } else {
                icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
            }
        };

        // Sync icon on startup
        const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
        updateThemeIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const isLight = body.classList.toggle('light-mode');
            const newTheme = isLight ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
};

// Auto-init on script load
ThemeManager.init();
