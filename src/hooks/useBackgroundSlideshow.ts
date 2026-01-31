import { useState, useEffect, useCallback, useRef } from 'react';

export interface BackgroundImage {
  src: string;
  lowResSrc?: string; // For mobile optimization
  alt: string;
  focusX?: number; // -1 to 1 for Ken Burns drift direction
  focusY?: number;
}

interface UseBackgroundSlideshowOptions {
  interval?: number;
  transitionDuration?: number;
  preloadCount?: number;
  enableOnMobile?: boolean;
  reduceQualityOnMobile?: boolean;
}

interface SlideshowState {
  currentIndex: number;
  nextIndex: number;
  isTransitioning: boolean;
  isPaused: boolean;
  transitionType: TransitionType;
  failedImages: Set<string>;
}

interface UseSlideshowReturn {
  currentImage: BackgroundImage;
  nextImage: BackgroundImage;
  isTransitioning: boolean;
  isPaused: boolean;
  transitionType: TransitionType;
  pause: () => void;
  play: () => void;
  goToNext: () => void;
  goToPrev: () => void;
}

// 10 unique transition effects
export type TransitionType = 
  | 'crossfade'
  | 'slideLeft'
  | 'slideRight'
  | 'slideUp'
  | 'slideDown'
  | 'zoomIn'
  | 'zoomOut'
  | 'blur'
  | 'flip'
  | 'swipe';

const TRANSITION_TYPES: TransitionType[] = [
  'crossfade',
  'slideLeft',
  'slideRight',
  'slideUp',
  'slideDown',
  'zoomIn',
  'zoomOut',
  'blur',
  'flip',
  'swipe',
];

interface SlideshowState {
  currentIndex: number;
  nextIndex: number;
  isTransitioning: boolean;
  isPaused: boolean;
  transitionType: TransitionType;
  failedImages: Set<string>;
}

interface UseSlideshowReturn {
  currentImage: BackgroundImage;
  nextImage: BackgroundImage;
  isTransitioning: boolean;
  isPaused: boolean;
  transitionType: TransitionType;
  pause: () => void;
  play: () => void;
  goToNext: () => void;
  goToPrev: () => void;
}

function getRandomTransition(): TransitionType {
  return TRANSITION_TYPES[Math.floor(Math.random() * TRANSITION_TYPES.length)];
}

export function useBackgroundSlideshow(
  images: BackgroundImage[],
  intervalMs = 60000, // Default to 60 seconds (1 minute)
  crossfadeDuration = 3000 // Default to 3 second crossfade
): UseSlideshowReturn {
  const [state, setState] = useState<SlideshowState>({
    currentIndex: 0,
    nextIndex: 1,
    isTransitioning: false,
    isPaused: false,
    transitionType: getRandomTransition(),
    failedImages: new Set(),
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preloadRef = useRef<HTMLImageElement | null>(null);

  // Filter out failed images
  const availableImages = images.filter(img => !state.failedImages.has(img.src));
  const effectiveImages = availableImages.length > 0 ? availableImages : images.slice(0, 12); // Fallback to first 12 (local)

  // Preload next image with error handling
  const preloadImage = useCallback((src: string) => {
    if (preloadRef.current) {
      preloadRef.current.src = '';
    }
    const img = new Image();
    img.onerror = () => {
      // Mark image as failed
      setState(prev => ({
        ...prev,
        failedImages: new Set([...prev.failedImages, src]),
      }));
    };
    img.src = src;
    preloadRef.current = img;
  }, []);

  // Advance to next image with random transition
  const advance = useCallback(() => {
    if (effectiveImages.length <= 1) return;

    // Pick a new random transition
    const newTransition = getRandomTransition();

    setState(prev => ({
      ...prev,
      isTransitioning: true,
      transitionType: newTransition,
    }));

    // After crossfade completes, update indices
    setTimeout(() => {
      setState(prev => {
        const newCurrentIndex = prev.nextIndex;
        const newNextIndex = (newCurrentIndex + 1) % effectiveImages.length;
        
        // Preload the image after the next one
        const preloadIndex = (newNextIndex + 1) % effectiveImages.length;
        preloadImage(effectiveImages[preloadIndex].src);

        return {
          ...prev,
          currentIndex: newCurrentIndex,
          nextIndex: newNextIndex,
          isTransitioning: false,
        };
      });
    }, crossfadeDuration);
  }, [effectiveImages, crossfadeDuration, preloadImage]);

  // Auto-advance timer
  useEffect(() => {
    if (state.isPaused || effectiveImages.length <= 1) return;

    timerRef.current = setTimeout(advance, intervalMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.currentIndex, state.isPaused, intervalMs, advance, effectiveImages.length]);

  // Preload next image on mount
  useEffect(() => {
    if (effectiveImages.length > 1) {
      preloadImage(effectiveImages[1].src);
    }
  }, [effectiveImages, preloadImage]);

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
    const newTransition = getRandomTransition();
    setState(prev => {
      const newCurrentIndex = (prev.currentIndex - 1 + effectiveImages.length) % effectiveImages.length;
      const newNextIndex = prev.currentIndex;
      return {
        ...prev,
        currentIndex: newCurrentIndex,
        nextIndex: newNextIndex,
        isTransitioning: false,
        transitionType: newTransition,
      };
    });
  }, [effectiveImages.length]);

  // Safe index access
  const safeCurrentIndex = state.currentIndex % effectiveImages.length;
  const safeNextIndex = state.nextIndex % effectiveImages.length;

  return {
    currentImage: effectiveImages[safeCurrentIndex] || effectiveImages[0],
    nextImage: effectiveImages[safeNextIndex] || effectiveImages[0],
    isTransitioning: state.isTransitioning,
    isPaused: state.isPaused,
    transitionType: state.transitionType,
    pause,
    play,
    goToNext,
    goToPrev,
  };
}
