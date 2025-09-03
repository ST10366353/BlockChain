# Analytics, Testing & Performance Monitoring

This document provides a comprehensive guide to the analytics, user testing, A/B testing, and performance monitoring features implemented in the DID Blockchain Wallet application.

## 🚀 Overview

The application now includes a complete suite of analytics and testing tools designed to:

- **Track user behavior** and identify drop-off points
- **Conduct user testing sessions** with structured tasks
- **Run A/B tests** to optimize user flows
- **Monitor performance** and user engagement
- **Collect user feedback** throughout the application

## 📊 Analytics & Tracking

### Analytics Context (`src/contexts/AnalyticsContext.tsx`)

The analytics system automatically tracks:

- **Page views** and navigation patterns
- **User interactions** (clicks, form submissions, errors)
- **Conversion events** (onboarding completion, credential requests, etc.)
- **Performance metrics** (load times, FPS, memory usage)
- **User feedback** and satisfaction ratings

#### Usage

```typescript
import { useAnalytics } from '@/contexts/AnalyticsContext';

function MyComponent() {
  const { trackEvent, trackConversion, submitFeedback } = useAnalytics();

  const handleClick = () => {
    trackEvent({
      eventType: 'click',
      page: 'dashboard',
      action: 'button_click',
      element: 'request-credential-btn',
      data: { buttonText: 'Request Credential' }
    });
  };

  return <button onClick={handleClick}>Request Credential</button>;
}
```

### Analytics Dashboard (`src/pages/analytics.tsx`)

Access the analytics dashboard at `/analytics` to view:

- **User journey funnel** showing conversion rates
- **Drop-off points** identification
- **Feedback summaries** and sentiment analysis
- **Performance metrics** and trends
- **A/B test results** and variant performance

*Note: Analytics dashboard is only accessible to enterprise users or in development mode.*

## 🧪 User Testing Framework

### User Testing Toolkit (`src/components/user-testing/UserTestingToolkit.tsx`)

The user testing toolkit provides structured testing sessions with:

- **Task-based testing** with clear objectives
- **Progress tracking** and time measurement
- **Session recording** capabilities
- **Feedback collection** at session completion
- **Drop-off analysis** and completion rates

#### Features

- **Task Management**: Define structured tasks for users to complete
- **Time Tracking**: Measure completion times for each task
- **Feedback Prompts**: Collect qualitative feedback
- **Session Recording**: Optional screen recording capabilities
- **Analytics Integration**: Automatic tracking of user behavior

#### Usage

```typescript
<UserTestingToolkit
  tasks={[
    {
      id: 'onboarding_flow',
      title: 'Complete Onboarding',
      description: 'Go through the onboarding process and create your DID',
      completed: false
    },
    {
      id: 'request_credential',
      title: 'Request First Credential',
      description: 'Request your first digital credential from a trusted issuer',
      completed: false
    }
  ]}
  enableRecording={true}
  showFeedbackPrompts={true}
  onTaskComplete={(taskId, timeSpent) => {
    console.log(`Task ${taskId} completed in ${timeSpent}ms`);
  }}
  onSessionComplete={(results) => {
    console.log('User testing session completed:', results);
  }}
/>
```

### User Testing Provider

For more advanced usage, use the UserTestingProvider:

```typescript
import { UserTestingProvider, useUserTesting } from '@/components/user-testing/UserTestingToolkit';

function TestComponent() {
  const { currentTask, recordTaskCompletion, addFeedback } = useUserTesting();

  return (
    <div>
      {currentTask && (
        <div>
          <h3>{currentTask.title}</h3>
          <p>{currentTask.description}</p>
          <button onClick={() => recordTaskCompletion(currentTask.id)}>
            Complete Task
          </button>
        </div>
      )}
    </div>
  );
}
```

## 🔄 A/B Testing Framework

### AB Test Wrapper (`src/components/ab-testing/ABTestWrapper.tsx`)

The A/B testing system allows you to:

- **Define test variants** with different components or content
- **Automatic user assignment** based on weights
- **Performance tracking** for each variant
- **Real-time analytics** on variant performance

#### Current Active Tests

1. **Onboarding Flow Test** (`onboarding_flow`)
   - **Original**: Standard 5-step onboarding
   - **Simplified**: Quick 3-step setup
   - **Guided**: Educational 5-step with learning content

2. **Dashboard Layout Test** (`dashboard_layout`)
   - **Cards**: Card-based quick actions
   - **List**: List-based navigation

#### Usage

```typescript
import { ABTestVariant, useABTest } from '@/components/ab-testing/ABTestWrapper';

// Method 1: Hook-based
function MyComponent() {
  const variant = useABTest('onboarding_flow');

  if (variant?.id === 'simplified') {
    return <SimplifiedOnboarding />;
  }
  return <OriginalOnboarding />;
}

// Method 2: Wrapper component
function MyComponent() {
  return (
    <ABTestVariant
      testId="dashboard_layout"
      variants={{
        cards: <CardLayout />,
        list: <ListLayout />
      }}
      fallback={<DefaultLayout />}
    />
  );
}
```

## 📈 Performance Monitoring

### Performance Monitor (`src/components/performance/PerformanceMonitor.tsx`)

The performance monitoring system tracks:

- **Page load times** and navigation performance
- **Real-time FPS** monitoring
- **Memory usage** and DOM node counts
- **Network request** tracking
- **User engagement** metrics

#### Features

- **Real-time metrics** display (development mode only)
- **Automatic performance tracking** for all pages
- **Engagement monitoring** (time spent, interaction frequency)
- **Performance alerts** for slow-loading pages
- **Historical performance** data storage

#### Usage

```typescript
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';

// Add to any page for detailed monitoring
<PerformanceMonitor
  page="credentials"
  showDetailedMetrics={true}
  updateInterval={5000}
  enableRealTimeTracking={true}
/>
```

## 💬 User Feedback Collection

### Feedback Widget (`src/components/feedback/FeedbackWidget.tsx`)

The feedback widget provides:

- **Contextual feedback collection** based on current page
- **Multiple feedback types** (UX, Bug, Feature, Performance, Content)
- **Rating system** with 1-5 star scale
- **Quick feedback options** for positive/negative sentiment
- **Detailed feedback forms** for comprehensive input

#### Features

- **Smart positioning** (configurable corners)
- **Auto-trigger options** for timed feedback requests
- **Category-specific feedback** forms
- **Anonymous feedback** collection
- **Integration with analytics** system

#### Usage

```typescript
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';

// Add to any page or globally
<FeedbackWidget
  page="credentials"
  category="ux"
  position="bottom-right"
  trigger="button" // or 'auto' for timed triggers
  autoTriggerDelay={30000} // 30 seconds
/>
```

## 🔧 Configuration & Setup

### Environment Variables

```bash
# Analytics Configuration
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-api.com

# Performance Monitoring
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_PERFORMANCE_UPDATE_INTERVAL=5000

# A/B Testing
NEXT_PUBLIC_AB_TESTING_ENABLED=true

# User Testing
NEXT_PUBLIC_USER_TESTING_ENABLED=true
```

### Initialization

The analytics system is automatically initialized in `_app.tsx`:

```typescript
<AnalyticsProvider
  userId={userId}
  enableTracking={process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development'}
  enableABTesting={true}
  enableUserTesting={process.env.NODE_ENV === 'development'}
>
  {/* Your app components */}
</AnalyticsProvider>
```

## 📊 Data Storage & Privacy

### Local Storage Strategy

- **Analytics Events**: Stored locally with automatic cleanup (last 1000 events)
- **Performance Metrics**: Stored locally with cleanup (last 500 metrics)
- **User Feedback**: Stored locally with cleanup (last 200 entries)
- **A/B Test Assignments**: Persisted locally for consistent user experience
- **User Testing Sessions**: Temporary storage during active sessions

### Privacy Considerations

- **No personal data** is collected without explicit consent
- **Anonymous tracking** using generated user IDs
- **Local storage only** - no data sent to external servers by default
- **GDPR compliant** with easy data deletion options
- **Development mode** restrictions for privacy

## 📈 Analytics Events

### Automatic Events

- `page_view`: User navigates to a page
- `click`: User clicks on interactive elements
- `form_submit`: User submits forms
- `error`: JavaScript errors occur
- `conversion`: Key user actions (onboarding completion, credential requests, etc.)

### Custom Events

```typescript
const { trackEvent } = useAnalytics();

trackEvent({
  eventType: 'conversion',
  page: 'credentials',
  action: 'credential_requested',
  data: {
    credentialType: 'UniversityDegree',
    issuer: 'university.edu'
  }
});
```

## 🎯 Best Practices

### Analytics Implementation

1. **Consistent Event Naming**: Use clear, descriptive event names
2. **Meaningful Data**: Include relevant context in event data
3. **Performance Impact**: Minimize tracking overhead
4. **Privacy First**: Always consider user privacy
5. **Actionable Insights**: Focus on metrics that drive decisions

### A/B Testing Guidelines

1. **Clear Hypotheses**: Define what you're testing and why
2. **Statistical Significance**: Run tests long enough for valid results
3. **Single Variable**: Test one thing at a time
4. **User Segmentation**: Consider different user types
5. **Performance Monitoring**: Track impact on key metrics

### User Testing Best Practices

1. **Clear Objectives**: Define what you want to learn
2. **Realistic Tasks**: Use authentic user scenarios
3. **Unbiased Facilitation**: Don't lead users during testing
4. **Diverse Participants**: Test with varied user backgrounds
5. **Iterative Testing**: Use insights to improve and retest

## 🚨 Troubleshooting

### Common Issues

1. **Analytics Not Tracking**
   - Check if `AnalyticsProvider` is properly wrapped
   - Verify environment variables
   - Check browser console for errors

2. **A/B Tests Not Working**
   - Ensure test is active and has variants
   - Check user assignment logic
   - Verify component implementations

3. **Performance Data Missing**
   - Check if real-time tracking is enabled
   - Verify Performance API availability
   - Check browser compatibility

4. **Feedback Widget Not Showing**
   - Verify component import and placement
   - Check trigger conditions
   - Ensure proper page context

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('analytics_debug', 'true');
```

This will log all analytics events to the console.

## 🔮 Future Enhancements

### Planned Features

1. **Advanced Analytics Dashboard**
   - Real-time data visualization
   - Custom report builder
   - Export capabilities

2. **Machine Learning Integration**
   - Predictive user behavior analysis
   - Automated A/B test optimization
   - Smart feedback categorization

3. **Enhanced User Testing**
   - Remote testing capabilities
   - Automated task validation
   - Heatmap generation

4. **Performance Optimization**
   - Automated performance recommendations
   - Real-time alerts for performance issues
   - Comparative performance analysis

## 📞 Support

For questions about the analytics and testing implementation:

1. Check this documentation first
2. Review the component source code for detailed examples
3. Check browser developer tools for debugging information
4. Review analytics data in local storage for troubleshooting

---

*This analytics and testing framework provides a solid foundation for data-driven product development and continuous user experience improvement.*
