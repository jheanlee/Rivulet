import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { UploadMusicForm } from "@/components/forms/media_upload/music.tsx";
import UploadVideoForm from "@/components/forms/media_upload/video.tsx";
import { useState } from "react";
import { UploadMovieForm } from "@/components/forms/media_upload/movie.tsx";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useParams } from "react-router";
import { NotFound } from "@/app/routes/not-found.tsx";

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

  return (
    <div className="flex px-12 py-4">
      <div className="flex flex-row w-full justify-between">
        <h2 className={"text-2xl font-semibold text-transform: capitalize"}>
          {mediaType}
        </h2>
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
  );
};
