"use client";

import React from 'react';
;;
import { Activity, TrendingUp, TrendingDown, Zap, Clock, Database } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  networkRequests: number;
  domNodes: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  className?: string;
  showDetailedMetrics?: boolean;
  updateInterval?: number;
}

export function PerformanceMonitor({
  className = '',
  showDetailedMetrics = false,
  updateInterval = 5000
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    loadTime: 0,
    networkRequests: 0,
    domNodes: 0,
    timestamp: Date.now(),
  });

  const [isVisible, setIsVisible] = React.useState(false);
  const frameCountRef = React.useRef(0);
  const lastTimeRef = React.useRef(performance.now());
  const fpsHistoryRef = React.useRef<number[]>([]);

  // Calculate FPS
  React.useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCountRef.current++;

      if (currentTime - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        fpsHistoryRef.current.push(fps);

        // Keep only last 10 readings
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }

        // Calculate average FPS
        const averageFps = fpsHistoryRef.current.reduce((sum, f) => sum + f, 0) / fpsHistoryRef.current.length;

        setMetrics(prev => ({
          ...prev,
          fps: Math.round(averageFps),
          timestamp: Date.now(),
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Monitor memory usage and DOM nodes
  React.useEffect(() => {
    const updateMetrics = () => {
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB

        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memoryUsage),
          domNodes: document.getElementsByTagName('*').length,
        }));
      }
    };

    const interval = setInterval(updateMetrics, updateInterval);
    updateMetrics(); // Initial call

    return () => clearInterval(interval);
  }, [updateInterval]);

  // Monitor network requests
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        setMetrics(prev => ({
          ...prev,
          networkRequests: prev.networkRequests + entries.length,
        }));
      });

      observer.observe({ entryTypes: ['resource'] });

      return () => observer.disconnect();
    }
  }, []);

  // Measure page load time
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        setMetrics(prev => ({
          ...prev,
          loadTime: Math.round(loadTime),
        }));
      }
    }
  }, []);

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value >= thresholds.warning) return <TrendingDown className="w-4 h-4 text-yellow-600" />;
    return <Activity className="w-4 h-4 text-red-600" />;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Show Performance Monitor"
      >
        <Zap className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
          title="Hide Performance Monitor"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-sm text-gray-700">FPS</span>
          </div>
          <div className="flex items-center">
            {getPerformanceIcon(metrics.fps, { good: 50, warning: 30 })}
            <span className={`ml-1 font-mono text-sm ${getPerformanceColor(metrics.fps, { good: 50, warning: 30 })}`}>
              {metrics.fps}
            </span>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="w-4 h-4 mr-2 text-purple-600" />
            <span className="text-sm text-gray-700">Memory</span>
          </div>
          <span className={`font-mono text-sm ${getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 100 })}`}>
            {metrics.memoryUsage}MB
          </span>
        </div>

        {/* Load Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-orange-600" />
            <span className="text-sm text-gray-700">Load Time</span>
          </div>
          <span className={`font-mono text-sm ${getPerformanceColor(metrics.loadTime, { good: 1000, warning: 3000 })}`}>
            {metrics.loadTime}ms
          </span>
        </div>

        {showDetailedMetrics && (
          <>
            {/* Network Requests */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm text-gray-700">Network</span>
              </div>
              <span className="font-mono text-sm text-gray-600">
                {metrics.networkRequests} req
              </span>
            </div>

            {/* DOM Nodes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-600" />
                <span className="text-sm text-gray-700">DOM Nodes</span>
              </div>
              <span className="font-mono text-sm text-gray-600">
                {metrics.domNodes}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  networkRequests: number;
  domNodes: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  className?: string;
  showDetailedMetrics?: boolean;
  updateInterval?: number;
}

export function PerformanceMonitor({
  className = '',
  showDetailedMetrics = false,
  updateInterval = 5000
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    loadTime: 0,
    networkRequests: 0,
    domNodes: 0,
    timestamp: Date.now(),
  });

  const [isVisible, setIsVisible] = React.useState(false);
  const frameCountRef = React.useRef(0);
  const lastTimeRef = React.useRef(performance.now());
  const fpsHistoryRef = React.useRef<number[]>([]);

  // Calculate FPS
  React.useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCountRef.current++;

      if (currentTime - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        fpsHistoryRef.current.push(fps);

        // Keep only last 10 readings
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }

        // Calculate average FPS
        const averageFps = fpsHistoryRef.current.reduce((sum, f) => sum + f, 0) / fpsHistoryRef.current.length;

        setMetrics(prev => ({
          ...prev,
          fps: Math.round(averageFps),
          timestamp: Date.now(),
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Monitor memory usage and DOM nodes
  React.useEffect(() => {
    const updateMetrics = () => {
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB

        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memoryUsage),
          domNodes: document.getElementsByTagName('*').length,
        }));
      }
    };

    const interval = setInterval(updateMetrics, updateInterval);
    updateMetrics(); // Initial call

    return () => clearInterval(interval);
  }, [updateInterval]);

  // Monitor network requests
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        setMetrics(prev => ({
          ...prev,
          networkRequests: prev.networkRequests + entries.length,
        }));
      });

      observer.observe({ entryTypes: ['resource'] });

      return () => observer.disconnect();
    }
  }, []);

  // Measure page load time
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        setMetrics(prev => ({
          ...prev,
          loadTime: Math.round(loadTime),
        }));
      }
    }
  }, []);

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value >= thresholds.warning) return <TrendingDown className="w-4 h-4 text-yellow-600" />;
    return <Activity className="w-4 h-4 text-red-600" />;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Show Performance Monitor"
      >
        <Zap className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
          title="Hide Performance Monitor"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-sm text-gray-700">FPS</span>
          </div>
          <div className="flex items-center">
            {getPerformanceIcon(metrics.fps, { good: 50, warning: 30 })}
            <span className={`ml-1 font-mono text-sm ${getPerformanceColor(metrics.fps, { good: 50, warning: 30 })}`}>
              {metrics.fps}
            </span>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="w-4 h-4 mr-2 text-purple-600" />
            <span className="text-sm text-gray-700">Memory</span>
          </div>
          <span className={`font-mono text-sm ${getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 100 })}`}>
            {metrics.memoryUsage}MB
          </span>
        </div>

        {/* Load Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-orange-600" />
            <span className="text-sm text-gray-700">Load Time</span>
          </div>
          <span className={`font-mono text-sm ${getPerformanceColor(metrics.loadTime, { good: 1000, warning: 3000 })}`}>
            {metrics.loadTime}ms
          </span>
        </div>

        {showDetailedMetrics && (
          <>
            {/* Network Requests */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm text-gray-700">Network</span>
              </div>
              <span className="font-mono text-sm text-gray-600">
                {metrics.networkRequests} req
              </span>
            </div>

            {/* DOM Nodes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-600" />
                <span className="text-sm text-gray-700">DOM Nodes</span>
              </div>
              <span className="font-mono text-sm text-gray-600">
                {metrics.domNodes}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
