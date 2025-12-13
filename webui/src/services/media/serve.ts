import { fetcher } from "@/services/fetcher.ts";
import Hls from "hls.js";
import { isAxiosError } from "axios";

interface RequestServeProps {
  id: string;
}
export const requestServe = async ({ id }: RequestServeProps) => {
  try {
    return await fetcher.post<{
      playback_token: string;
    }>(`/api/media/${id}/serve`);
  } catch (error) {
    if (isAxiosError(error)) {
      return error.status || 500;
    }
    return 500;
  }
};

interface PlayHlsProps {
  id: string;
  element: HTMLVideoElement;
}
export const playHls = ({ id, element }: PlayHlsProps) => {
  if (Hls.isSupported()) {
    let hls = new Hls({
      xhrSetup: (xhr) => {
        xhr.setRequestHeader("Authorization", "");
      },
    });
    hls.loadSource(`/api/media/stream/${id}/stream.m3u8`);
    hls.attachMedia(element);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      element.play();
    });
  } else if (element.canPlayType("application/vnd.apple.mpegurl")) {
    element.src = `/api/media/stream/${id}/stream.m3u8`;
    element.addEventListener("canplay", function () {
      element.play();
    });
  }
};
