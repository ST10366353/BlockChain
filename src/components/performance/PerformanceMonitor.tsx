"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Activity, TrendingUp, TrendingDown, Zap, Clock, Database } from 'lucide-react';
import { useAnalytics } from '../../contexts/AnalyticsContext';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  networkRequests: number;
  domNodes: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  page: string;
  showDetailedMetrics?: boolean;
  updateInterval?: number;
  enableRealTimeTracking?: boolean;
}

export function PerformanceMonitor({
  page,
  showDetailedMetrics = false,
  updateInterval = 5000,
  enableRealTimeTracking = true
}: PerformanceMonitorProps) {
  const { trackPerformance } = useAnalytics();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    loadTime: 0,
    networkRequests: 0,
    domNodes: 0,
    timestamp: Date.now(),
  });

  const [isVisible, setIsVisible] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const fpsIntervalRef = useRef<NodeJS.Timeout>();
  const metricsIntervalRef = useRef<NodeJS.Timeout>();

  // Calculate FPS
  useEffect(() => {
    if (!enableRealTimeTracking) return;

    const calculateFPS = () => {
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      frameCountRef.current++;

      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        setMetrics(prev => ({
          ...prev,
          fps,
          timestamp: now
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      fpsIntervalRef.current = setTimeout(calculateFPS, 100);
    };

    calculateFPS();

    return () => {
      if (fpsIntervalRef.current) {
        clearTimeout(fpsIntervalRef.current);
      }
    };
  }, [enableRealTimeTracking]);

  // Monitor performance metrics
  useEffect(() => {
    if (!enableRealTimeTracking) return;

    const updateMetrics = () => {
      const newMetrics: Partial<PerformanceMetrics> = {
        timestamp: Date.now()
      };

      // Memory usage (if available)
      if (performance.memory) {
        newMetrics.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
      }

      // DOM nodes count
      newMetrics.domNodes = document.getElementsByTagName('*').length;

      // Network requests count (approximate)
      if (performance.getEntriesByType) {
        const resources = performance.getEntriesByType('resource');
        newMetrics.networkRequests = resources.length;
      }

      setMetrics(prev => ({ ...prev, ...newMetrics }));

      // Track performance metrics
      Object.entries(newMetrics).forEach(([key, value]) => {
        if (typeof value === 'number' && key !== 'timestamp') {
          trackPerformance({
            metric: key as any,
            value,
            page
          });
        }
      });
    };

    metricsIntervalRef.current = setInterval(updateMetrics, updateInterval);

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [enableRealTimeTracking, updateInterval, page, trackPerformance]);

  // Track user engagement
  useEffect(() => {
    if (!enableRealTimeTracking) return;

    let interactionCount = 0;
    let lastInteraction = Date.now();

    const handleInteraction = () => {
      interactionCount++;
      lastInteraction = Date.now();
    };

    const interactionEvents = ['click', 'keydown', 'scroll', 'mousemove'];

    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });

    const engagementInterval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction;

      // Track engagement metrics
      if (interactionCount > 0) {
        trackPerformance({
          metric: 'interaction_time',
          value: timeSinceLastInteraction,
          page
        });
      }

      interactionCount = 0;
    }, 30000); // Every 30 seconds

    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
      clearInterval(engagementInterval);
    };
  }, [enableRealTimeTracking, page, trackPerformance]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      trackPerformance({
        metric: 'page_visibility',
        value: isVisible ? 1 : 0,
        page
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [page, trackPerformance]);

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value >= thresholds.warning) return <Activity className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  if (!showDetailedMetrics) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        title="Toggle Performance Monitor"
      >
        <Activity className="w-4 h-4" />
      </button>

      {isVisible && (
        <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* FPS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">FPS</span>
              </div>
              <div className="flex items-center space-x-2">
                {getPerformanceIcon(metrics.fps, { good: 50, warning: 30 })}
                <span className={`text-sm font-mono ${getPerformanceColor(metrics.fps, { good: 50, warning: 30 })}`}>
                  {metrics.fps}
                </span>
              </div>
            </div>

            {/* Memory Usage */}
            {metrics.memoryUsage > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Memory</span>
                </div>
                <span className={`text-sm font-mono ${getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 100 })}`}>
                  {metrics.memoryUsage.toFixed(1)} MB
                </span>
              </div>
            )}

            {/* DOM Nodes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">DOM Nodes</span>
              </div>
              <span className="text-sm font-mono text-gray-600">
                {metrics.domNodes}
              </span>
            </div>

            {/* Network Requests */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Network Requests</span>
              </div>
              <span className="text-sm font-mono text-gray-600">
                {metrics.networkRequests}
              </span>
            </div>

            {/* Load Time */}
            {metrics.loadTime > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Load Time</span>
                </div>
                <span className={`text-sm font-mono ${getPerformanceColor(metrics.loadTime, { good: 1000, warning: 2000 })}`}>
                  {metrics.loadTime}ms
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Page: {page}</span>
              <span>Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
