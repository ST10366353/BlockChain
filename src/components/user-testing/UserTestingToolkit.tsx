"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { MessageSquare, Camera, Play, Pause, Square, CheckCircle, XCircle } from 'lucide-react';

interface UserTestingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timeSpent?: number;
}

interface UserTestingToolkitProps {
  tasks: UserTestingTask[];
  onTaskComplete?: (taskId: string, timeSpent: number) => void;
  onSessionComplete?: (results: UserTestingResults) => void;
  enableRecording?: boolean;
  showFeedbackPrompts?: boolean;
}

interface UserTestingResults {
  sessionId: string;
  completedTasks: string[];
  totalTime: number;
  taskTimes: Record<string, number>;
  feedback: string[];
  dropOffPoints: string[];
}

const UserTestingContext = createContext<{
  currentTask: UserTestingTask | null;
  completedTasks: string[];
  sessionId: string;
  startTime: number;
  recordTaskCompletion: (taskId: string) => void;
  addFeedback: (feedback: string) => void;
} | null>(null);

export function useUserTesting() {
  const context = useContext(UserTestingContext);
  if (!context) {
    throw new Error('useUserTesting must be used within UserTestingProvider');
  }
  return context;
}

export function UserTestingProvider({
  children,
  sessionId,
  tasks
}: {
  children: React.ReactNode;
  sessionId: string;
  tasks: UserTestingTask[];
}) {
  const { recordUserTestingEvent } = useAnalytics();
  const [currentTask, setCurrentTask] = useState<UserTestingTask | null>(tasks[0] || null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  const recordTaskCompletion = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !completedTasks.includes(taskId)) {
      const timeSpent = Date.now() - startTime;
      setCompletedTasks(prev => [...prev, taskId]);

      // Move to next task
      const currentIndex = tasks.findIndex(t => t.id === taskId);
      if (currentIndex < tasks.length - 1) {
        setCurrentTask(tasks[currentIndex + 1]);
      } else {
        setCurrentTask(null);
      }

      recordUserTestingEvent(sessionId, 'task_completed', {
        taskId,
        timeSpent,
        taskTitle: task.title
      });
    }
  };

  const addFeedback = (feedback: string) => {
    recordUserTestingEvent(sessionId, 'feedback_added', { feedback });
  };

  return (
    <UserTestingContext.Provider value={{
      currentTask,
      completedTasks,
      sessionId,
      startTime,
      recordTaskCompletion,
      addFeedback
    }}>
      {children}
    </UserTestingContext.Provider>
  );
}

export function UserTestingToolkit({
  tasks,
  onTaskComplete,
  onSessionComplete,
  enableRecording = false,
  showFeedbackPrompts = true
}: UserTestingToolkitProps) {
  const { startUserTestingSession, endUserTestingSession, recordUserTestingEvent } = useAnalytics();
  const [sessionId, setSessionId] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskStartTime, setTaskStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<UserTestingTask[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const currentTask = tasks[currentTaskIndex];

  const startSession = () => {
    const newSessionId = startUserTestingSession(tasks.map(t => t.title));
    setSessionId(newSessionId);
    setIsActive(true);
    setTaskStartTime(Date.now());
    setCurrentTaskIndex(0);
    setCompletedTasks([]);

    recordUserTestingEvent(newSessionId, 'session_started', {
      taskCount: tasks.length
    });
  };

  const endSession = () => {
    if (sessionId) {
      endUserTestingSession(sessionId);
      setIsActive(false);

      const results: UserTestingResults = {
        sessionId,
        completedTasks: completedTasks.map(t => t.id),
        totalTime: Date.now() - taskStartTime,
        taskTimes: completedTasks.reduce((acc, task) => ({
          ...acc,
          [task.id]: task.timeSpent || 0
        }), {}),
        feedback: [feedback].filter(Boolean),
        dropOffPoints: []
      };

      onSessionComplete?.(results);
    }
  };

  const completeTask = () => {
    if (!currentTask) return;

    const timeSpent = Date.now() - taskStartTime;
    const updatedTask = { ...currentTask, completed: true, timeSpent };

    setCompletedTasks(prev => [...prev, updatedTask]);
    onTaskComplete?.(currentTask.id, timeSpent);

    recordUserTestingEvent(sessionId, 'task_completed', {
      taskId: currentTask.id,
      taskTitle: currentTask.title,
      timeSpent
    });

    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setTaskStartTime(Date.now());
    } else {
      // All tasks completed
      if (showFeedbackPrompts) {
        setShowFeedbackModal(true);
      } else {
        endSession();
      }
    }
  };

  const submitFeedback = () => {
    if (sessionId && feedback.trim()) {
      recordUserTestingEvent(sessionId, 'final_feedback', { feedback });
    }
    setShowFeedbackModal(false);
    endSession();
  };

  const skipTask = () => {
    recordUserTestingEvent(sessionId, 'task_skipped', {
      taskId: currentTask?.id,
      taskTitle: currentTask?.title
    });

    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setTaskStartTime(Date.now());
    } else {
      endSession();
    }
  };

  if (!isActive) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={startSession}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center"
          title="Start User Testing Session"
        >
          <Play className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Main Testing Panel */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">User Testing</h3>
            <div className="flex items-center space-x-2">
              {enableRecording && (
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-1 rounded ${isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                  title={isRecording ? 'Stop Recording' : 'Start Recording'}
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={endSession}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="End Session"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Task {currentTaskIndex + 1} of {tasks.length}</span>
              <span>{completedTasks.length} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentTaskIndex + 1) / tasks.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Task */}
          {currentTask && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{currentTask.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{currentTask.description}</p>

              <div className="flex space-x-2">
                <button
                  onClick={completeTask}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </button>
                <button
                  onClick={skipTask}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Feedback
            </button>
            <span className="text-xs text-gray-500">
              Session: {sessionId.slice(-8)}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Thoughts</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you think about this testing session?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Skip
              </button>
              <button
                onClick={submitFeedback}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
