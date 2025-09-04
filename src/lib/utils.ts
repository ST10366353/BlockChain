import React from 'react';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utility
export function formatDate(date: string | Date): string {
  if (!date) return 'N/A'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return 'Invalid Date'

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Text truncation utility
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// DID formatting utility
export function formatDID(did: string): string {
  if (!did) return 'N/A'
  if (did.length <= 20) return did
  return did.substring(0, 10) + '...' + did.substring(did.length - 8)
}

// Status color utility
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'verified':
    case 'active':
      return 'text-green-600 bg-green-50'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50'
    case 'error':
    case 'failed':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// File size formatting utility
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
