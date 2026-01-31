import type { ColumnDef } from "@tanstack/react-table";
import type { MusicListItem } from "@/services/media/list.ts";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export const MusicListColumnDef: ColumnDef<MusicListItem>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "artists",
    header: "Artist(s)",
  },
  {
    accessorKey: "album",
    header: "Album",
  },
];
