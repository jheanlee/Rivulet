import type {
  MovieListItem,
  MusicListItem,
  VideoListItem,
} from "@/services/media/list.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Ellipsis, Info } from "lucide-react";

interface MediaListProps {
  type: "music" | "video" | "movie";
  items: MusicListItem[] | VideoListItem[] | MovieListItem[];
}
export const MediaList = ({ type, items }: MediaListProps) => {
  //  TODO link and action
  return (
    <Table className="w-full">
      <TableHeader>
        {(() => {
          switch (type) {
            case "music":
              return (
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Artists</TableHead>
                  <TableHead>Album</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              );
            case "video":
              return (
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              );
            case "movie":
              return (
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              );
          }
        })()}
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          switch (item.type) {
            case "music":
              return (
                <TableRow key={item.id} className="w-full">
                  <TableCell>
                    <p className="max-w-sm md:max-w-md lg:max-w-lg overflow-hidden text-ellipsis">
                      {item.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-sm md:max-w-md lg:max-w-lg overflow-hidden text-ellipsis">
                      {item.artists.join(",")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-sm md:max-w-md lg:max-w-lg overflow-hidden text-ellipsis">
                      {item.album}
                    </p>
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <div className="flex flex-row gap-2">
                      <Button variant="ghost">
                        <Info />
                      </Button>
                      <Button variant="ghost">
                        <Ellipsis />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            case "video":
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="max-w-sm md:max-w-md lg:max-w-lg overflow-hidden overflow-ellipsis">
                      {item.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-sm md:max-w-md lg:max-w-lg overflow-hidden text-ellipsis">
                      {item.creator}
                    </p>
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <div className="flex flex-row gap-2">
                      <Button variant="ghost">
                        <Info />
                      </Button>
                      <Button variant="ghost">
                        <Ellipsis />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            case "movie":
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="max-w-sm md:max-w-md lg:max-w-lg overflow-hidden text-ellipsis">
                      {item.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-sm md:max-w-md lg:max-w-lg overflow-hidden text-ellipsis">
                      {item.year ?? ""}
                    </p>
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <div className="flex flex-row gap-2">
                      <Button variant="ghost">
                        <Info />
                      </Button>
                      <Button variant="ghost">
                        <Ellipsis />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
          }
        })}
      </TableBody>
    </Table>
  );
};
