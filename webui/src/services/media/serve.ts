import { fetcher } from "@/services/fetcher.ts";
import Hls from "hls.js";
import { isAxiosError } from "axios";

interface RequestServeProps {
  id: string;
}
export const requestServe = async ({ id }: RequestServeProps) => {
  try {
    const res = await fetcher.post<{
      playback_token: string;
    }>(`/api/media/${id}/serve`);
    return res.data.playback_token;
  } catch (error) {
    if (isAxiosError(error)) {
      return error.status || 500;
    }
    return 500;
  }
};

interface PlayHlsProps {
  id: string;
  token: string;
  element: HTMLVideoElement;
  setIsPlaying: (arg0: boolean) => void;
  onAutoplayFailed: () => void;
}
export const initHls = async ({
  id,
  token,
  element,
  setIsPlaying,
  onAutoplayFailed,
}: PlayHlsProps) => {
  if (Hls.isSupported()) {
    const hls = new Hls({
      xhrSetup: (xhr) => {
        xhr.setRequestHeader("Authorization", token);
      },
    });
    hls.loadSource(`/api/media/stream/${id}/stream.m3u8`);
    hls.attachMedia(element);
    hls.on(Hls.Events.MANIFEST_PARSED, async () => {
      try {
        await element.play();
        setIsPlaying(!element.paused);
      } catch {
        onAutoplayFailed();
      }
    });
    return { hls: hls };
  } else if (element.canPlayType("application/vnd.apple.mpegurl")) {
    element.src = `/api/media/stream/${id}/stream.m3u8`;
    element.addEventListener("canplay", async () => {
      try {
        await element.play();
        setIsPlaying(!element.paused);
      } catch {
        onAutoplayFailed();
      }
    });
    return { hls: null };
  } else {
    return { hls: null };
  }
};
