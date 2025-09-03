"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAnalytics } from '../../contexts/AnalyticsContext';

interface FeedbackWidgetProps {
  page: string;
  category: 'ux' | 'bug' | 'feature' | 'performance' | 'content';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  trigger?: 'button' | 'auto' | 'manual';
  autoTriggerDelay?: number;
}

export function FeedbackWidget({
  page,
  category,
  position = 'bottom-right',
  trigger = 'button',
  autoTriggerDelay = 30000
}: FeedbackWidgetProps) {
  const { submitFeedback } = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showQuickFeedback, setShowQuickFeedback] = useState(false);

  // Auto-trigger feedback collection
  useEffect(() => {
    if (trigger === 'auto') {
      const timer = setTimeout(() => {
        setShowQuickFeedback(true);
      }, autoTriggerDelay);

      return () => clearTimeout(timer);
    }
  }, [trigger, autoTriggerDelay]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const handleRating = (value: number) => {
    setRating(value);
    if (value <= 3) {
      setFeedbackType('bug');
    } else if (value >= 4) {
      setFeedbackType('feature');
    }
  };

  const handleQuickFeedback = async (positive: boolean) => {
    setShowQuickFeedback(false);
    if (!positive) {
      setIsOpen(true);
    } else {
      // Submit positive quick feedback
      await submitFeedback({
        rating: 5,
        feedback: 'Quick positive feedback',
        category,
        page
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !feedback.trim()) return;

    setIsSubmitting(true);

    try {
      await submitFeedback({
        rating,
        feedback: feedback.trim(),
        category: feedbackType === 'general' ? category : feedbackType,
        page
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setRating(0);
        setFeedback('');
        setFeedbackType('general');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Quick Feedback Modal */}
      {showQuickFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How was your experience?
              </h3>
              <p className="text-sm text-gray-600">
                Help us improve by sharing your thoughts
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleQuickFeedback(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Good
              </button>
              <button
                onClick={() => handleQuickFeedback(false)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Needs Work
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Feedback Widget */}
      <div className={`fixed ${positionClasses[position]} z-40`}>
        {/* Feedback Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Give Feedback"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}

        {/* Feedback Form */}
        {isOpen && (
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Feedback</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ThumbsUp className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Thank you!</h4>
                <p className="text-sm text-gray-600">Your feedback helps us improve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you rate this page?
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What type of feedback?
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value as typeof feedbackType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>

                {/* Feedback Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you think..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={rating === 0 || !feedback.trim() || isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
