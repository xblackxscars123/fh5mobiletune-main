import { useEffect, useRef, useState } from "react";
import { Play, Pause, Rewind, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";

// YouTube video ID and start time from the URL
const VIDEO_ID = "bbi-XzO8PnU";
const START_TIME = 8328; // seconds

// --- YouTube IFrame API typings (minimal) ---
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
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
      Player: new (element: string | HTMLElement, options: any) => YTPlayer;
      PlayerState: YTPlayerState;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function ensureYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    // Ensure script exists (use appendChild to avoid DOM insertBefore edge-cases)
    const existing = document.getElementById("youtube-iframe-api");
    if (!existing) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };

    // If it loaded between our first check and callback assignment
    if (window.YT?.Player) resolve();
  });

  return youtubeApiPromise;
}

export function YouTubeMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<YTPlayer | null>(null);
  const hostElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await ensureYouTubeIframeApi();
      if (cancelled) return;
      if (playerRef.current) return;

      // Create an off-screen host element OUTSIDE React's tree.
      // This prevents YouTube from replacing/mutating React-owned DOM nodes,
      // which can trigger React's "insertBefore" NotFoundError.
      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.left = "-9999px";
      host.style.top = "-9999px";
      host.style.width = "1px";
      host.style.height = "1px";
      host.style.overflow = "hidden";
      host.style.pointerEvents = "none";
      document.body.appendChild(host);
      hostElRef.current = host;

      playerRef.current = new window.YT.Player(host, {
        height: "1",
        width: "1",
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: VIDEO_ID, // required for looping
          start: START_TIME,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            setPlayerReady(true);
            playerRef.current?.seekTo(START_TIME, true);
            playerRef.current?.playVideo();
          },
          onStateChange: (event: { data: number }) => {
            if (cancelled) return;
            if (event.data === window.YT.PlayerState.ENDED) {
              playerRef.current?.seekTo(START_TIME, true);
              playerRef.current?.playVideo();
            }
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    init();

    return () => {
      cancelled = true;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      if (hostElRef.current) {
        hostElRef.current.remove();
        hostElRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!playerRef.current || !playerReady) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
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
      {/* Floating audio controls (no video UI) */}
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
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
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
      </div>
    </>
  );
}


