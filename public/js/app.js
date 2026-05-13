/**
 * APP.js - Main application controller
 * Handles navigation, state, and core functionality
 */

const APP = {
  currentUser: null,
  currentView: 'dashboard',
  isAuthenticated: false,

  /**
   * Initialize the application
   */
  init() {
    this.setupEventListeners();
    this.checkAuthStatus();
    this.loadViews();
  },

  /**
   * Navigate between pages
   */
  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('app').classList.remove('active');
    
    const target = document.getElementById(page);
    if (target) {
      target.classList.add('active');
    }
    window.scrollTo(0, 0);
  },

  /**
   * Show app view (authenticated area)
   */
  showView(viewName) {
    if (!this.isAuthenticated) {
      this.navigate('login');
      return;
    }

    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(`view-${viewName}`);
    
    if (view) {
      view.classList.add('active');
      this.currentView = viewName;
      
      // Update sidebar active state
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      
      const navItems = document.querySelectorAll('.nav-item');
      const viewIndex = Array.from(navItems).findIndex(item => 
        item.textContent.toLowerCase().includes(viewName.replace(/([A-Z])/g, ' $1').toLowerCase())
      );
      
      if (navItems[viewIndex]) {
        navItems[viewIndex].classList.add('active');
      }
    }
  },

  /**
   * Check authentication status
   */
  checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.isAuthenticated = true;
      this.loadUserData();
      this.navigate('');
      document.getElementById('app').classList.add('active');
      this.showView('dashboard');
    }
  },

  /**
   * Load user data from localStorage
   */
  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.currentUser = userData;
    
    if (userData.name) {
      document.getElementById('user-name').textContent = userData.name;
      document.getElementById('user-avatar').textContent = userData.initials || 'MT';
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.isAuthenticated = false;
    this.currentUser = null;
    this.navigate('login');
  },

  /**
   * Load view templates
   */
  loadViews() {
    VIEWS.render('dashboard');
    VIEWS.render('audit');
    VIEWS.render('generator');
    VIEWS.render('followup');
    VIEWS.render('library');
    VIEWS.render('voice');
    VIEWS.render('subscription');
    VIEWS.render('settings');
  },

  /**
   * Show toast notification
   */
  toast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  },

  /**
   * Scroll to section
   */
  scrollTo(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  },

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Modal overlay click-outside to close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          MODAL.close(modal.id);
        }
      });
    });
  }
};

/**
 * MODAL - Modal dialog utilities
 */
const MODAL = {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
    }
  },

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
    }
  },

  closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.remove('open');
    });
  }
};

/**
 * ALERT - Alert/notification system
 */
const ALERT = {
  success(message) {
    APP.toast('✓ ' + message);
  },

  error(message) {
    APP.toast('✗ ' + message);
  },

  warning(message) {
    APP.toast('⚠ ' + message);
  },

  info(message) {
    APP.toast('ℹ ' + message);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  APP.init();
});
