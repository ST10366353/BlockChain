/**
 * Simple Test to verify Jest setup
 */

describe('Jest Setup', () => {
  it('should run a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to test utilities', () => {
    expect((global as any).testUtils).toBeDefined();
    expect(typeof (global as any).testUtils.flushPromises).toBe('function');
  });

  it('should have localStorage mock', () => {
    expect(localStorage).toBeDefined();
    expect(typeof localStorage.getItem).toBe('function');
    expect(typeof localStorage.setItem).toBe('function');
  });
});
