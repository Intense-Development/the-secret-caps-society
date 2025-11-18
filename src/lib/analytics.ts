/**
 * Analytics tracking utility
 * Extensible for future analytics providers (Google Analytics, Mixpanel, etc.)
 */

type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

/**
 * Track an analytics event
 * Currently logs to console, but can be extended to send to analytics providers
 */
export function trackEvent(event: AnalyticsEvent): void {
  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event.name, event.properties);
  }

  // TODO: Add analytics provider integrations
  // Example:
  // if (window.gtag) {
  //   window.gtag("event", event.name, event.properties);
  // }
}

/**
 * Track logout event
 */
export function trackLogout(success: boolean, error?: string): void {
  trackEvent({
    name: "logout",
    properties: {
      success,
      error: error || undefined,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track login event
 */
export function trackLogin(success: boolean, method: "password" | "magic-link"): void {
  trackEvent({
    name: "login",
    properties: {
      success,
      method,
      timestamp: new Date().toISOString(),
    },
  });
}

