'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const SLIDE_COUNT = 31;
const SLIDE_MS = 5000;

const SLIDES = Array.from(
  { length: SLIDE_COUNT },
  (_, index) => `/coleccionistas/${String(index + 1).padStart(2, '0')}.webp`,
);

/**
 * Crossfade of collector photographs behind the landing copy. Purely decorative, so it is
 * hidden from assistive technology and freezes for anyone who asked for reduced motion.
 */
export const CollectorSlideshow = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDE_COUNT);
    }, SLIDE_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {SLIDES.map((src, slideIndex) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={slideIndex === 0}
          loading={slideIndex === 0 ? undefined : 'lazy'}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            slideIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />
    </div>
  );
};
