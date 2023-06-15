/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import { NowPlaying } from "~/components/Room/NowPlaying";
import Page from "~/layouts/Page";
import { Search } from "~/components/Room/Search";
import { QueueTable } from "~/components/Room/QueueTable";

import type { NowPlayingProps } from "~/components/Room/NowPlaying";
import type { DataProps } from "~/components/Room/QueueTable";
import useSWR, { preload }from "swr";
import { Bars } from "react-loader-spinner";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

async function getNowPlaying(url: string) {
  console.log(url);
  const res = await fetch(url).then((response) => response.json());
  const data = res.body;
  const nowPlayingProps: NowPlayingProps = {
    image:
      data?.item?.album?.images[0]?.url ??
      "https://loremflickr.com/640/480?lock=3494191449505792",
    trackTitle: data?.item?.name ?? null,
    artist: data?.item?.artists[0]?.name ?? null,
    progress: data?.progress_ms ?? 0,
    duration: data?.item?.duration_ms ?? 0,
    state: data?.is_playing ? "playing" : "paused",
  };
  return nowPlayingProps;
}

export default function Room({ params }: { params: { slug: string } }) {
  const roomId = params.slug;
  preload(`/api/room/${roomId}/currentlyPlaying`, getNowPlaying).catch((e) =>
    console.error(e)
  );
  preload(`/api/room/${roomId}/queue/tracks` , fetcher).catch((e) =>
    console.error(e)
  );

  const { data: queueData } = useSWR<DataProps[]>(
    `/api/room/${roomId}/queue/tracks`,
    fetcher,
    {
      refreshInterval: 1000,
    }
  );

  const { data: nowPlayingData } = useSWR<NowPlayingProps>(
    `/api/room/${roomId}/currentlyPlaying`,
    getNowPlaying,
    {
      refreshInterval: 1000,
    }
  );

  const data = queueData ?? [];
  const nowPlaying = nowPlayingData as NowPlayingProps;

  return (
    <Page>
      <div className="flex h-screen flex-col items-start gap-5 overflow-hidden bg-[#09080f]/80 pt-20 md:gap-10 md:pt-[110px]">
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="left-col flex max-h-[40%] w-full flex-col items-start gap-5 p-5 md:h-full md:max-h-full md:w-[40%] md:max-w-[450px] md:p-0 md:pl-20">
            {nowPlaying ? (
              <NowPlaying {...nowPlaying} />
            ) : (
              <div className="flex w-full flex-col items-center justify-center">
                <Bars
                  height="40"
                  width="40"
                  color="#ffffff"
                  ariaLabel="bars-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            )}

            <div className="search hidden w-full md:flex">
              <Search />
            </div>
          </div>
          <div className="right-col flex h-full w-full flex-col items-start border-r md:rounded-tl-xl md:border-l-2 md:border-t-2 md:border-[#C9C5CA]/10 md:bg-[#09080f]/10 md:p-5 md:pr-20">
            {data.length > 0 ? (
              <QueueTable data={data} />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <Bars
                  height="40"
                  width="40"
                  color="#ffffff"
                  ariaLabel="bars-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
