import { fetcher } from "@/services/fetcher.ts";
import { isAxiosError } from "axios";
import type { musicSchema } from "@/components/forms/media_upload/music.tsx";
import { z } from "zod";
import type { videoSchema } from "@/components/forms/media_upload/video.tsx";
import type { movieSchema } from "@/components/forms/media_upload/movie.tsx";
import { useUpdateStore } from "@/store/upload.ts";
import { toast } from "sonner";

interface UploadFileProps {
  upload_id: string;
  file: Blob;
  toastId: number | string;
}

const upload_file = async ({ upload_id, file, toastId }: UploadFileProps) => {
  const chunk_size = 20 * 1024 * 1024;

  for (
    let chunk_id = 0, chunk_start = 0;
    chunk_start < file.size;
    chunk_id++, chunk_start += chunk_size
  ) {
    toast(`Uploading...(${((chunk_start / file.size) * 100).toFixed(1)}%)`, {
      id: toastId,
    });
    if (chunk_start + chunk_size >= file.size) {
      toast("Processing...", {
        id: toastId,
      });
    }

    const chuck = file.slice(chunk_start, chunk_start + chunk_size);
    const form = new FormData();
    form.append("upload_id", upload_id);
    form.append("chunk_id", chunk_id.toString());
    form.append("data", chuck);
    form.append(
      "end_of_file",
      (chunk_start + chunk_size >= file.size).toString(),
    );

    await fetcher.post("/api/media/upload", form);
  }
};

interface UploadMediaProps {
  upload:
    | { type: "movie"; data: z.infer<typeof movieSchema> }
    | { type: "video"; data: z.infer<typeof videoSchema> }
    | { type: "music"; data: z.infer<typeof musicSchema> };
}

export const uploadMedia = async ({ upload }: UploadMediaProps) => {
  if (upload.data.file === undefined) return 400;

  const toastId = toast.loading("Uploading metadata...");

  try {
    useUpdateStore.setState({ uploadActive: true });

    switch (upload.type) {
      case "music": {
        const meta_res = await fetcher.post<{ id: string }>(
          "/api/media/upload/metadata",
          {
            title: upload.data.title,
            artists:
              upload.data.artists.length === 0
                ? []
                : upload.data.artists.split(","),
            genres:
              upload.data.genres.length === 0
                ? []
                : upload.data.genres.split(","),
            language: upload.data.language,
            region: upload.data.region,
            album: upload.data.album,
            disk_number: upload.data.disk_number,
            track_number: upload.data.track_number,
            release_date:
              upload.data.release_date_year === undefined ||
              upload.data.release_date_month === undefined ||
              upload.data.release_date_day === undefined
                ? null
                : new Date(
                    `${upload.data.release_date_year}-${upload.data.release_date_month}-${upload.data.release_date_day}`,
                  ).toISOString(),
            year: upload.data.year,
            description: upload.data.description,
            video_id: upload.data.video_id,
            file_ext: upload.data.filename?.split(".").pop(),
          },
          {
            params: {
              media_type: "music",
            },
          },
        );

        const upload_id = meta_res.data.id;
        await upload_file({
          upload_id: upload_id,
          file: upload.data.file,
          toastId: toastId,
        });
        break;
      }
      case "video": {
        const meta_res = await fetcher.post<{ id: string }>(
          "/api/media/upload/metadata",
          {
            title: upload.data.title,
            creator: upload.data.creator,
            categories:
              upload.data.categories.length === 0
                ? []
                : upload.data.categories.split(","),
            language: upload.data.language,
            region: upload.data.region,
            description: upload.data.description,
            file_ext: upload.data.filename?.split(".").pop(),
          },
          {
            params: {
              media_type: "video",
            },
          },
        );

        const upload_id = meta_res.data.id;
        await upload_file({
          upload_id: upload_id,
          file: upload.data.file,
          toastId: toastId,
        });
        break;
      }
      case "movie": {
        const meta_res = await fetcher.post<{ id: string }>(
          "/api/media/upload/metadata",
          {
            title: upload.data.title,
            director: upload.data.director,
            cast:
              upload.data.cast.length === 0 ? [] : upload.data.cast.split(","),
            genres:
              upload.data.genres.length === 0
                ? []
                : upload.data.genres.split(","),
            language: upload.data.language,
            region: upload.data.region,
            release_date:
              upload.data.release_date_year === undefined ||
              upload.data.release_date_month === undefined ||
              upload.data.release_date_day === undefined
                ? null
                : new Date(
                    `${upload.data.release_date_year}-${upload.data.release_date_month}-${upload.data.release_date_day}`,
                  ).toISOString(),
            year: upload.data.year,
            description: upload.data.description,
            file_ext: upload.data.filename?.split(".").pop(),
          },
          {
            params: {
              media_type: "movie",
            },
          },
        );

        const upload_id = meta_res.data.id;
        await upload_file({
          upload_id: upload_id,
          file: upload.data.file,
          toastId: toastId,
        });
        break;
      }
    }

    useUpdateStore.setState({ uploadActive: false });
    toast.success("Successfully uploaded media", { id: toastId });

    return 200;
  } catch (error) {
    useUpdateStore.setState({ uploadActive: false });
    if (isAxiosError(error)) {
      toast.error(
        () => {
          switch (error.status || 500) {
            case 400:
              return "Invalid upload";
            case 401:
              return "Session expired";
            case 403:
              return "Access denied";
            case 404:
              return "Upload id not found";
            case 500:
              return "Unable to upload to server";
            default:
              return `An error has occurred. Error code: ${error.status || 500}`;
          }
        },
        { id: toastId },
      );
      return error.status || 500;
    } else {
      toast.error("Unable to upload to server", { id: toastId });
      return 500;
    }
  }
};
