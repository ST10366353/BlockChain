"use client";

import React from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/page-layout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useUserType } from '@/shared/hooks';

export default function AnalyticsPage() {
  const { userType } = useUserType();
  const router = useRouter();

  // Only allow access to enterprise users or developers
  if (userType !== 'enterprise' && process.env.NODE_ENV === 'production') {
    router.push('/dashboard');
    return null;
  }

  return (
    <DashboardLayout>
      <AnalyticsDashboard
        showDetailedMetrics={true}
        refreshInterval={15000}
      />
    </DashboardLayout>
  );
}
