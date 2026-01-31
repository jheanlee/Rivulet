import { useEffect, useState } from "react";
import { initHls, requestServe } from "@/services/media/serve.ts";
import { paths } from "@/config/paths.ts";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button.tsx";
import { Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Slider } from "@/components/ui/slider.tsx";

interface HlsPlayerProps {
  playbackId: string;
}

export const HlsPlayer = ({ playbackId }: HlsPlayerProps) => {
  const navigate = useNavigate();
  const [playerRef, setPlayerRef] = useState<HTMLVideoElement | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showPlayButton, setShowPlayButton] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);

  useEffect(() => {
    const prePlaybackHandling = async () => {
      const res = await requestServe({ id: playbackId });
      if (typeof res === "number") {
        switch (res) {
          case 401: {
            toast.error("Session expired");
            navigate(paths.root.login.getHref());
            break;
          }
          case 403: {
            toast.error("Access denied");
            break;
          }
          case 404: {
            navigate(paths.root.notFound.getHref());
            break;
          }
          case 500: {
            toast.error("Unable to connect to server");
            break;
          }
          default: {
            toast.error(`An error has occurred. Error code: ${res}`);
          }
        }
      } else {
        if (playerRef !== null) {
          await initHls({
            id: playbackId,
            token: res,
            element: playerRef,
            setIsPlaying: setIsPlaying,
            onAutoplayFailed: () => setShowPlayButton(true),
          });
        }
      }
    };

    void (async () => await prePlaybackHandling())();
  }, [playerRef]);

  useEffect(() => {
    if (playerRef !== null) {
      playerRef.volume = volume / 100;
    }
  }, [volume]);

  return (
    <div
      ref={setContainerRef}
      className="h-full w-full flex content-center justify-center"
    >
      <video
        ref={setPlayerRef}
        className={(() => {
          if (playerRef !== null && containerRef !== null) {
            if (
              playerRef.videoHeight / playerRef.videoWidth <
              containerRef.clientHeight / containerRef.clientWidth
            ) {
              return "w-full h-auto";
            }
            return "w-auto h-full";
          } else {
            return "";
          }
        })()}
      />
      {!showPlayButton && (
        <div className="fixed bottom-2 w-screen p-4">
          <Button
            variant="ghost"
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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" onClick={() => {}}>
                {(() => {
                  if (volume == 0) return <VolumeX />;
                  else if (volume < 40) return <Volume1 />;
                  else return <Volume2 />;
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-10 bg-transparent border-0 shadow-none">
              <Slider
                orientation="vertical"
                value={[volume]}
                max={100}
                min={0}
                step={1}
                onValueChange={(value) => setVolume(value[0])}
              />
            </PopoverContent>
          </Popover>
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
