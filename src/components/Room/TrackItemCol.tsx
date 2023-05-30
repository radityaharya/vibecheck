import Image from "next/image";

export interface TrackItemColProps {
  image: string;
  trackTitle: string;
  artist: string;
}

export const TrackItemCol = ({
  image,
  trackTitle,
  artist,
}: TrackItemColProps) => {
  return (
    <div className="flex h-[50px] flex-row items-center gap-4">
      <Image
        src={image}
        alt={`${trackTitle} by ${artist}`}
        height={50}
        width={50}
        className="h-[50px] w-[50px] rounded-lg object-cover"
      />
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
