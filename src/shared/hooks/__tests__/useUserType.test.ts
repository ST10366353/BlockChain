import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useUserType, UserTypeProvider } from '../useUserType';

// Mock the profileAPI
jest.mock('@/services', () => ({
  profileAPI: {
    getProfile: jest.fn(),
  },
  auditAPI: {
    getUserActivity: jest.fn(),
  },
}));

const mockProfileAPI = require('@/services').profileAPI;
const mockAuditAPI = require('@/services').auditAPI;

describe('useUserType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should return default consumer type when no data available', async () => {
    mockProfileAPI.getProfile.mockResolvedValue(null);
    mockAuditAPI.getUserActivity.mockResolvedValue([]);

    const { result } = renderHook(() => useUserType(), {
      wrapper: UserTypeProvider,
    });

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.userType).toBe('consumer');
    expect(result.current.isConsumer).toBe(true);
    expect(result.current.isEnterprise).toBe(false);
  });

  it('should detect enterprise user type based on organization', async () => {
    const mockUser = global.testUtils.createMockUser({
      organization: {
        id: 'org_123',
        name: 'Example Corp',
        type: 'corporation'
      }
    });

    mockProfileAPI.getProfile.mockResolvedValue(mockUser);
    mockAuditAPI.getUserActivity.mockResolvedValue([]);

    const { result } = renderHook(() => useUserType(), {
      wrapper: UserTypeProvider,
    });

    // Wait for user type detection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.userType).toBe('enterprise');
    expect(result.current.isEnterprise).toBe(true);
    expect(result.current.isConsumer).toBe(false);
  });

  it('should detect power user based on advanced features usage', async () => {
    const mockUser = global.testUtils.createMockUser();
    const mockActivity = [
      { action: 'selective.disclosure', timestamp: new Date().toISOString() },
      { action: 'zkp.generate', timestamp: new Date().toISOString() },
      { action: 'multi.did', timestamp: new Date().toISOString() },
    ];

    mockProfileAPI.getProfile.mockResolvedValue(mockUser);
    mockAuditAPI.getUserActivity.mockResolvedValue(mockActivity);

    const { result } = renderHook(() => useUserType(), {
      wrapper: UserTypeProvider,
    });

    // Wait for user type detection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.userType).toBe('power-user');
    expect(result.current.isPowerUser).toBe(true);
  });

  it('should allow manual user type switching', async () => {
    mockProfileAPI.getProfile.mockResolvedValue(null);
    mockAuditAPI.getUserActivity.mockResolvedValue([]);

    const { result } = renderHook(() => useUserType(), {
      wrapper: UserTypeProvider,
    });

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Switch to enterprise
    act(() => {
      result.current.setUserType('enterprise');
    });

    expect(result.current.userType).toBe('enterprise');
    expect(result.current.isEnterprise).toBe(true);
    expect(localStorage.getItem('userType')).toBe('enterprise');
  });

  it('should provide correct feature flags for enterprise users', async () => {
    const { result } = renderHook(() => useUserType(), {
      wrapper: UserTypeProvider,
    });

    // Switch to enterprise
    act(() => {
      result.current.setUserType('enterprise');
    });

    const features = result.current.profile?.preferences || {};
    expect(features).toBeDefined();
  });

  it('should handle API errors gracefully', async () => {
    mockProfileAPI.getProfile.mockRejectedValue(new Error('API Error'));
    mockAuditAPI.getUserActivity.mockRejectedValue(new Error('Audit API Error'));

    const { result } = renderHook(() => useUserType(), {
      wrapper: UserTypeProvider,
    });

    // Wait for error handling
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.userType).toBe('consumer'); // fallback
    expect(result.current.error).toBe('Failed to detect user type');
  });

  it('should respect stored user type preference', async () => {
    localStorage.setItem('userType', 'power-user');

    mockProfileAPI.getProfile.mockResolvedValue(null);
    mockAuditAPI.getUserActivity.mockResolvedValue([]);

    const { result } = renderHook(() => useUserType(), {
      wrapper: UserTypeProvider,
    });

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.userType).toBe('power-user');
  });
});
