"use client";

import React, { useEffect, useState } from 'react';
import { useAnalytics, ABTestVariant } from '../../contexts/AnalyticsContext';

interface ABTestWrapperProps {
  testId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onVariantAssigned?: (variant: ABTestVariant) => void;
}

export function ABTestWrapper({
  testId,
  children,
  fallback = children,
  onVariantAssigned
}: ABTestWrapperProps) {
  const { getABTestVariant } = useAnalytics();
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const assignedVariant = getABTestVariant(testId);

    if (assignedVariant) {
      setVariant(assignedVariant);
      onVariantAssigned?.(assignedVariant);
    }

    setIsLoading(false);
  }, [testId, getABTestVariant, onVariantAssigned]);

  if (isLoading) {
    // Return original content while determining variant
    return <>{children}</>;
  }

  if (!variant) {
    // Return fallback if no variant is assigned
    return <>{fallback}</>;
  }

  // For now, return original children - in a real implementation,
  // you would conditionally render different components based on the variant
  return <>{children}</>;
}

// Hook for using A/B testing in components
export function useABTest(testId: string) {
  const { getABTestVariant, trackABTestExposure } = useAnalytics();
  const [variant, setVariant] = useState<ABTestVariant | null>(null);

  useEffect(() => {
    const assignedVariant = getABTestVariant(testId);
    if (assignedVariant) {
      setVariant(assignedVariant);
      trackABTestExposure(testId, assignedVariant.id);
    }
  }, [testId, getABTestVariant, trackABTestExposure]);

  return variant;
}

// Component for conditional rendering based on A/B test variants
interface ABTestVariantProps {
  testId: string;
  variants: {
    [key: string]: React.ReactNode;
  };
  fallback?: React.ReactNode;
}

export function ABTestVariant({
  testId,
  variants,
  fallback
}: ABTestVariantProps) {
  const variant = useABTest(testId);

  if (!variant || !variants[variant.id]) {
    return <>{fallback || null}</>;
  }

  return <>{variants[variant.id]}</>;
}
