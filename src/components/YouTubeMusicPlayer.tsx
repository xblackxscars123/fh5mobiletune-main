import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Rewind, FastForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

// YouTube video ID and start time from the URL
const VIDEO_ID = 'bbi-XzO8PnU';
const START_TIME = 8328; // seconds

// TypeScript declarations for YouTube IFrame API
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
}

interface YTPlayerState {
  ENDED: number;
  PLAYING: number;
  PAUSED: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: unknown) => YTPlayer;
      PlayerState: YTPlayerState;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubeMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initPlayer = () => {
      if (playerRef.current) return;
      
      playerRef.current = new window.YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: VIDEO_ID, // Required for looping
          start: START_TIME,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              // Loop back to start time
              playerRef.current?.seekTo(START_TIME, true);
              playerRef.current?.playVideo();
            }
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!playerRef.current || !playerReady) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current || !playerReady) return;
    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  const rewind = () => {
    if (!playerRef.current || !playerReady) return;
    const currentTime = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(START_TIME, currentTime - 30), true);
  };

  const fastForward = () => {
    if (!playerRef.current || !playerReady) return;
    const currentTime = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(currentTime + 30, true);
  };

  return (
    <>
      {/* Hidden YouTube player - positioned off-screen for audio only */}
      <div 
        id="yt-player" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          pointerEvents: 'none'
        }} 
      />
      
      {/* Floating music controls */}
      <div className="fixed bottom-4 left-4 z-50 bg-[hsl(220,18%,8%)/0.95] backdrop-blur-md border border-[hsl(220,15%,25%)] rounded-full px-2 py-1.5 flex items-center gap-1 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={rewind}
          disabled={!playerReady}
          className="h-8 w-8 rounded-full hover:bg-[hsl(220,15%,20%)] disabled:opacity-50"
          title="Rewind 30s"
        >
          <Rewind className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          disabled={!playerReady}
          className="h-10 w-10 rounded-full bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)] text-black disabled:opacity-50"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={fastForward}
          disabled={!playerReady}
          className="h-8 w-8 rounded-full hover:bg-[hsl(220,15%,20%)] disabled:opacity-50"
          title="Fast forward 30s"
        >
          <FastForward className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-[hsl(220,15%,25%)] mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          disabled={!playerReady}
          className="h-8 w-8 rounded-full hover:bg-[hsl(220,15%,20%)] disabled:opacity-50"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
      </div>
    </>
  );
}

