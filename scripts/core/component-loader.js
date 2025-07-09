// Component Loader for Portfolio - FIXED VERSION with DEBUG
class ComponentLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.loadingPromises = new Map();
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Load HTML content from external files
     * @param {string} containerId - The ID of the container element
     * @param {string} filePath - Path to the HTML file to load
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise that resolves when content is loaded
     */
    async loadHTML(containerId, filePath, options = {}) {
        const cacheKey = `${containerId}-${filePath}`;
        
        // Return existing promise if already loading
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        // Return resolved promise if already loaded and not forcing reload
        if (this.loadedComponents.has(cacheKey) && !options.forceReload) {
            return Promise.resolve();
        }

        const loadPromise = this._loadHTMLInternal(containerId, filePath, options);
        this.loadingPromises.set(cacheKey, loadPromise);

        try {
            await loadPromise;
            this.loadedComponents.add(cacheKey);
            this.loadingPromises.delete(cacheKey);
            return;
        } catch (error) {
            this.loadingPromises.delete(cacheKey);
            throw error;
        }
    }

    async _loadHTMLInternal(containerId, filePath, options = {}) {
        const { showLoader = true, retries = this.retryAttempts } = options;
        
        console.log(`Loading component: ${filePath} into ${containerId}`);
        
        if (showLoader) {
            this._showComponentLoader(containerId);
        }

        let lastError;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(filePath, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'text/html'
                    },
                    cache: 'no-cache'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
                }
                
                const html = await response.text();
                const container = document.getElementById(containerId);
                
                if (!container) {
                    throw new Error(`Container with ID '${containerId}' not found`);
                }
                
                // DEBUG: Log what we're loading
                console.log(`Loading HTML into ${containerId}:`, html.substring(0, 100) + '...');
                
                // Sanitize HTML before insertion
                const sanitizedHTML = this._sanitizeHTML(html);
                container.innerHTML = sanitizedHTML;
                
                // DEBUG: Check if the content was loaded correctly
                const loadedElement = container.querySelector('.content-section');
                if (loadedElement) {
                    console.log(`✅ Successfully loaded section: ${loadedElement.id}`);
                } else {
                    console.warn(`⚠️ No .content-section found in ${containerId}`);
                }
                
                // Process any scripts in the loaded content
                this._processScripts(container);
                
                // Emit load event
                this._emitLoadEvent(containerId, filePath);
                
                console.log(`✅ Successfully loaded: ${filePath} into ${containerId}`);
                return;
                
            } catch (error) {
                lastError = error;
                console.warn(`❌ Attempt ${attempt + 1} failed for ${filePath}:`, error);
                
                if (attempt < retries) {
                    await this._delay(this.retryDelay * (attempt + 1));
                }
            }
        }
        
        // All attempts failed
        this._showErrorMessage(containerId, filePath, lastError);
        throw lastError;
    }

    /**
     * Load all portfolio components
     * @param {Array} components - Array of component configurations
     * @returns {Promise} - Promise that resolves when all components are loaded
     */
    async loadAllComponents(components = null) {
        // FIXED: Correct container mappings
        const defaultComponents = [
            { containerId: 'profile-section-container', filePath: 'components/profile.html', priority: 1 },
            { containerId: 'navigation-container', filePath: 'components/navigation.html', priority: 1 },
            { containerId: 'contact-section-container', filePath: 'components/contact.html', priority: 2 },
            { containerId: 'experience-section-container', filePath: 'components/experience.html', priority: 2 },
            { containerId: 'education-left-container', filePath: 'components/education.html', priority: 3 },
            { containerId: 'skills-left-container', filePath: 'components/skills.html', priority: 3 },
            { containerId: 'portfolio-section-container', filePath: 'components/portfolio.html', priority: 3 }
        ];

        const componentsToLoad = components || defaultComponents;
        
        console.log('Starting to load all components...');
        console.log('Components to load:', componentsToLoad);
        
        try {
            // Group components by priority
            const priorityGroups = this._groupByPriority(componentsToLoad);
            
            // Load components in priority order
            for (const [priority, group] of priorityGroups) {
                console.log(`Loading priority ${priority} components...`);
                
                const loadPromises = group.map(component => 
                    this.loadHTML(component.containerId, component.filePath, {
                        showLoader: priority === 1 // Only show loader for high priority components
                    })
                );
                
                await Promise.all(loadPromises);
                
                // Small delay between priority groups for better UX
                if (priority < Math.max(...priorityGroups.keys())) {
                    await this._delay(100);
                }
            }
            
            console.log('✅ All components loaded successfully!');
            
            // DEBUG: Check what sections are available
            this._debugLoadedSections();
            
            this._emitAllComponentsLoadedEvent();
            return true;
            
        } catch (error) {
            console.error('❌ Error loading components:', error);
            this._showGlobalErrorMessage(error);
            return false;
        }
    }

    // DEBUG: Check what sections were loaded
    _debugLoadedSections() {
        console.log('=== DEBUG LOADED SECTIONS ===');
        const allSections = document.querySelectorAll('.content-section');
        allSections.forEach(section => {
            console.log(`Section found: ${section.id} in container: ${section.parentElement.id}`);
        });
        
        // Check specific sections
        const educationSection = document.getElementById('section-education');
        const skillsSection = document.getElementById('section-skills');
        
        console.log('Education section:', educationSection ? '✅ FOUND' : '❌ NOT FOUND');
        console.log('Skills section:', skillsSection ? '✅ FOUND' : '❌ NOT FOUND');
    }

    /**
     * Preload components without inserting them into DOM
     */
    async preloadComponents(components) {
        const preloadPromises = components.map(async ({ filePath }) => {
            try {
                const response = await fetch(filePath);
                if (response.ok) {
                    await response.text(); // Cache the response
                }
            } catch (error) {
                console.warn(`Failed to preload ${filePath}:`, error);
            }
        });

        await Promise.allSettled(preloadPromises);
        console.log('Component preloading completed');
    }

    /**
     * Reload a specific component
     */
    async reloadComponent(containerId, filePath) {
        return this.loadHTML(containerId, filePath, { forceReload: true });
    }

    /**
     * Check if component is loaded
     */
    isComponentLoaded(containerId, filePath) {
        const cacheKey = `${containerId}-${filePath}`;
        return this.loadedComponents.has(cacheKey);
    }

    // Private methods
    _groupByPriority(components) {
        const groups = new Map();
        
        components.forEach(component => {
            const priority = component.priority || 1;
            if (!groups.has(priority)) {
                groups.set(priority, []);
            }
            groups.get(priority).push(component);
        });
        
        // Sort by priority (ascending)
        return new Map([...groups.entries()].sort());
    }

    _sanitizeHTML(html) {
        // Basic HTML sanitization
        const div = document.createElement('div');
        div.innerHTML = html;
        
        // Remove any script tags for security
        const scripts = div.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        return div.innerHTML;
    }

    _processScripts(container) {
        // Re-enable any data attributes or special functionality
        const elements = container.querySelectorAll('[data-action]');
        elements.forEach(element => {
            const action = element.dataset.action;
            if (action && typeof window[action] === 'function') {
                element.addEventListener('click', () => window[action](element));
            }
        });
    }

    _showComponentLoader(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="component-loader">
                    <div class="loader-spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
        }
    }

    _showErrorMessage(containerId, filePath, error) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="component-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Loading Error</h3>
                    <p>Failed to load: ${filePath}</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="portfolioLoader.reloadComponent('${containerId}', '${filePath}')" 
                            class="btn btn-primary">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    _showGlobalErrorMessage(error) {
        const errorHTML = `
            <div class="global-error-overlay">
                <div class="global-error-content">
                    <h3><i class="fas fa-exclamation-triangle"></i> Loading Error</h3>
                    <p>Failed to load portfolio components.</p>
                    <p class="error-details">${error.message}</p>
                    <div class="error-actions">
                        <button onclick="location.reload()" class="btn btn-primary">
                            <i class="fas fa-redo"></i> Reload Page
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="btn btn-secondary">
                            <i class="fas fa-times"></i> Dismiss
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    _emitLoadEvent(containerId, filePath) {
        const event = new CustomEvent('componentLoaded', {
            detail: { containerId, filePath }
        });
        document.dispatchEvent(event);
    }

    _emitAllComponentsLoadedEvent() {
        const event = new CustomEvent('allComponentsLoaded', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public utility methods
    getLoadedComponents() {
        return Array.from(this.loadedComponents);
    }

    clearCache() {
        this.loadedComponents.clear();
        console.log('Component cache cleared');
    }

    // Cleanup method
    destroy() {
        this.loadedComponents.clear();
        this.loadingPromises.clear();
        console.log('ComponentLoader destroyed');
    }
}

// Global instance
window.ComponentLoader = ComponentLoader;