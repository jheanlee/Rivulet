import { initHls } from "@/services/media/serve.ts";
import { useEffect, useState } from "react";
import type Hls from "hls.js";

interface UseHlsProps {
  id: string;
  token: string | null;
  element: HTMLVideoElement | null;
  setIsPlaying: (arg0: boolean) => void;
  onAutoplayFailed: () => void;
}
export const useHls = ({
  id,
  token,
  element,
  setIsPlaying,
  onAutoplayFailed,
}: UseHlsProps) => {
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [hasInit, setHasInit] = useState<boolean>(false);

  useEffect(() => {
    if (hasInit || element === null || token === null) return;
    let shouldInit = true;
    const init = async () => {
      return initHls({
        id,
        token,
        element,
        setIsPlaying,
        onAutoplayFailed,
      });
    };

    (async () => {
      if (shouldInit) {
        setHlsInstance((await init()).hls);
        setHasInit(true);
        element.currentTime = 0;
        element.volume = 0.8;
      }
    })();

    return () => {
      shouldInit = false;
    };
  }, [element, hasInit, id, onAutoplayFailed, setIsPlaying, token]);

  return { hlsInstance };
};
