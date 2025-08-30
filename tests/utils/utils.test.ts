import { cn } from '@/lib/utils'

// Test the cn utility function
describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
  })

  it('should handle undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
  })

  it('should handle empty strings', () => {
    expect(cn('class1', '', 'class2')).toBe('class1 class2')
  })

  it('should handle complex class combinations', () => {
    const result = cn(
      'base-class',
      true && 'conditional-true',
      false && 'conditional-false',
      undefined,
      null,
      'final-class'
    )
    expect(result).toBe('base-class conditional-true final-class')
  })

  it('should handle clsx-like functionality', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2')
  })
})
