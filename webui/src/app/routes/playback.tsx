import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";
import { paths } from "@/config/paths.ts";
import { HlsPlayer } from "@/components/players/hls-player.tsx";

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
    }
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center bg-black">
      <HlsPlayer playbackId={playbackId ?? ""} />
    </div>
  );
};
