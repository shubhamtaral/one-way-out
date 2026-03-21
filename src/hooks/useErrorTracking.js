import { useCallback } from 'react';

/**
 * Custom hook for standardizing error reporting across the app.
 * In a true DevOps project, this would pipe to an OpenTelemetry-compatible 
 * collector or a self-hosted Sentry/Loki instance.
 */
export function useErrorTracking() {
  const trackError = useCallback((error, context = {}) => {
    const errorData = {
      message: error.message || 'Unknown Error',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    // 1. Log to console for local development
    console.error('📊 [OBSERVABILITY ERROR]:', errorData);

    // 2. Future expansion: Log to Firebase Firestore "logs" collection
    // This maintains the open-souce requirement by using your existing DB
    /*
    if (auth.currentUser) {
      addDoc(collection(db, 'error_logs'), {
        ...errorData,
        userId: auth.currentUser.uid
      }).catch(e => console.error('Failed to log error to Firestore:', e));
    }
    */

    // 3. Optional: Trigger a custom event for global error boundary
    window.dispatchEvent(new CustomEvent('app-error', { detail: errorData }));
  }, []);

  return { trackError };
}
