import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LayoutGrid, List, Upload } from "lucide-react";
import { UploadMusicForm } from "@/components/forms/media-upload/music.tsx";
import UploadVideoForm from "@/components/forms/media-upload/video.tsx";
import { useEffect, useState } from "react";
import { UploadMovieForm } from "@/components/forms/media-upload/movie.tsx";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useParams } from "react-router";
import { NotFound } from "@/app/routes/not-found.tsx";
import { ButtonGroup } from "@/components/ui/button-group.tsx";
import {
  getMediaData,
  type MovieListItem,
  type MusicListItem,
  type VideoListItem,
} from "@/services/media/list.ts";

export const MediaWrapper = () => {
  const path = useParams();
  switch (path.mediaType) {
    case "music":
      return Media({ mediaType: "music" });
    case "movies":
      return Media({ mediaType: "movies" });
    case "videos":
      return Media({ mediaType: "videos" });
    default:
      return NotFound();
  }
};

export interface MediaProp {
  mediaType: "music" | "movies" | "videos";
}

export const Media = ({ mediaType }: MediaProp) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [listView, setlistView] = useState<boolean>(true);
  const [mediaItems, setMediaItems] = useState<
    MusicListItem[] | VideoListItem[] | MovieListItem[] | undefined
  >(undefined);

  useEffect(() => {
    const fetchData = async () => {
      switch (mediaType) {
        case "music": {
          setMediaItems(await getMediaData({ mediaType: "music" }));
          break;
        }
        case "videos": {
          setMediaItems(await getMediaData({ mediaType: "video" }));
          break;
        }
        case "movies": {
          setMediaItems(await getMediaData({ mediaType: "movie" }));
          break;
        }
      }
    };
    (async () => await fetchData())();
  }, []);

  return (
    <div className="flex flex-col px-12 py-4">
      <div className="flex flex-row w-full justify-between">
        <h2 className={"text-2xl font-semibold text-transform: capitalize"}>
          {mediaType}
        </h2>
        <div className="flex gap-3">
          <ButtonGroup>
            <Button
              variant={listView ? "secondary" : "outline"}
              onClick={() => {
                setlistView(true);
              }}
            >
              <List />
            </Button>
            <Button
              variant={!listView ? "secondary" : "outline"}
              onClick={() => {
                setlistView(false);
              }}
            >
              <LayoutGrid />
            </Button>
          </ButtonGroup>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload /> upload
              </Button>
            </DialogTrigger>
            <VisuallyHidden asChild>
              <DialogTitle>Upload Media</DialogTitle>
            </VisuallyHidden>
            <DialogContent className="h-3/4 overflow-y-scroll">
              {mediaType == "music" && (
                <UploadMusicForm onExit={() => setUploadDialogOpen(false)} />
              )}
              {mediaType == "videos" && (
                <UploadVideoForm onExit={() => setUploadDialogOpen(false)} />
              )}
              {mediaType == "movies" && (
                <UploadMovieForm onExit={() => setUploadDialogOpen(false)} />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col m-4"></div>
    </div>
  );
};
