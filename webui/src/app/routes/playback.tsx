import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";
import { paths } from "@/config/paths.ts";
import { requestServe } from "@/services/media/serve.ts";
import ReactPlayer from "react-player";

export const Playback = () => {
  const navigate = useNavigate();
  const path = useParams();
  const playbackId = path.playbackId;

  useEffect(() => {
    if (
      playbackId === undefined ||
      playbackId.length === 0 ||
      !playbackId.match(/^(?:[A-Za-z0-9_-]{21})?$/)
    ) {
      navigate(paths.root.notFound.getHref());
    } else {
      (async () => await requestServe({ id: playbackId }))();
    }
  }, []);

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

  return (
    <div className="w-screen h-screen flex justify-center bg-black">
      <ReactPlayer
        style={{
          width: undefined,
          height: "100%",
        }}
        {...initialState}
      />
    </div>
  );
};
