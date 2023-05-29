import { Progress } from "src/components/ui/progress";
import Image from "next/image";

interface NowPlayingProps {
  image: string;
  trackTitle: string;
  artist: string;
  progress: number;
  duration: number;
}

export const NowPlaying: React.FC<NowPlayingProps> = ({
  image = "/_next/image?url=https%3A%2F%2Floremflickr.com%2F640%2F480%3Flock%3D3494191449505792&w=64&q=75",
  trackTitle = "Unknown Track",
  artist = "Unknown Artist",
  progress = 50,
  duration = 100,
}) => {
  const progressPercent = (progress / duration) * 100;
  // format duration and progress to mm:ss
  const durationFormat = new Date(duration * 1000).toISOString().slice(14, 19);
  const progressTimeFormat = new Date(progress * 1000)
    .toISOString()
    .slice(14, 19);

  return (
    <>
      <div className="now-playing flex w-full flex-col items-start gap-5 pr-20">
        <div className="now-playing-title flex flex-row items-center">
          <span className="text-lg font-bold text-white">Now Playing</span>
        </div>
        <div className="now-playing flex w-full flex-row items-start gap-5">
          <Image
            src={image}
            alt={`${trackTitle} by ${artist}}`}
            height={80}
            width={80}
            className="h-[80px] w-[80px] rounded-lg object-cover"
          />
          <div className="track-info flex w-full flex-col items-start gap-1">
            <div className="track-title font-inter flex flex-col items-start gap-1 font-semibold text-white">
              {trackTitle}
            </div>
            <div className="track-artist flex flex-col items-start gap-1 text-sm font-normal text-[rgba(255,255,255,0.5)]">
              {artist}
            </div>
            <div className="progress flex w-full flex-row items-center gap-2">
              <span className="text-sm font-normal text-[rgba(255,255,255,0.5)]">
                {progressTimeFormat}
              </span>
              <Progress value={progressPercent} className="h-1.5 w-full" />
              <span className="text-sm font-normal text-[rgba(255,255,255,0.5)]">
                {durationFormat}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
