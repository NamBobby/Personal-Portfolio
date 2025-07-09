// === Portfolio Application ===
class PortfolioApp {
  constructor() {
    this.componentLoader = null;
    this.portfolioBook = null;
    this.scrollManager = null;
    this.isInitialized = false;
    this.config = {
      enableAnalytics: false,
      enableServiceWorker: false,
      debugMode: window.location.hostname === 'localhost',
      loadingTimeout: 30000
    };

    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing Portfolio App...');
      this.showGlobalLoader();
      await this.initializeCore();
      await this.loadComponents();
      this.initializeScrollManager();
      await this.initializePortfolio();
      this.setupAdditionalFeatures();

      setTimeout(() => {
        this.hideGlobalLoader();
        this.isInitialized = true;
        console.log('✅ Portfolio App initialized successfully!');
        document.dispatchEvent(new CustomEvent('portfolioReady'));
      }, 1000);
    } catch (error) {
      console.error('❌ Failed to initialize Portfolio App:', error);
      this.handleInitializationError(error);
    }
  }

  async initializeCore() {
    this.componentLoader = new ComponentLoader();
    this.setupErrorHandling();
    if (this.config.debugMode) {
      this.setupPerformanceMonitoring();
    }
    console.log('Core components initialized');
  }

  async loadComponents() {
    console.log('Loading portfolio components...');
    const loadTimeout = setTimeout(() => {
      throw new Error('Component loading timeout');
    }, this.config.loadingTimeout);

    try {
      const success = await this.componentLoader.loadAllComponents();
      clearTimeout(loadTimeout);
      if (!success) throw new Error('Failed to load some components');
      console.log('All components loaded successfully');
    } catch (error) {
      clearTimeout(loadTimeout);
      throw error;
    }
  }

  initializeScrollManager() {
    if (typeof ScrollManager !== 'undefined') {
      this.scrollManager = new ScrollManager();
      console.log('✅ ScrollManager initialized');
    } else {
      console.warn('⚠️ ScrollManager class not found, using fallback');
      this.createBasicScrollManager();
    }
  }

  createBasicScrollManager() {
    this.scrollManager = {
      scrollToSection: (sectionId, position = 'top') => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        let scrollTarget = 0;
        switch (position) {
          case 'top': scrollTarget = 0; break;
          case 'bottom': scrollTarget = section.scrollHeight; break;
          case 'center': scrollTarget = (section.scrollHeight - section.clientHeight) / 2; break;
          default: scrollTarget = position;
        }
        section.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      },
      resetScrollPosition: (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) section.scrollTop = 0;
      }
    };
  }

  async initializePortfolio() {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (typeof PortfolioBook === 'undefined') throw new Error('PortfolioBook class not found');
    this.portfolioBook = new PortfolioBook();
    this.integrateScrollManager();

    if (this.config.debugMode) {
      window.portfolio = this.portfolioBook;
      window.portfolioApp = this;
      window.scrollManager = this.scrollManager;
    }

    console.log('Portfolio Book initialized');
  }

  integrateScrollManager() {
    if (!this.scrollManager || !this.portfolioBook) return;

    document.addEventListener('page:changed', (e) => {
      const { leftSection, rightSection } = e.detail;
      setTimeout(() => {
        this.scrollManager.resetScrollPosition(leftSection);
        this.scrollManager.resetScrollPosition(rightSection);
      }, 100);
    });

    this.portfolioBook.scrollToTop = (sectionId) => {
      this.scrollManager.scrollToSection(sectionId, 'top');
    };

    this.portfolioBook.scrollToBottom = (sectionId) => {
      this.scrollManager.scrollToSection(sectionId, 'bottom');
    };

    console.log('✅ ScrollManager integrated with PortfolioBook');
  }

  setupAdditionalFeatures() {
    if (this.config.enableServiceWorker && 'serviceWorker' in navigator) {
      this.registerServiceWorker();
    }
    if (this.config.enableAnalytics) {
      this.setupAnalytics();
    }
  }

  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }

  setupPerformanceMonitoring() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          console.log('Performance Metrics:', {
            loadTime: perfData.loadEventEnd - perfData.fetchStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart
          });
        }, 0);
      });
    }
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  setupAnalytics() {
    console.log('Analytics setup (placeholder)');
  }

  showGlobalLoader() {
    const loaderHTML = `
      <div id="global-loader" class="global-loader">
        <div class="loader-content">
          <div class="loader-spinner"></div>
          <h2>Loading Portfolio...</h2>
          <p>Preparing your experience</p>
          <div class="loader-progress">
            <div class="progress-bar" id="loader-progress-bar"></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
    this.animateProgressBar();
  }

  animateProgressBar() {
    const progressBar = document.getElementById('loader-progress-bar');
    if (progressBar) {
      let width = 0;
      const interval = setInterval(() => {
        width += Math.random() * 15;
        if (width >= 90) {
          width = 90;
          clearInterval(interval);
        }
        progressBar.style.width = width + '%';
      }, 100);
    }
  }

  hideGlobalLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      const progressBar = document.getElementById('loader-progress-bar');
      if (progressBar) progressBar.style.width = '100%';
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => loader.remove(), 500);
      }, 200);
    }
  }
}

// === Enhanced Skills Filter System ===
class SkillsFilter {
  constructor() {
    this.filteredSkills = new Set();
    this.isFilterActive = false;
    
    this.init();
  }

  init() {
    // Listen for portfolio app ready
    document.addEventListener('portfolioReady', () => {
      this.setupSkillsFilter();
    });

    // Also setup immediately if app is already ready
    if (window.portfolioApp && window.portfolioApp.isInitialized) {
      this.setupSkillsFilter();
    }
  }

  setupSkillsFilter() {
    // Setup inspect buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.inspect-btn')) {
        e.preventDefault();
        const inspectBtn = e.target.closest('.inspect-btn');
        const skills = inspectBtn.getAttribute('data-skills');
        
        if (skills) {
          console.log('🔍 Inspecting skills:', skills);
          this.filterSkills(skills);
          this.navigateToSkills();
        }
      }
    });

    // Setup reset button
    document.addEventListener('click', (e) => {
      if (e.target.matches('#reset-skills-btn')) {
        e.preventDefault();
        this.resetFilter();
      }
    });

    // Listen for page changes to apply filters
    document.addEventListener('page:changed', (e) => {
      if (e.detail.leftSection === 'section-skills' || e.detail.rightSection === 'section-skills') {
        // Add a longer delay to ensure section is fully loaded
        setTimeout(() => {
          this.applyFilter();
        }, 800);
      }
    });
  }

  filterSkills(skillsString) {
    // Parse skills from string
    const skills = skillsString.split(',').map(skill => skill.trim());
    
    // Store filtered skills
    this.filteredSkills = new Set(skills);
    this.isFilterActive = true;
    
    // Store in sessionStorage for persistence
    sessionStorage.setItem('filteredSkills', JSON.stringify(skills));
    sessionStorage.setItem('isFilterActive', 'true');
    
    console.log('✅ Skills filter applied:', Array.from(this.filteredSkills));
  }

  applyFilter() {
    // Wait for skills section to be active
    const skillsSection = document.getElementById('section-skills');
    if (!skillsSection || !skillsSection.classList.contains('active')) {
      console.log('⏳ Skills section not active yet, waiting...');
      setTimeout(() => this.applyFilter(), 200);
      return;
    }

    // Check if we have stored filter data
    const storedSkills = sessionStorage.getItem('filteredSkills');
    const isFilterActive = sessionStorage.getItem('isFilterActive') === 'true';
    
    if (storedSkills && isFilterActive) {
      const skills = JSON.parse(storedSkills);
      this.filteredSkills = new Set(skills);
      this.isFilterActive = true;
      
      // Clear storage after applying
      sessionStorage.removeItem('filteredSkills');
      sessionStorage.removeItem('isFilterActive');
    }

    if (!this.isFilterActive) {
      return;
    }

    // Apply filter to all skill tags
    const allSkillTags = document.querySelectorAll('#section-skills .skill-tag');
    const allSubcategories = document.querySelectorAll('#section-skills .skill-subcategory');
    let visibleCount = 0;
    
    console.log('🔍 Found skill tags:', allSkillTags.length);
    console.log('🔍 Found subcategories:', allSubcategories.length);
    
    allSkillTags.forEach(tag => {
      const skillName = tag.getAttribute('data-skill');
      const tagText = tag.textContent.trim().replace(/\s+/g, ' ');
      
      // Check if this skill should be visible
      const shouldShow = this.filteredSkills.has(skillName) || 
                        this.filteredSkills.has(tagText) ||
                        Array.from(this.filteredSkills).some(filterSkill => 
                          skillName && skillName.toLowerCase().includes(filterSkill.toLowerCase()) ||
                          tagText.toLowerCase().includes(filterSkill.toLowerCase())
                        );
      
      if (shouldShow) {
        tag.style.display = 'inline-flex';
        tag.style.opacity = '1';
        tag.style.transform = 'scale(1.05)';
        tag.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
        tag.style.border = '2px solid #3b82f6';
        visibleCount++;
        console.log('✅ Showing skill:', skillName || tagText);
      } else {
        tag.style.display = 'none';
        tag.style.opacity = '0.3';
        tag.style.transform = 'scale(0.95)';
        tag.style.boxShadow = 'none';
        tag.style.border = '';
        console.log('❌ Hiding skill:', skillName || tagText);
      }
    });

    // Hide/show subcategories based on visible skills
    allSubcategories.forEach(subcategory => {
      const skillsInSubcategory = subcategory.querySelectorAll('.skill-tag');
      const visibleSkillsInSubcategory = Array.from(skillsInSubcategory).filter(tag => 
        tag.style.display !== 'none'
      );
      
      const subcategoryTitle = subcategory.querySelector('h4');
      if (visibleSkillsInSubcategory.length > 0) {
        // Show subcategory
        subcategory.style.display = 'block';
        subcategory.style.opacity = '1';
        if (subcategoryTitle) {
          subcategoryTitle.style.opacity = '1';
        }
        console.log('✅ Showing subcategory:', subcategoryTitle ? subcategoryTitle.textContent : 'Unknown');
      } else {
        // Hide subcategory
        subcategory.style.display = 'none';
        subcategory.style.opacity = '0.3';
        if (subcategoryTitle) {
          subcategoryTitle.style.opacity = '0.3';
        }
        console.log('❌ Hiding subcategory:', subcategoryTitle ? subcategoryTitle.textContent : 'Unknown');
      }
    });

    // Also check main categories (Technical Skills, Soft Skills, etc.)
    const mainCategories = document.querySelectorAll('#section-skills .skill-category');
    mainCategories.forEach(category => {
      const visibleSubcategories = category.querySelectorAll('.skill-subcategory');
      const visibleSubcategoryCount = Array.from(visibleSubcategories).filter(sub => 
        sub.style.display !== 'none'
      ).length;
      
      // For categories without subcategories (like Soft Skills)
      const directSkills = category.querySelectorAll('.skills-tags > .skill-tag');
      const visibleDirectSkills = Array.from(directSkills).filter(skill => 
        skill.style.display !== 'none'
      );
      
      const categoryTitle = category.querySelector('h3');
      const categoryName = categoryTitle ? categoryTitle.textContent : 'Unknown';
      
      if (visibleSubcategoryCount > 0 || visibleDirectSkills.length > 0) {
        // Show category
        category.style.display = 'block';
        category.style.opacity = '1';
        if (categoryTitle) {
          categoryTitle.style.opacity = '1';
        }
        console.log('✅ Showing category:', categoryName, `(${visibleSubcategoryCount} subcategories, ${visibleDirectSkills.length} direct skills)`);
      } else {
        // Hide category
        category.style.display = 'none';
        category.style.opacity = '0.3';
        if (categoryTitle) {
          categoryTitle.style.opacity = '0.3';
        }
        console.log('❌ Hiding category:', categoryName, '(no visible content)');
      }
    });

    // Show filter status
    this.showFilterStatus(visibleCount);
    
    // Show reset button
    this.showResetButton();
    
    console.log(`📊 Filter applied: ${visibleCount} skills visible out of ${allSkillTags.length}`);
  }

  resetFilter() {
    this.filteredSkills.clear();
    this.isFilterActive = false;
    
    // Clear storage
    sessionStorage.removeItem('filteredSkills');
    sessionStorage.removeItem('isFilterActive');
    
    // Reset all skill tags
    const allSkillTags = document.querySelectorAll('#section-skills .skill-tag');
    allSkillTags.forEach(tag => {
      tag.style.display = 'inline-flex';
      tag.style.opacity = '1';
      tag.style.transform = 'scale(1)';
      tag.style.boxShadow = '';
      tag.style.border = '';
    });

    // Reset all subcategories
    const allSubcategories = document.querySelectorAll('#section-skills .skill-subcategory');
    allSubcategories.forEach(subcategory => {
      subcategory.style.display = 'block';
      subcategory.style.opacity = '1';
      const subcategoryTitle = subcategory.querySelector('h4');
      if (subcategoryTitle) {
        subcategoryTitle.style.opacity = '1';
      }
    });

    // Reset all main categories
    const mainCategories = document.querySelectorAll('#section-skills .skill-category');
    mainCategories.forEach(category => {
      category.style.display = 'block';
      category.style.opacity = '1';
      const categoryTitle = category.querySelector('h3');
      if (categoryTitle) {
        categoryTitle.style.opacity = '1';
      }
    });

    // Hide filter status and reset button
    this.hideFilterStatus();
    this.hideResetButton();
    
    console.log('🔄 Skills filter reset');
  }

  showFilterStatus(count) {
    let statusElement = document.querySelector('.skills-filter-status');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.className = 'skills-filter-status';
      statusElement.style.cssText = `
        background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 20px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        animation: slideInDown 0.3s ease;
      `;
      
      // Insert into filter controls container
      const filterControls = document.getElementById('skills-filter-controls');
      if (filterControls) {
        filterControls.appendChild(statusElement);
      } else {
        // Fallback to section title
        const skillsSection = document.querySelector('#section-skills');
        if (skillsSection) {
          const sectionTitle = skillsSection.querySelector('.section-title');
          if (sectionTitle) {
            sectionTitle.insertAdjacentElement('afterend', statusElement);
          }
        }
      }
    }
    
    // Get filtered skills for display
    const filteredSkillsArray = Array.from(this.filteredSkills);
    const skillsText = filteredSkillsArray.length > 3 
      ? `${filteredSkillsArray.slice(0, 3).join(', ')} +${filteredSkillsArray.length - 3} more`
      : filteredSkillsArray.join(', ');
    
    statusElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
        <i class="fas fa-filter"></i>
        <span>Showing ${count} skills: ${skillsText}</span>
      </div>
    `;
  }

  hideFilterStatus() {
    const statusElement = document.querySelector('.skills-filter-status');
    if (statusElement) {
      statusElement.remove();
    }
  }

  showResetButton() {
    let resetButton = document.querySelector('#reset-skills-btn');
    if (!resetButton) {
      resetButton = document.createElement('button');
      resetButton.id = 'reset-skills-btn';
      resetButton.className = 'reset-skills-btn';
      resetButton.innerHTML = '<i class="fas fa-undo"></i> Show All Skills';
      resetButton.style.cssText = `
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 10px rgba(107, 114, 128, 0.3);
      `;
      
      resetButton.addEventListener('mouseenter', () => {
        resetButton.style.transform = 'translateY(-2px)';
        resetButton.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.4)';
      });
      
      resetButton.addEventListener('mouseleave', () => {
        resetButton.style.transform = 'translateY(0)';
        resetButton.style.boxShadow = '0 2px 10px rgba(107, 114, 128, 0.3)';
      });
      
      // Insert into filter controls container
      const filterControls = document.getElementById('skills-filter-controls');
      if (filterControls) {
        filterControls.appendChild(resetButton);
      } else {
        // Fallback to after status element
        const statusElement = document.querySelector('.skills-filter-status');
        if (statusElement) {
          statusElement.insertAdjacentElement('afterend', resetButton);
        }
      }
    }
  }

  hideResetButton() {
    const resetButton = document.querySelector('#reset-skills-btn');
    if (resetButton) {
      resetButton.remove();
    }
  }

  navigateToSkills() {
    // Navigate to skills section
    if (window.portfolioApp && window.portfolioApp.portfolioBook) {
      const success = window.portfolioApp.portfolioBook.goToSection('section-skills');
      if (success) {
        // Wait for navigation to complete, then apply filter
        setTimeout(() => {
          this.applyFilter();
        }, 1000);
      }
    }
  }

  // Manual trigger for testing
  manualApplyFilter() {
    console.log('🧪 Manual filter trigger');
    this.applyFilter();
  }
}

// === Init App ===
document.addEventListener('DOMContentLoaded', () => {
  // Initialize main app
  window.portfolioApp = new PortfolioApp();
  
  // Initialize skills filter
  window.skillsFilter = new SkillsFilter();
  
  // Debug info
  if (window.location.hostname === 'localhost') {
    console.log('🛠️ Debug Mode Active');
    console.log('📦 Portfolio App:', window.portfolioApp);
    console.log('🔍 Skills Filter:', window.skillsFilter);
  }
});