"use client";

/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useRef, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useToast } from "src/components/ui/use-toast";

import { TrackItemCol } from "./TrackItemCol";
import { VotedBy } from "./VotedBy";
import type { VotedByProps } from "./VotedBy";
import { Clock } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";

export interface DataProps {
  id: string;
  queueId: string;
  image: string;
  trackName: string;
  artist: string;
  album: string;
  duration: number;
  upvotes: VotedByProps["users"];
}

export interface ColumnDef {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
}

export interface QueueTableProps {
  data: DataProps[];
}

function VoteActions(props: { item: DataProps }) {
  const { toast } = useToast();
  const slug = usePathname().split("/")[2] as string;
  async function vote(type: "upvote" | "downvote") {
    toast({
      title: "Vote",
      description: `${type === "upvote" ? "Upvoting" : "Downvoting"} ${
        props.item.trackName
      }`,
    });
    const res = await fetch(`/api/room/${slug}/queue/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ queueItemId: props.item.id, voteType: type }),
    });
    if (!res.ok) {
      toast({
        title: "Error",
        description: "Something went wrong",
      });
    } else {
      toast({
        title: "Success",
        description:
          type === "upvote"
            ? `Upvoted ${props.item.trackName}`
            : `Downvoted ${props.item.trackName}`,
      });
    }
    console.log("vote", type);
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="flex cursor-pointer flex-col items-center justify-center rounded-full border-2 border-white bg-white">
        <ChevronUp
          size={18}
          data-qid={props.item.id}
          onClick={() => vote("upvote")}
          color="#0a0a0a"
        />
      </div>
      <div className="flex cursor-pointer flex-col items-center justify-center rounded-full border-2 border-white">
        <ChevronDown
          size={18}
          data-qid={props.item.id}
          onClick={() => vote("downvote")}
        />
      </div>
    </div>
  );
}

export const QueueTable = ({ data }: QueueTableProps) => {
  const headerRef = useRef<HTMLTableRowElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  const dataWithIndex = useMemo(() => {
    return data.map((item, index) => {
      return {
        ...item,
        index: index + 1,
      };
    });
  }, [data]);

  // eslint-disable-next-line @typescript-eslint/ban-types
  const debounce = (func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        func(...args);
      }, delay);
    };
  };

  useEffect(() => {
    adjustColumnWidth();
    const debouncedAdjustColumnWidth = debounce(adjustColumnWidth, 300);
    window.addEventListener("resize", debouncedAdjustColumnWidth);
    return () => {
      window.removeEventListener("resize", debouncedAdjustColumnWidth);
    };
  });

  const adjustColumnWidth = () => {
    const headerCells = headerRef.current?.querySelectorAll("th");
    const bodyCells = bodyRef.current?.querySelectorAll("td");

    if (headerCells && bodyCells) {
      headerCells.forEach((headerCell, index) => {
        const bodyCell = bodyCells[index];
        console.log("resizing");
        if (bodyCell) {
          const maxWidth = Math.max(
            headerCell.clientWidth,
            bodyCell.clientWidth
          );
          headerCell.style.width = `${maxWidth}px`;
          bodyCell.style.width = `${maxWidth}px`;
        }
      });
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow
            className="hidden w-full text-left md:table-cell"
            ref={headerRef}
          >
            <TableHead
              className="sticky top-0 z-10 max-w-[50px] pb-5 pt-2 text-left"
              key="index"
            >
              #
            </TableHead>
            <TableHead
              className="sticky top-0 z-10 pb-5 pt-2 text-left "
              key="track"
            >
              Track
            </TableHead>
            <TableHead
              className="sticky top-0 z-10 pb-5 pt-2 text-left "
              key="album"
            >
              Album
            </TableHead>
            <TableHead
              className="sticky top-0 z-10 pb-5 pt-2 text-left "
              key="votedBy"
            >
              Voted by
            </TableHead>
            <TableHead
              className="sticky top-0 z-10 pb-5 pt-2 text-left "
              key="action"
            ></TableHead>
            <TableHead
              className="sticky top-0 z-10 pb-5 pt-2 text-left "
              key="duration"
            >
              <Clock size={16} aria-label="duration" />
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="scrollbar max-h-[calc(100vh-20rem)] overflow-y-scroll md:max-h-[calc(100vh-12rem)]">
        <Table className="w-full ">
          <TableBody ref={bodyRef}>
            {dataWithIndex.map((item, index) => (
              <TableRow key={index} data-qid={item.queueId}>
                <TableCell className="hidden max-w-[50px] md:table-cell">
                  {index + 1}
                </TableCell>
                <TableCell className="min-w-[50px]">
                  <TrackItemCol
                    image={item.image}
                    trackTitle={item.trackName}
                    artist={item.artist}
                  />
                </TableCell>
                <TableCell className="hidden min-w-[50px] overflow-hidden overflow-ellipsis whitespace-nowrap text-sm md:table-cell">
                  {item.album}
                </TableCell>
                <TableCell className="hidden min-w-[50px] md:table-cell">
                  <VotedBy users={item.upvotes} />
                </TableCell>
                <TableCell className="min-w-[50px] max-w-[50px]">
                  <VoteActions item={item} />
                </TableCell>
                <TableCell className="hidden min-w-[50px] md:table-cell">
                  {new Date(item.duration).toISOString().slice(14, 19)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
