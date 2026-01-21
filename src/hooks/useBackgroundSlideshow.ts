import { useState, useEffect, useCallback, useRef } from 'react';

export interface BackgroundImage {
  src: string;
  alt: string;
  focusX?: number; // -1 to 1 for Ken Burns drift direction
  focusY?: number;
}

interface SlideshowState {
  currentIndex: number;
  nextIndex: number;
  isTransitioning: boolean;
  isPaused: boolean;
}

interface UseSlideshowReturn {
  currentImage: BackgroundImage;
  nextImage: BackgroundImage;
  isTransitioning: boolean;
  isPaused: boolean;
  pause: () => void;
  play: () => void;
  goToNext: () => void;
  goToPrev: () => void;
}

export function useBackgroundSlideshow(
  images: BackgroundImage[],
  intervalMs = 8000,
  crossfadeDuration = 2000
): UseSlideshowReturn {
  const [state, setState] = useState<SlideshowState>({
    currentIndex: 0,
    nextIndex: 1,
    isTransitioning: false,
    isPaused: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preloadRef = useRef<HTMLImageElement | null>(null);

  // Preload next image
  const preloadImage = useCallback((src: string) => {
    if (preloadRef.current) {
      preloadRef.current.src = '';
    }
    const img = new Image();
    img.src = src;
    preloadRef.current = img;
  }, []);

  // Advance to next image
  const advance = useCallback(() => {
    if (images.length <= 1) return;

    setState(prev => ({
      ...prev,
      isTransitioning: true,
    }));

    // After crossfade completes, update indices
    setTimeout(() => {
      setState(prev => {
        const newCurrentIndex = prev.nextIndex;
        const newNextIndex = (newCurrentIndex + 1) % images.length;
        
        // Preload the image after the next one
        const preloadIndex = (newNextIndex + 1) % images.length;
        preloadImage(images[preloadIndex].src);

        return {
          ...prev,
          currentIndex: newCurrentIndex,
          nextIndex: newNextIndex,
          isTransitioning: false,
        };
      });
    }, crossfadeDuration);
  }, [images, crossfadeDuration, preloadImage]);

  // Auto-advance timer
  useEffect(() => {
    if (state.isPaused || images.length <= 1) return;

    timerRef.current = setTimeout(advance, intervalMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.currentIndex, state.isPaused, intervalMs, advance, images.length]);

  // Preload next image on mount
  useEffect(() => {
    if (images.length > 1) {
      preloadImage(images[1].src);
    }
  }, [images, preloadImage]);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const goToNext = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    advance();
  }, [advance]);

  const goToPrev = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setState(prev => {
      const newCurrentIndex = (prev.currentIndex - 1 + images.length) % images.length;
      const newNextIndex = prev.currentIndex;
      return {
        ...prev,
        currentIndex: newCurrentIndex,
        nextIndex: newNextIndex,
        isTransitioning: false,
      };
    });
  }, [images.length]);

  return {
    currentImage: images[state.currentIndex],
    nextImage: images[state.nextIndex],
    isTransitioning: state.isTransitioning,
    isPaused: state.isPaused,
    pause,
    play,
    goToNext,
    goToPrev,
  };
}
