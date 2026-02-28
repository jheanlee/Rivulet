import { fetcher } from "@/services/fetcher.ts";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { paths } from "@/config/paths.ts";

export interface MusicListItem {
  type: "music";
  id: string;
  title: string;
  artists: string[];
  album: string;
}

export interface VideoListItem {
  type: "video";
  id: string;
  title: string;
  creator: string;
}

export interface MovieListItem {
  type: "movie";
  id: string;
  title: string;
  year: number | null;
}

interface GetMediaDataProps {
  mediaType: "music" | "video" | "movie";
}

export const getMediaData = async ({ mediaType }: GetMediaDataProps) => {
  let res: MusicListItem[] | VideoListItem[] | MovieListItem[] | number = 500;
  switch (mediaType) {
    case "music": {
      res = await listMusicMedia();
      break;
    }
    case "video": {
      res = await listVideoMedia();
      break;
    }
    case "movie": {
      res = await listMovieMedia();
      break;
    }
  }

  if (typeof res === "number") {
    switch (res) {
      case 401:
        toast.error("Session expired. Please log in again");
        window.location.href = paths.root.login.getHref();
        break;
      case 500:
        toast.error("Unable to connect to the server");
        break;
      default:
        toast.error(`An error has occurred. Error code: ${res}`);
    }
    return undefined;
  } else {
    return res;
  }
};

const listMusicMedia = async () => {
  try {
    const res =
      await fetcher.get<Omit<MusicListItem, "type">[]>("/api/media/music");
    return res.data.map(
      (data) =>
        ({
          ...data,
          type: "music",
        }) as MusicListItem,
    );
  } catch (error) {
    if (isAxiosError(error)) {
      return error.status ?? 500;
    } else {
      return 500;
    }
  }
};

const listVideoMedia = async () => {
  try {
    const res =
      await fetcher.get<Omit<VideoListItem, "type">[]>("/api/media/video");
    return res.data.map(
      (data) =>
        ({
          ...data,
          type: "video",
        }) as VideoListItem,
    );
  } catch (error) {
    if (isAxiosError(error)) {
      return error.status ?? 500;
    } else {
      return 500;
    }
  }
};

const listMovieMedia = async () => {
  try {
    const res =
      await fetcher.get<Omit<MovieListItem, "type">[]>("/api/media/movie");
    return res.data.map(
      (data) =>
        ({
          ...data,
          type: "movie",
        }) as MovieListItem,
    );
  } catch (error) {
    if (isAxiosError(error)) {
      return error.status ?? 500;
    } else {
      return 500;
    }
  }
};
