// Google Analytics 4 (GA4) Integration Helper

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Access the public client-side environment variable via Vite
const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();

/**
 * Initializes GA4 dynamically by injecting the Global Site Tag (gtag.js) script.
 * Silent fallback if GA_MEASUREMENT_ID is missing or template empty.
 */
export const initGA = () => {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.startsWith('YOUR_') || GA_MEASUREMENT_ID === '') {
    // Analytics is disabled or not configured yet
    return;
  }

  // Prevent double loading
  if (document.getElementById('google-analytics-script')) {
    return;
  }

  try {
    // 1. Inject the tracking script tag
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // 2. Setup the global dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    // 3. Initialize config parameters
    window.gtag('js', new Date());
    
    // We disable default stream page views so we can trigger them manually inside React
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      cookie_flags: 'SameSite=None;Secure'
    });
    
    console.log(`[Analytics] GA4 Initialized with ID: ${GA_MEASUREMENT_ID}`);
  } catch (err) {
    console.warn('[Analytics] Error initializing Google Analytics:', err);
  }
};

/**
 * Tracks a manual Page View inside the Single Page Application.
 * Useful when switching tabs or game formats.
 * @param tabName Current active tab/view
 * @param gameFormat Current active format ('fusion' or 'masters')
 */
export const trackPageView = (tabName: string, gameFormat: 'fusion' | 'masters') => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  try {
    const formattedTitle = `${tabName.toUpperCase()} - ${gameFormat === 'fusion' ? 'Fusion World' : 'Masters'}`;
    window.gtag('event', 'page_view', {
      page_title: formattedTitle,
      page_path: `/${gameFormat}/${tabName}`,
      page_location: window.location.href,
      game_format: gameFormat
    });
  } catch (err) {
    console.warn('[Analytics] Failed to track page view:', err);
  }
};

/**
 * Tracks specific user interactions inside the app.
 * @param action The dynamic action being performed (e.g., 'add_card', 'remove_card', 'search_query')
 * @param category Broad category name (e.g., 'Collection', 'Wants', 'Search')
 * @param label Extra descriptive string (e.g., card ID, search criteria)
 * @param value Incremental rating or counter if necessary
 */
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  } catch (err) {
    console.warn('[Analytics] Failed to track event:', err);
  }
};
