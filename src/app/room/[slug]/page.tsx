/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { NowPlaying } from "~/components/Room/NowPlaying";
import Page from "~/layouts/Page";
import { Search } from "~/components/Room/Search";
import { QueueTable } from "~/components/Room/QueueTable";

import React, { useEffect, useState } from "react";
import type { NowPlayingProps } from "~/components/Room/NowPlaying";
import type { NowPlayingResponse } from "~/types/spotify/now-playing";
import type { DataProps } from "~/components/Room/QueueTable";
import Div100vh from "react-div-100vh";

const getQueue = async (roomId: string): Promise<DataProps[]> => {
  const response = await fetch(`/api/room/${roomId}/queue/mock`);
  const data = (await response.json()) as DataProps[];
  return data;
};

const getNowPlaying = async (roomId: string): Promise<NowPlayingResponse> => {
  const response = await fetch(`/api/room/${roomId}/currentlyPlaying`);
  const data = (await response.json()) as NowPlayingResponse;
  return data;
};

export default function Room({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<DataProps[]>([]);

  const [nowPlayingData, setNowPlayingData] = useState<NowPlayingProps>({
    image: "https://loremflickr.com/640/480?lock=3494191449505792",
    trackTitle: null,
    artist: null,
    progress: 0,
    duration: 0,
    state: "paused",
  });

  const roomId = params.slug;

  useEffect(() => {
    const intervall = setInterval(() => {
      const oldData = data;
      console.log("fetching data");
      getQueue(roomId)
        .then((newData: DataProps[]) => setData([...oldData, ...newData]))
        .catch((error: Error) => console.error(error));
    }, 3000);
    return () => clearInterval(intervall);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("fetching now playing");
      getNowPlaying(roomId)
        .then((newData: NowPlayingResponse) => {
          setNowPlayingData({
            image: newData?.body?.item?.album?.images[0]?.url as string,
            trackTitle: newData?.body?.item.name,
            artist: newData.body.item.artists[0]?.name as string,
            progress: newData.body.progress_ms,
            duration: newData.body.item.duration_ms,
            state: newData.body.is_playing ? "playing" : "paused" ?? "paused",
          });
        })
        .catch((error: Error) => console.error(error));
    }, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  return (
    <Page>
      <Div100vh className="flex h-full max-h-screen flex-col items-start gap-5 overflow-hidden bg-[#09080f]/80 pt-20 md:gap-10 md:pt-[110px]">
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="left-col flex max-h-[40%] w-full flex-col items-start gap-5 p-5 md:h-full md:max-h-full md:w-[40%] md:max-w-[450px] md:p-0 md:pl-20">
            <NowPlaying
              image={nowPlayingData.image}
              trackTitle={nowPlayingData.trackTitle}
              artist={nowPlayingData.artist}
              progress={nowPlayingData.progress}
              duration={nowPlayingData.duration}
              state={nowPlayingData.state}
            />
            <div className="search hidden w-full md:flex">
              <Search />
            </div>
          </div>
          <div className="right-col flex h-full w-full flex-col items-start border-r md:rounded-tl-xl md:border-l-2 md:border-t-2 md:border-[#C9C5CA]/10 md:bg-[#09080f]/10 md:p-5 md:pr-20">
            <QueueTable data={data} />
          </div>
        </div>
      </Div100vh>
    </Page>
  );
}
