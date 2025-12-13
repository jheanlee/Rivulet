import { useNavigate, useParams } from "react-router";
import { useEffect, useRef } from "react";
import { paths } from "@/config/paths.ts";
import { requestServe } from "@/services/media/serve.ts";
import ReactPlayer from "react-player";
import { toast } from "sonner";

export const Playback = () => {
  const navigate = useNavigate();
  const path = useParams();
  const playbackId = path.playbackId;
  const playerRef = useRef<HTMLVideoElement | null>(null);

  const config = {
    hls: {
      xhrSetup: async (xhr: XMLHttpRequest, url: string) => {
        //  TODO waiting for react-player to fix this
        console.log("abc");
        if (playbackId === undefined) return;

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
          xhr.setRequestHeader("Authorization", res.data.playback_token);
        }
      },
    },
  };

  const initialState = {
    src:
      playbackId === undefined
        ? undefined
        : `/api/media/stream/${playbackId}/stream.m3u8`,
    pip: false,
    playing: false,
    controls: true,
    light: false,
    volume: undefined,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false,
    seeking: false,
    loadedSeconds: 0,
    playedSeconds: 0,
  };

  useEffect(() => {
    if (
      playbackId === undefined ||
      playbackId.length === 0 ||
      !playbackId.match(/^(?:[A-Za-z0-9_-]{21})?$/)
    ) {
      navigate(paths.root.notFound.getHref());
    }
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center bg-black">
      <ReactPlayer
        ref={playerRef}
        style={{
          width: undefined,
          height: "100%",
        }}
        config={config}
        {...initialState}
      />
    </div>
  );
};
