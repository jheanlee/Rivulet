import { useNavigate, useParams } from "react-router";
import { useEffect, useRef } from "react";
import { paths } from "@/config/paths.ts";
import { playHls, requestServe } from "@/services/media/serve.ts";

export const Playback = () => {
  const navigate = useNavigate();
  const path = useParams();
  let playbackId = path.playbackId;

  const element = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (
      playbackId === undefined ||
      playbackId.length === 0 ||
      !playbackId.match(/^(?:[A-Za-z0-9_-]{21})?$/)
    ) {
      navigate(paths.root.notFound.getHref());
    } else if (element.current !== null) {
      (async () => await requestServe({ id: playbackId }))();
      playHls({ id: playbackId, element: element.current });
    }
  }, []);

  return <video ref={element} className="w-full h-full" />;
};
