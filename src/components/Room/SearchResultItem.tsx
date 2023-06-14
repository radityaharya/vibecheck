import Image from "next/image";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useToast } from "src/components/ui/use-toast";
import type { QueueTableProps } from "./QueueTable";
import { mutate } from "swr";

export interface SearchResultItemProps {
  image: string;
  trackTitle: string;
  artist: string;
  trackId: string;
}

const addTrackToQueue = async (roomId: string, trackId: string) => {
  const response = fetch(`/api/room/${roomId}/queue/tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ trackId }),
  });
  const res = await response;
  const data = (await res.json()) as {
    success: boolean;
    queueItemList: QueueTableProps;
  };
  return data.success;
};

export const SearchResultItem = ({
  image,
  trackTitle,
  artist,
  trackId,
}: SearchResultItemProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const { toast } = useToast();

  const roomSlug = usePathname().split("/")[2] as string;

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // const handleAddTrackToQueue = async () => {
  //   try {
  //     await addTrackToQueue(roomSlug, trackId);
  //     mutate(`/api/room/${roomSlug}/queue/tracks`).catch((err) => {
  //       console.error(err);
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     toast({
  //       title: "Error",
  //       description: `Failed to add track to queue: ${err as string}`,
  //     });
  //     return false;
  //   } finally {
  //     const message =
  //     toast({
  //       title: "Added to queue",
  //       description: `${trackTitle} by ${artist}`,
  //     });
  //     return true;
  //   }
  // };

  const handleAddTrackToQueue = async () => {
    toast({
      title: "Adding to queue",
      description: `${trackTitle} by ${artist}`,
    });
    try {
      const data = await addTrackToQueue(roomSlug, trackId);
      if (data) {
        mutate(`/api/room/${roomSlug}/queue/tracks`).catch((err) => {
          console.error(err);
          toast({
            title: "Error",
            description: `Failed to add track to queue: ${err as string}`,
          });
        });
        toast({
          title: "Added to queue",
          description: `${trackTitle} by ${artist}`,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: `Failed to add track to queue: ${err as string}`,
      });
    }
  };

  return (
    <div className="relative flex h-[50px] select-none flex-row items-center gap-4">
      <div
        className="relative h-[50px] w-[50px] overflow-hidden rounded-lg"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={image}
          alt={`${trackTitle} by ${artist}`}
          height={50}
          width={50}
          className="h-[50px] w-[50px] object-cover"
        />
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 transition-opacity duration-100 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => {
            toast({
              title: "Adding to queue",
              description: `${trackTitle} by ${artist}`,
            });
            handleAddTrackToQueue().catch((err) => {
              console.error(err);
            });
          }}
        >
          <PlusCircle className="text-white/50" />
        </div>
      </div>
      <div className="track-info flex max-w-full flex-col items-start gap-1">
        <div className="track-title flex flex-col items-start gap-0 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-semibold">
          <div className="max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap">
            {trackTitle}
          </div>
        </div>
        <div className="track-artist flex flex-col items-start gap-1 truncate text-sm font-normal text-[rgba(255,255,255,0.5)]">
          {artist}
        </div>
      </div>
    </div>
  );
};
