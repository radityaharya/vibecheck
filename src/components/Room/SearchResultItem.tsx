import Image from "next/image";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

export interface SearchResultItemProps {
  image: string;
  trackTitle: string;
  artist: string;
  trackId: string;
}

export const SearchResultItem = ({
  image,
  trackTitle,
  artist,
}: SearchResultItemProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
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
