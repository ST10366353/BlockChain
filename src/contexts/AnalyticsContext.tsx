"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export interface UserJourneyEvent {
  id: string;
  userId: string;
  sessionId: string;
  eventType: 'page_view' | 'click' | 'form_submit' | 'error' | 'conversion' | 'ab_test';
  page: string;
  element?: string;
  action?: string;
  data?: Record<string, unknown>;
  timestamp: number;
  userAgent: string;
  url: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  sessionId: string;
  rating: number;
  feedback: string;
  category: 'ux' | 'bug' | 'feature' | 'performance' | 'content';
  page: string;
  timestamp: number;
  userAgent: string;
}

export interface ABTestVariant {
  id: string;
  testId: string;
  name: string;
  component: React.ComponentType<unknown>;
  weight: number;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  isActive: boolean;
  startDate: number;
  endDate?: number;
}

export interface PerformanceMetric {
  id: string;
  userId: string;
  sessionId: string;
  metric: 'page_load' | 'interaction_time' | 'error_rate' | 'conversion_rate';
  value: number;
  page: string;
  timestamp: number;
  userAgent: string;
}

export interface UserTestingSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  events: UserJourneyEvent[];
  feedback: UserFeedback[];
  recordings: string[]; // URLs to session recordings
  completedTasks: string[];
  dropOffPoints: string[];
}

interface AnalyticsContextType {
  // User Journey Tracking
  trackEvent: (event: Omit<UserJourneyEvent, 'id' | 'userId' | 'sessionId' | 'timestamp' | 'userAgent' | 'url'>) => void;
  trackPageView: (page: string, data?: Record<string, unknown>) => void;
  trackConversion: (action: string, data?: Record<string, unknown>) => void;

  // User Feedback
  submitFeedback: (feedback: Omit<UserFeedback, 'id' | 'userId' | 'sessionId' | 'timestamp' | 'userAgent'>) => void;
  collectFeedback: (category: UserFeedback['category'], page: string) => Promise<UserFeedback | null>;

  // A/B Testing
  getABTestVariant: (testId: string) => ABTestVariant | null;
  trackABTestExposure: (testId: string, variantId: string) => void;

  // Performance Monitoring
  trackPerformance: (metric: Omit<PerformanceMetric, 'id' | 'userId' | 'sessionId' | 'timestamp' | 'userAgent'>) => void;
  measurePageLoad: (page: string) => void;

  // User Testing
  startUserTestingSession: (tasks: string[]) => string;
  endUserTestingSession: (sessionId: string) => void;
  recordUserTestingEvent: (sessionId: string, event: string, data?: Record<string, unknown>) => void;

  // Analytics Data
  getUserJourney: (userId: string) => UserJourneyEvent[];
  getFeedbackSummary: () => Record<string, number>;
  getDropOffPoints: () => Record<string, number>;
  getConversionFunnel: () => Record<string, number>;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  userId?: string;
  enableTracking?: boolean;
  enableABTesting?: boolean;
  enableUserTesting?: boolean;
}

export function AnalyticsProvider({
  children,
  userId,
  enableTracking = true,
  enableABTesting = true,
  enableUserTesting = true
}: AnalyticsProviderProps) {
  const [currentUserId] = useState(() => userId || generateUserId());
  const [sessionId] = useState(() => generateSessionId());
  const [currentPage, setCurrentPage] = useState<string>('');
  const [pageLoadStart, setPageLoadStart] = useState<number>(0);


  // A/B Tests configuration
  const [abTests] = useState<ABTest[]>([
    {
      id: 'onboarding_flow',
      name: 'Onboarding Flow Optimization',
      description: 'Testing different onboarding step orders and messaging',
      isActive: true,
      startDate: Date.now(),
      variants: [
        {
          id: 'original',
          testId: 'onboarding_flow',
          name: 'Original Flow',
          component: React.Fragment,
          weight: 50
        },
        {
          id: 'simplified',
          testId: 'onboarding_flow',
          name: 'Simplified Flow',
          component: React.Fragment,
          weight: 30
        },
        {
          id: 'guided',
          testId: 'onboarding_flow',
          name: 'Guided Flow',
          component: React.Fragment,
          weight: 20
        }
      ]
    },
    {
      id: 'dashboard_layout',
      name: 'Dashboard Layout Testing',
      description: 'Testing different dashboard layouts and quick actions',
      isActive: true,
      startDate: Date.now(),
      variants: [
        {
          id: 'cards',
          testId: 'dashboard_layout',
          name: 'Card-based Layout',
          component: React.Fragment,
          weight: 60
        },
        {
          id: 'list',
          testId: 'dashboard_layout',
          name: 'List-based Layout',
          component: React.Fragment,
          weight: 40
        }
      ]
    }
  ]);

  // Generate unique IDs
  function generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track page views and performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleRouteChange = (url: string) => {
        const page = url.split('/').pop() || 'home';
        trackPageView(page);
        measurePageLoad(page);
      };

      // Track initial page load
      const currentUrl = window.location.pathname;
      const initialPage = currentUrl.split('/').pop() || 'home';
      setCurrentPage(initialPage);
      setPageLoadStart(Date.now());

      // Listen for navigation events (if using Next.js router)
      if (window.history) {
        const originalPushState = window.history.pushState;
        window.history.pushState = function(...args) {
          originalPushState.apply(this, args);
          handleRouteChange(args[2] as string);
        };
      }

      // Track page load performance
      if (performance && performance.getEntriesByType) {
        window.addEventListener('load', () => {
          const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigationEntry) {
            trackPerformance({
              metric: 'page_load',
              value: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
              page: initialPage
            });
          }
        });
      }
    }
  }, [measurePageLoad, trackPageView, trackPerformance]);

  // Track user interactions
  useEffect(() => {
    if (!enableTracking) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target) {
        const elementId = target.id || target.className || target.tagName;
        trackEvent({
          eventType: 'click',
          page: currentPage,
          element: elementId,
          action: 'click',
          data: {
            textContent: target.textContent?.slice(0, 100),
            elementType: target.tagName,
            className: target.className
          }
        });
      }
    };

    const handleFormSubmit = (event: Event) => {
      const target = event.target as HTMLFormElement;
      if (target && target.tagName === 'FORM') {
        trackEvent({
          eventType: 'form_submit',
          page: currentPage,
          element: target.id || target.className || 'form',
          action: 'submit',
          data: {
            formAction: target.action,
            formMethod: target.method
          }
        });
      }
    };

    const handleError = (event: ErrorEvent) => {
      trackEvent({
        eventType: 'error',
        page: currentPage,
        action: 'javascript_error',
        data: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleFormSubmit);
    window.addEventListener('error', handleError);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('error', handleError);
    };
  }, [enableTracking, currentPage, trackEvent]);

  // Core tracking functions
  const trackEvent = useCallback((eventData: Omit<UserJourneyEvent, 'id' | 'userId' | 'sessionId' | 'timestamp' | 'userAgent' | 'url'>) => {
    if (!enableTracking) return;

    const event: UserJourneyEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUserId,
      sessionId,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      ...eventData
    };

    // Store in localStorage for demo purposes
    // In production, this would be sent to analytics service
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    events.push(event);
    localStorage.setItem('analytics_events', JSON.stringify(events.slice(-1000))); // Keep last 1000 events

    // Send to console for debugging
    console.log('Analytics Event:', event);
  }, [enableTracking, currentUserId, sessionId]);

  const trackPageView = useCallback((page: string, data?: Record<string, unknown>) => {
    setCurrentPage(page);
    trackEvent({
      eventType: 'page_view',
      page,
      action: 'view',
      data: data || {}
    });
  }, [trackEvent]);

  const trackConversion = (action: string, data?: Record<string, unknown>) => {
    trackEvent({
      eventType: 'conversion',
      page: currentPage,
      action,
      data: data || {}
    });
  };

  const trackPerformance = useCallback((metricData: Omit<PerformanceMetric, 'id' | 'userId' | 'sessionId' | 'timestamp' | 'userAgent'>) => {
    const metric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUserId,
      sessionId,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...metricData
    };

    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    metrics.push(metric);
    localStorage.setItem('performance_metrics', JSON.stringify(metrics.slice(-500))); // Keep last 500 metrics

    console.log('Performance Metric:', metric);
  }, [currentUserId, sessionId]);

  const measurePageLoad = useCallback((page: string) => {
    const loadTime = Date.now() - pageLoadStart;
    trackPerformance({
      metric: 'page_load',
      value: loadTime,
      page
    });
  }, [pageLoadStart, trackPerformance]);

  // User feedback functions
  const submitFeedback = (feedbackData: Omit<UserFeedback, 'id' | 'userId' | 'sessionId' | 'timestamp' | 'userAgent'>) => {
    const feedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUserId,
      sessionId,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...feedbackData
    };

    const feedbacks = JSON.parse(localStorage.getItem('user_feedback') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('user_feedback', JSON.stringify(feedbacks.slice(-200))); // Keep last 200 feedbacks

    console.log('User Feedback:', feedback);
  };

  const collectFeedback = async (category: UserFeedback['category'], page: string): Promise<UserFeedback | null> => {
    // In a real implementation, this would show a feedback modal
    // For demo purposes, we'll simulate collecting feedback
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFeedback: UserFeedback = {
          id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: currentUserId,
          sessionId,
          rating: Math.floor(Math.random() * 5) + 1,
          feedback: 'This is a simulated feedback response',
          category,
          page,
          timestamp: Date.now(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
        };
        resolve(mockFeedback);
      }, 1000);
    });
  };

  // A/B Testing functions
  const getABTestVariant = (testId: string): ABTestVariant | null => {
    if (!enableABTesting) return null;

    const test = abTests.find(t => t.id === testId && t.isActive);
    if (!test) return null;

    // Get user's assigned variant from localStorage
    const userVariants = JSON.parse(localStorage.getItem('ab_test_variants') || '{}');
    const assignedVariantId = userVariants[testId];

    if (assignedVariantId) {
      return test.variants.find(v => v.id === assignedVariantId) || null;
    }

    // Assign a new variant based on weights
    const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;

    for (const variant of test.variants) {
      random -= variant.weight;
      if (random <= 0) {
        userVariants[testId] = variant.id;
        localStorage.setItem('ab_test_variants', JSON.stringify(userVariants));
        trackABTestExposure(testId, variant.id);
        return variant;
      }
    }

    return null;
  };

  const trackABTestExposure = (testId: string, variantId: string) => {
    trackEvent({
      eventType: 'ab_test',
      page: currentPage,
      action: 'exposure',
      data: {
        testId,
        variantId
      }
    });
  };

  // User testing functions
  const startUserTestingSession = (tasks: string[]): string => {
    if (!enableUserTesting) return '';

    const sessionId = `testing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setActiveUserTestingSession(sessionId);

    const session: UserTestingSession = {
      id: sessionId,
      userId: currentUserId,
      startTime: Date.now(),
      events: [],
      feedback: [],
      recordings: [],
      completedTasks: [],
      dropOffPoints: []
    };

    const sessions = JSON.parse(localStorage.getItem('user_testing_sessions') || '[]');
    sessions.push(session);
    localStorage.setItem('user_testing_sessions', JSON.stringify(sessions.slice(-50))); // Keep last 50 sessions

    trackEvent({
      eventType: 'conversion',
      page: currentPage,
      action: 'user_testing_started',
      data: {
        sessionId,
        tasks
      }
    });

    return sessionId;
  };

  const endUserTestingSession = (sessionId: string) => {
    setActiveUserTestingSession(null);

    const sessions = JSON.parse(localStorage.getItem('user_testing_sessions') || '[]');
    const sessionIndex = sessions.findIndex((s: UserTestingSession) => s.id === sessionId);

    if (sessionIndex !== -1) {
      sessions[sessionIndex].endTime = Date.now();
      localStorage.setItem('user_testing_sessions', JSON.stringify(sessions));
    }

    trackEvent({
      eventType: 'conversion',
      page: currentPage,
      action: 'user_testing_completed',
      data: { sessionId }
    });
  };

  const recordUserTestingEvent = (sessionId: string, event: string, data?: Record<string, unknown>) => {
    trackEvent({
      eventType: 'conversion',
      page: currentPage,
      action: `user_testing_${event}`,
      data: {
        sessionId,
        ...data
      }
    });
  };

  // Analytics data retrieval functions
  const getUserJourney = (userId: string): UserJourneyEvent[] => {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    return events.filter((event: UserJourneyEvent) => event.userId === userId);
  };

  const getFeedbackSummary = (): Record<string, number> => {
    const feedbacks = JSON.parse(localStorage.getItem('user_feedback') || '[]');
    const summary: Record<string, number> = {};

    feedbacks.forEach((feedback: UserFeedback) => {
      const key = `${feedback.category}_${feedback.rating}`;
      summary[key] = (summary[key] || 0) + 1;
    });

    return summary;
  };

  const getDropOffPoints = (): Record<string, number> => {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const dropOffs: Record<string, number> = {};

    events.forEach((event: UserJourneyEvent) => {
      if (event.eventType === 'page_view') {
        const nextPageViews = events.filter((e: UserJourneyEvent) =>
          e.userId === event.userId &&
          e.timestamp > event.timestamp &&
          e.eventType === 'page_view'
        );

        if (nextPageViews.length === 0) {
          dropOffs[event.page] = (dropOffs[event.page] || 0) + 1;
        }
      }
    });

    return dropOffs;
  };

  const getConversionFunnel = (): Record<string, number> => {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const funnel: Record<string, number> = {
      onboarding_started: 0,
      onboarding_completed: 0,
      first_credential_requested: 0,
      first_presentation_created: 0,
      first_connection_made: 0
    };

    events.forEach((event: UserJourneyEvent) => {
      if (event.eventType === 'conversion') {
        if (event.action === 'onboarding_started') funnel.onboarding_started++;
        if (event.action === 'onboarding_completed') funnel.onboarding_completed++;
        if (event.action === 'first_credential_requested') funnel.first_credential_requested++;
        if (event.action === 'first_presentation_created') funnel.first_presentation_created++;
        if (event.action === 'first_connection_made') funnel.first_connection_made++;
      }
    });

    return funnel;
  };

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackConversion,
    submitFeedback,
    collectFeedback,
    getABTestVariant,
    trackABTestExposure,
    trackPerformance,
    measurePageLoad,
    startUserTestingSession,
    endUserTestingSession,
    recordUserTestingEvent,
    getUserJourney,
    getFeedbackSummary,
    getDropOffPoints,
    getConversionFunnel
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Export types for use in other components
export type { AnalyticsContextType, UserJourneyEvent, UserFeedback, ABTestVariant, ABTest, PerformanceMetric, UserTestingSession };
