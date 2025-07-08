// Component Loader for Portfolio
// This file handles loading of HTML components dynamically

/**
 * Function to load HTML content from external files
 * @param {string} containerId - The ID of the container element
 * @param {string} filePath - Path to the HTML file to load
 * @returns {Promise} - Promise that resolves when content is loaded
 */
async function loadHTML(containerId, filePath) {
    try {
        console.log(`Loading component: ${filePath}`);
        
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const container = document.getElementById(containerId);
        
        if (!container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }
        
        container.innerHTML = html;
        console.log(`Successfully loaded: ${filePath}`);
        
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        
        // Optional: Show user-friendly error message
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #dc2626;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load component: ${filePath}</p>
                </div>
            `;
        }
    }
}

/**
 * Load all portfolio components
 * @returns {Promise} - Promise that resolves when all components are loaded
 */
async function loadAllComponents() {
    const components = [
        { containerId: 'book-cover-container', filePath: 'components/book-cover.html' },
        { containerId: 'left-page-container', filePath: 'components/left-page.html' },
        { containerId: 'experience-section-container', filePath: 'components/experience.html' },
        { containerId: 'education-section-container', filePath: 'components/education.html' },
        { containerId: 'skills-section-container', filePath: 'components/skills.html' },
        { containerId: 'portfolio-section-container', filePath: 'components/portfolio.html' },
        { containerId: 'contact-section-container', filePath: 'components/contact.html' },
        { containerId: 'navigation-container', filePath: 'components/navigation.html' }
    ];

    console.log('Starting to load all components...');
    
    try {
        // Load all components in parallel
        const loadPromises = components.map(component => 
            loadHTML(component.containerId, component.filePath)
        );
        
        await Promise.all(loadPromises);
        console.log('All components loaded successfully!');
        
        return true;
    } catch (error) {
        console.error('Error loading components:', error);
        return false;
    }
}

/**
 * Initialize portfolio after components are loaded
 */
function initializePortfolio() {
    try {
        if (typeof PortfolioBook !== 'undefined') {
            // Initialize portfolio with additional enhancements
            const portfolio = new PortfolioBook();
            
            // Add additional enhancements
            if (typeof portfolio.addParallaxEffect === 'function') {
                portfolio.addParallaxEffect();
            }
            
            if (typeof portfolio.initSmoothScrolling === 'function') {
                portfolio.initSmoothScrolling();
            }
            
            if (typeof portfolio.initLazyLoading === 'function') {
                portfolio.initLazyLoading();
            }
            
            // Make portfolio globally accessible for debugging
            window.portfolio = portfolio;
            
            console.log('Portfolio initialized successfully!');
        } else {
            console.error('PortfolioBook class not found. Make sure script.js is loaded.');
        }
    } catch (error) {
        console.error('Error initializing portfolio:', error);
    }
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    const loadingHtml = `
        <div id="loading-indicator" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: 'Inter', sans-serif;
        ">
            <div style="text-align: center;">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top: 3px solid white;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <h2 style="margin: 0; font-weight: 600;">Loading Portfolio...</h2>
                <p style="margin: 10px 0 0; opacity: 0.8;">Please wait while we prepare your experience</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHtml);
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.style.opacity = '0';
        indicator.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            indicator.remove();
        }, 500);
    }
}

/**
 * Main initialization function
 */
async function initializeApp() {
    console.log('Initializing Portfolio App...');
    
    // Show loading indicator
    showLoadingIndicator();
    
    try {
        // Load all components
        const success = await loadAllComponents();
        
        if (success) {
            // Small delay to ensure DOM is fully updated
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Initialize portfolio
            initializePortfolio();
            
            // Hide loading indicator
            setTimeout(() => {
                hideLoadingIndicator();
            }, 1000); // Keep loading screen for a bit for better UX
            
        } else {
            throw new Error('Failed to load some components');
        }
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        hideLoadingIndicator();
        
        // Show error message to user
        document.body.insertAdjacentHTML('beforeend', `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 10000;
            ">
                <h3 style="color: #dc2626; margin-bottom: 15px;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Loading Error
                </h3>
                <p style="margin-bottom: 20px;">Failed to load portfolio components.</p>
                <button onclick="location.reload()" style="
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">
                    Retry
                </button>
            </div>
        `);
    }
}

// Load all components when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Also handle page visibility change for better UX
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.portfolio) {
        // Page became visible again, ensure portfolio is working
        console.log('Page visible again, portfolio status:', !!window.portfolio);
    }
});

// Export functions for potential external use
window.portfolioLoader = {
    loadHTML,
    loadAllComponents,
    initializePortfolio,
    showLoadingIndicator,
    hideLoadingIndicator
};