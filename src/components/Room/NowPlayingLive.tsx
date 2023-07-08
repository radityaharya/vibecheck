"use client";

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
  return (
    <>
      <div className="now-playing flex w-full flex-col content-between items-start gap-5 md:pr-10">
        <div className="now-playing-title flex flex-row items-center">
          <span className="text-lg font-bold text-white">Now Playing</span>
        </div>
        <div className="now-playing flex h-full w-full flex-row items-start gap-5">
          <Image
            src={data.image as string}
            alt={`${data.trackTitle as string} by ${data.artist as string}`}
            height={80}
            width={80}
            // className="h-[80px] w-[80px] rounded-lg object-cover ${}"
            // grey when paused
            className={`h-[80px] w-[80px] rounded-lg object-cover ${
              data.state === "paused" ? "grayscale filter" : ""
            }`}
          />
          <div className="track-info flex h-full w-full flex-col content-end items-start gap-1">
            <div className="track-title font-inter flex flex-col items-start gap-1 font-semibold text-white">
              {data.trackTitle}
            </div>
            <div className="track-artist flex flex-col items-start gap-1 text-sm font-normal text-[rgba(255,255,255,0.5)]">
              {data.artist}
            </div>
            <div className="progress flex w-full flex-row items-center gap-2">
              <span className="text-sm font-normal text-[rgba(255,255,255,0.5)]">
                {formatTime(data.progress)}
              </span>
              <Progress value={data.progress} max={data.duration} />
              <span className="text-sm font-normal text-[rgba(255,255,255,0.5)]">
                {data.duration ? formatTime(data.duration) : "00:00"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
