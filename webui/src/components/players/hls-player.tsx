import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button.tsx";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Slider } from "@/components/ui/slider.tsx";
import { useHls } from "@/services/media/use-hls.tsx";
import { usePrePlaybackHandling } from "@/services/media/use-pre-playback-handling.tsx";

interface HlsPlayerProps {
  playbackId: string;
}

export const HlsPlayer = ({ playbackId }: HlsPlayerProps) => {
  const navigate = useNavigate();
  const [playerRef, setPlayerRef] = useState<HTMLVideoElement | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showPlayButton, setShowPlayButton] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isIosPlayer, setIsIosPlayer] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [showVolume, setShowVolume] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    document.fullscreenElement !== null,
  );
  const mouseTimer = useRef<number | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const token = usePrePlaybackHandling({ id: playbackId }).token;

  const hlsInstance = useHls({
    id: playbackId,
    token: token,
    element: playerRef,
    setIsPlaying: setIsPlaying,
    onAutoplayFailed: () => setShowPlayButton(true),
  });

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = seconds.toString().padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    } else {
      return `${paddedMinutes}:${paddedSeconds}`;
    }
  };

  useEffect(() => {
    const updateIsFullscreen = () =>
      setIsFullscreen(document.fullscreenElement !== null);

    document.addEventListener("fullscreenchange", updateIsFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", updateIsFullscreen);
    };
  }, []);

  useEffect(() => {
    const onWebkitenterfullscreen = () => {
      setIsIosPlayer(true);
    };
    const onWebkitendfullscreen = () => {
      hlsInstance.hlsInstance?.stopLoad();
      hlsInstance.hlsInstance?.detachMedia();
      hlsInstance.hlsInstance?.destroy();

      if (playerRef) {
        playerRef.pause();
        playerRef.removeAttribute("src");
        playerRef.load();
      }

      navigate(-1);
    };

    playerRef?.addEventListener(
      "webkitenterfullscreen",
      onWebkitenterfullscreen,
    );
    playerRef?.addEventListener("webkitendfullscreen", onWebkitendfullscreen);

    return () => {
      playerRef?.removeEventListener(
        "webkitenterfullscreen",
        onWebkitenterfullscreen,
      );
      playerRef?.removeEventListener(
        "webkitendfullscreen",
        onWebkitendfullscreen,
      );

      if (hlsInstance.hlsInstance) {
        hlsInstance.hlsInstance.destroy();
      }
    };
  }, [hlsInstance.hlsInstance, navigate, playerRef]);

  return (
    <div
      ref={setContainerRef}
      className="h-full w-full flex content-center justify-center"
      onMouseMove={() => {
        if (mouseTimer.current) {
          clearTimeout(mouseTimer.current);
          setShowControls(true);
        }
        mouseTimer.current = window.setTimeout(() => {
          setShowControls(false);
          mouseTimer.current = null;
        }, 3000);
      }}
      onMouseLeave={() => {
        if (mouseTimer.current) {
          clearTimeout(mouseTimer.current);
        }
        mouseTimer.current = null;
        setShowControls(false);
      }}
    >
      <video
        ref={setPlayerRef}
        disablePictureInPicture
        onTimeUpdate={(event) => {
          setVideoDuration(event.currentTarget.duration);
          setVideoCurrentTime(event.currentTarget.currentTime);
        }}
        onEnded={() => {
          setIsPlaying(false);
        }}
        className="w-full h-full object-contain bg-black"
      />
      {!showPlayButton && showControls && !isIosPlayer && (
        <div className="fixed bottom-2 z-50 w-screen flex flex-col gap-2 p-4 pointer-events-none">
          <div className="w-full flex flex-row gap-2 px-1">
            <p className="text-sm whitespace-nowrap">{`${formatTime(videoCurrentTime)} / ${formatTime(videoDuration)}`}</p>
            <Slider
              className="pointer-events-auto"
              value={[videoCurrentTime]}
              max={videoDuration}
              min={0}
              step={1}
              onValueChange={(value) => {
                if (mouseTimer.current) {
                  clearTimeout(mouseTimer.current);
                  setShowControls(true);
                }
                mouseTimer.current = window.setTimeout(() => {
                  setShowControls(false);
                  mouseTimer.current = null;
                }, 3000);

                setVideoCurrentTime(value[0]);
                if (playerRef !== null) {
                  playerRef.currentTime = value[0];
                }
              }}
            />
          </div>
          <div className="w-full flex flex-row justify-between">
            <div className="flex flex-row">
              <Button
                variant="ghost"
                className="pointer-events-auto"
                onClick={() => {
                  if (playerRef?.paused) {
                    playerRef?.play();
                  } else {
                    playerRef?.pause();
                  }
                  setIsPlaying(!playerRef?.paused);
                }}
              >
                {isPlaying ? <Pause /> : <Play />}
              </Button>

              <Button
                variant="ghost"
                className="pointer-events-auto hover:bg-transparent!"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                {(() => {
                  if (volume == 0) return <VolumeX />;
                  else if (volume < 40) return <Volume1 />;
                  else return <Volume2 />;
                })()}
              </Button>
              {showVolume && (
                <Slider
                  className="pointer-events-auto w-18 [&>span:first-child]:h-[4px]"
                  onMouseEnter={() => setShowVolume(true)}
                  onMouseLeave={() => setShowVolume(false)}
                  value={[volume]}
                  max={100}
                  min={0}
                  step={1}
                  onValueChange={(value) => {
                    if (mouseTimer.current) {
                      clearTimeout(mouseTimer.current);
                      setShowControls(true);
                    }
                    mouseTimer.current = window.setTimeout(() => {
                      setShowControls(false);
                      mouseTimer.current = null;
                    }, 3000);

                    setVolume(value[0]);
                    if (playerRef !== null) {
                      playerRef.volume = value[0] / 100;
                    }
                  }}
                />
              )}
            </div>

            <Button
              variant="ghost"
              className="pointer-events-auto"
              onClick={() => {
                const setFullscreen = async () => {
                  if (document.fullscreenElement) {
                    await document.exitFullscreen();
                  } else {
                    await containerRef?.requestFullscreen();
                  }
                };

                void (async () => await setFullscreen())();
              }}
            >
              {isFullscreen ? <Minimize /> : <Maximize />}
            </Button>
          </div>
        </div>
      )}
      {showPlayButton && (
        <div className="fixed top-1/2 right-1/2 z-999">
          <Button
            variant="outline"
            onClick={() => {
              playerRef?.play();
              setShowPlayButton(false);
              setIsPlaying(!playerRef?.paused);
            }}
          >
            <Play />
          </Button>
        </div>
      )}
    </div>
  );
};
