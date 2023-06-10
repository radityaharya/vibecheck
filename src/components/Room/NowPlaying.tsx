import { Progress } from "src/components/ui/progress";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface NowPlayingProps {
  image: string | null;
  trackTitle: string | null;
  artist: string | null;
  progress: number;
  duration: number;
  state: "playing" | "paused";
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

export function NowPlaying(data: NowPlayingProps) {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [durationFormat, setDurationFormat] = useState<string>("0:00");
  const [progressTimeFormat, setProgressTimeFormat] = useState<string>("0:00");
  const [currentData, setCurrentData] = useState<NowPlayingProps>({
    image: "https://loremflickr.com/640/480?lock=3494191449505792",
    trackTitle: null,
    artist: null,
    progress: 0,
    duration: 0,
    state: "paused",
  });
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevProgressRef = useRef<number>(0);

  useEffect(() => {
    setCurrentData(data);
    setDurationFormat(formatTime(data.duration));
  }, [data]);

  useEffect(() => {
    setProgressPercent((currentData.progress / currentData.duration) * 100);
  }, [currentData.progress, currentData.duration]);

  useEffect(() => {
    if (currentData.state === "playing") {
      progressIntervalRef.current = setInterval(() => {
        setCurrentData((prevState) => ({
          ...prevState,
          progress: prevState.progress + 1000,
        }));
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentData.state]);

  useEffect(() => {
    const diff =
      currentData.progress - progressPercent * (currentData.duration / 1000);
    if (diff >= 5000 || diff <= -5000) {
      setProgressTimeFormat(formatTime(currentData.progress));
      prevProgressRef.current = currentData.progress;
    } else {
      setProgressTimeFormat(formatTime(prevProgressRef.current));
    }
  }, [currentData.progress, currentData.duration, progressPercent]);

  return (
    <>
      <div className="now-playing flex w-full flex-col content-between items-start gap-5 md:pr-10">
        <div className="now-playing-title flex flex-row items-center">
          <span className="text-lg font-bold text-white">Now Playing</span>
        </div>
        <div className="now-playing flex h-full w-full flex-row items-start gap-5">
          <Image
            src={currentData.image as string}
            alt={`${currentData.trackTitle as string} by ${
              currentData.artist as string
            }`}
            height={80}
            width={80}
            // className="h-[80px] w-[80px] rounded-lg object-cover ${}"
            // grey when paused
            className={`h-[80px] w-[80px] rounded-lg object-cover ${
              currentData.state === "paused" ? "grayscale filter" : ""
            }`}
          />
          <div className="track-info flex h-full w-full flex-col content-end items-start gap-1">
            <div className="track-title font-inter flex flex-col items-start gap-1 font-semibold text-white">
              {currentData.trackTitle}
            </div>
            <div className="track-artist flex flex-col items-start gap-1 text-sm font-normal text-[rgba(255,255,255,0.5)]">
              {currentData.artist}
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
}
