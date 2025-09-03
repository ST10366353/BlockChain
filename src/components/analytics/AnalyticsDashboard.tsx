"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface AnalyticsDashboardProps {
  userId?: string;
  showDetailedMetrics?: boolean;
  refreshInterval?: number;
}

export function AnalyticsDashboard({
  userId,
  showDetailedMetrics = false,
  refreshInterval = 30000
}: AnalyticsDashboardProps) {
  const {
    getUserJourney,
    getFeedbackSummary,
    getDropOffPoints,
    getConversionFunnel
  } = useAnalytics();

  const [userJourney, setUserJourney] = useState<Array<{step: string; timestamp: number; duration?: number}>>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<Record<string, number>>({});
  const [dropOffPoints, setDropOffPoints] = useState<Record<string, number>>({});
  const [conversionFunnel, setConversionFunnel] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(() => {
    if (userId) {
      setUserJourney(getUserJourney(userId));
    }
    setFeedbackSummary(getFeedbackSummary());
    setDropOffPoints(getDropOffPoints());
    setConversionFunnel(getConversionFunnel());
    setIsLoading(false);
  }, [userId, getUserJourney, getFeedbackSummary, getDropOffPoints, getConversionFunnel]);

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(loadAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [userId, refreshInterval, loadAnalytics]);

  const getTopDropOffPoints = () => {
    return Object.entries(dropOffPoints)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getFeedbackStats = () => {
    const total = Object.values(feedbackSummary).reduce((sum, count) => sum + count, 0);
    const positive = Object.entries(feedbackSummary)
      .filter(([key]) => key.includes('4') || key.includes('5'))
      .reduce((sum, [, count]) => sum + count, 0);
    const negative = Object.entries(feedbackSummary)
      .filter(([key]) => key.includes('1') || key.includes('2'))
      .reduce((sum, [, count]) => sum + count, 0);

    return { total, positive, negative };
  };

  const feedbackStats = getFeedbackStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(conversionFunnel).reduce((sum, count) => sum + count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Active user sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userJourney.filter(event => event.eventType === 'page_view').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total page interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Received</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {feedbackStats.positive} positive, {feedbackStats.negative} needs improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversionFunnel.onboarding_started ?
                Math.round((conversionFunnel.first_presentation_created / conversionFunnel.onboarding_started) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Presentation creation rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            User Journey Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'onboarding_started', label: 'Onboarding Started', icon: Users },
              { key: 'onboarding_completed', label: 'Onboarding Completed', icon: CheckCircle },
              { key: 'first_credential_requested', label: 'First Credential', icon: Target },
              { key: 'first_presentation_created', label: 'First Presentation', icon: FileText }
            ].map(({ key, label, icon: Icon }) => {
              const count = conversionFunnel[key as keyof typeof conversionFunnel] || 0;
              const previousKey = key === 'onboarding_started' ? null :
                key === 'onboarding_completed' ? 'onboarding_started' :
                key === 'first_credential_requested' ? 'onboarding_completed' : 'first_credential_requested';

              const previousCount = previousKey ? (conversionFunnel[previousKey as keyof typeof conversionFunnel] || 0) : count;
              const conversionRate = previousCount > 0 ? Math.round((count / previousCount) * 100) : 0;

              return (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold">{count}</span>
                    {previousKey && (
                      <Badge variant={conversionRate >= 70 ? 'default' : conversionRate >= 50 ? 'secondary' : 'destructive'}>
                        {conversionRate}% conversion
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Top Drop-off Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getTopDropOffPoints().map(([page, count]) => (
              <div key={page} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium capitalize">{page.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-600 font-medium">{count}</span>
                  <span className="text-sm text-gray-600">drop-offs</span>
                </div>
              </div>
            ))}
            {getTopDropOffPoints().length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No drop-off points detected yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      {showDetailedMetrics && userId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              User Journey Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {userJourney.slice(-20).reverse().map((event, index) => (
                <div key={event.id || index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{event.eventType.replace('_', ' ')}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Page: {event.page}
                      {event.action && ` • Action: ${event.action}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
