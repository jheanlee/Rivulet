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
import { NavLink, useNavigate } from "react-router";
import { paths } from "@/config/paths.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { deleteItem } from "@/services/media/item-actions.ts";

interface MediaListProps {
  type: "music" | "video" | "movie";
  items: MusicListItem[] | VideoListItem[] | MovieListItem[];
  updateTrigger: () => void;
}
export const MediaList = ({ type, items, updateTrigger }: MediaListProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <Table className="w-full min-w-[600px] table-fixed">
        <TableHeader>
          {(() => {
            switch (type) {
              case "music":
                return (
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead className="w-[25%]">Artists</TableHead>
                    <TableHead className="w-[25%]">Album</TableHead>
                    <TableHead className="w-[15%] text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                );
              case "video":
                return (
                  <TableRow>
                    <TableHead className="w-[42.5%]">Title</TableHead>
                    <TableHead className="w-[42.5%]">Creator</TableHead>
                    <TableHead className="w-[15%] text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                );
              case "movie":
                return (
                  <TableRow>
                    <TableHead className="w-[50%]">Title</TableHead>
                    <TableHead className="w-[35%]">Year</TableHead>
                    <TableHead className="w-[15%] text-center">
                      Actions
                    </TableHead>
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
                    <TableCell
                      onClick={() => navigate(paths.playback.getHref(item.id))}
                    >
                      <NavLink
                        to={paths.playback.getHref(item.id)}
                        className="block overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {item.title}
                      </NavLink>
                    </TableCell>
                    <TableCell>
                      <p className="overflow-hidden text-ellipsis">
                        {item.artists.join(",")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="overflow-hidden text-ellipsis">
                        {item.album}
                      </p>
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <div className="flex flex-row gap-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            navigate(paths.root.mediaInfo.getHref(item.id))
                          }
                        >
                          <Info />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {/* TODO hide if not admin */}
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Admin actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={async () => {
                                  await deleteItem({ media_id: item.id });
                                  updateTrigger();
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              case "video":
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <NavLink
                        to={paths.playback.getHref(item.id)}
                        className="block overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {item.title}
                      </NavLink>
                    </TableCell>
                    <TableCell>
                      <p className="overflow-hidden text-ellipsis">
                        {item.creator}
                      </p>
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <div className="flex flex-row gap-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            navigate(paths.root.mediaInfo.getHref(item.id))
                          }
                        >
                          <Info />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {/* TODO hide if not admin */}
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Admin actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={async () => {
                                  await deleteItem({ media_id: item.id });
                                  updateTrigger();
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              case "movie":
                return (
                  <TableRow key={item.id}>
                    <TableCell
                      onClick={() => navigate(paths.playback.getHref(item.id))}
                    >
                      <NavLink
                        to={paths.playback.getHref(item.id)}
                        className="block overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {item.title}
                      </NavLink>
                    </TableCell>
                    <TableCell>
                      <p className="overflow-hidden text-ellipsis">
                        {item.year ?? ""}
                      </p>
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <div className="flex flex-row gap-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            navigate(paths.root.mediaInfo.getHref(item.id))
                          }
                        >
                          <Info />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {/* TODO hide if not admin */}
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Admin actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={async () => {
                                  await deleteItem({ media_id: item.id });
                                  updateTrigger();
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
            }
          })}
        </TableBody>
      </Table>
    </div>
  );
};
