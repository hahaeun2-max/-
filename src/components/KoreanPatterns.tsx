/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Authentic Korean Traditional Patterns based on the reference collection.
 * Includes flower medallion, knot motif, cloud waves, and geometric lattices.
 */

import React from 'react';

// 1. Traditional Flower Medallion (국화문 / 연화문)
export function KoreanFlowerPattern({ className = "w-6 h-6", color = "#534235" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="5" stroke={color} strokeWidth="1.8" />
      <path d="M24 6C22 13 22 16 24 19C26 16 26 13 24 6Z" stroke={color} strokeWidth="1.8" />
      <path d="M24 42C22 35 22 32 24 29C26 32 26 35 24 42Z" stroke={color} strokeWidth="1.8" />
      <path d="M6 24C13 22 16 22 19 24C16 26 13 26 6 24Z" stroke={color} strokeWidth="1.8" />
      <path d="M42 24C35 22 32 22 29 24C32 26 35 26 42 24Z" stroke={color} strokeWidth="1.8" />
      <path d="M11.3 11.3C16.9 15.5 18.5 17.5 20.5 20.5C17.5 18.5 15.5 16.9 11.3 11.3Z" stroke={color} strokeWidth="1.8" />
      <path d="M36.7 36.7C31.1 32.5 29.5 30.5 27.5 27.5C30.5 29.5 32.5 31.1 36.7 36.7Z" stroke={color} strokeWidth="1.8" />
      <path d="M11.3 36.7C16.9 32.5 18.5 30.5 20.5 27.5C17.5 29.5 15.5 31.1 11.3 36.7Z" stroke={color} strokeWidth="1.8" />
      <path d="M36.7 11.3C31.1 15.5 29.5 17.5 27.5 20.5C30.5 18.5 32.5 16.9 36.7 11.3Z" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

// 2. Traditional Cloud Pattern (구름문 / 청파문)
export function KoreanCloudPattern({ className = "w-8 h-4", color = "#534235" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 28C12 20 18 14 26 14C32 14 37 17 39 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M6 28C6 16 16 8 26 8C35 8 42 12 45 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M26 28C26 22 30 18 36 18C41 18 45 21 47 25" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M38 28C38 21 43 16 50 16C56 16 60 20 62 25" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M2 28H62" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 3. Traditional Knot Motif (동심결 매듭문)
export function KoreanKnotPattern({ className = "w-6 h-6", color = "#534235" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central square loop */}
      <rect x="16" y="16" width="16" height="16" rx="4" stroke={color} strokeWidth="2" />
      {/* Top petal loop */}
      <path d="M16 16C16 9 20 5 24 5C28 5 32 9 32 16" stroke={color} strokeWidth="2" />
      {/* Bottom petal loop */}
      <path d="M16 32C16 39 20 43 24 43C28 43 32 39 32 32" stroke={color} strokeWidth="2" />
      {/* Left petal loop */}
      <path d="M16 16C9 16 5 20 5 24C5 28 9 32 16 32" stroke={color} strokeWidth="2" />
      {/* Right petal loop */}
      <path d="M32 16C39 16 43 20 43 24C43 28 39 32 32 32" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// 4. Korean Window Lattice Geometric Motif (창호살 격자 아자문)
export function KoreanLatticePattern({ className = "w-6 h-6", color = "#534235" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="32" height="32" rx="3" stroke={color} strokeWidth="1.8" />
      <rect x="16" y="16" width="16" height="16" stroke={color} strokeWidth="1.8" />
      <line x1="24" y1="8" x2="24" y2="40" stroke={color} strokeWidth="1.6" />
      <line x1="8" y1="24" x2="40" y2="24" stroke={color} strokeWidth="1.6" />
      <circle cx="8" cy="8" r="2" fill={color} />
      <circle cx="40" cy="8" r="2" fill={color} />
      <circle cx="8" cy="40" r="2" fill={color} />
      <circle cx="40" cy="40" r="2" fill={color} />
    </svg>
  );
}

// 5. Corner Accent for Recipe Card & Certificates
export function KoreanCornerAccent({ className = "w-5 h-5", color = "#534235" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12V4C2 2.9 2.9 2 4 2H12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M6 10V6C6 4.9 6.9 4 8 4H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="3" cy="3" r="1.5" fill={color} />
    </svg>
  );
}
