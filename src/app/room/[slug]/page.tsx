/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { NowPlaying } from "~/components/Room/NowPlaying";
import Page from "~/layouts/Page";
import { Search } from "~/components/Room/Search";
import { QueueTable } from "~/components/Room/QueueTable";
import { preload } from "swr";
import type { NowPlayingProps } from "~/components/Room/NowPlaying";
import type { DataProps } from "~/components/Room/QueueTable";
import useSWR from "swr";
import { Bars } from "react-loader-spinner";
import type { NowPlayingResponse } from "src/types/spotify/now-playing";
import { NowPlaying as NP } from "~/components/Room/NowPlaying";
import { WebPlaybackSDK } from "react-spotify-web-playback-sdk";
import { memo, useCallback, useState } from "react";
import { useEffect } from "react";
import {
  usePlaybackState,
  usePlayerDevice,
  useErrorState,
  useWebPlaybackSDKReady,
} from "react-spotify-web-playback-sdk";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

async function getNowPlaying(url: string) {
  console.log(url);
  const res = (await fetch(url).then((response) =>
    response.json()
  )) as NowPlayingResponse;
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

const StateConsumer = ({ access_token }: { access_token: string }) => {
  const playbackState = usePlaybackState(true, 100);
  const playerDevice = usePlayerDevice();
  const webPlaybackSDKReady = useWebPlaybackSDKReady() ?? false;
  // const NowPlayingMemo = memo(NowPlaying);

  const [nowPlayingProps, setNowPlayingProps] = useState<NowPlayingProps>({
    image: "https://loremflickr.com/640/480?lock=3494191449505792",
    trackTitle: "null",
    artist: "null",
    progress: 0,
    duration: 0,
    state: "paused",
  });

  const { data: accessToken } = useSWR<{ access_token: string }>(
    `/api/user/spotify/accessToken`,
    fetcher
  );

  useEffect(() => {
    fetch(`https://api.spotify.com/v1/me/player`, {
      method: "PUT",
      body: JSON.stringify({
        device_ids: [playerDevice?.device_id],
        play: true,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken?.access_token as string}`,
      },
    });
  }, [accessToken?.access_token, playerDevice?.device_id]);

  useEffect(() => {
    if (!playbackState) return;
    setNowPlayingProps({
      image: playbackState?.track_window?.current_track?.album?.images[0]
        ?.url as string,
      trackTitle: playbackState?.track_window?.current_track?.name,
      artist: playbackState?.track_window?.current_track?.artists[0]
        ?.name as string,
      progress: playbackState?.position,
      duration: playbackState?.duration,
      state: playbackState?.paused ? "paused" : "playing",
    });
  }, [playbackState]);

  return (
    // render when ready
    (playerDevice?.device_id && (
      <>
        <NP {...nowPlayingProps} />
        <div>ready: {webPlaybackSDKReady?.toString()}</div>
      </>
    )) || (
      <div className="flex h-full items-center justify-center">
        <div className="flex w-full flex-col items-center justify-center">
          <Bars
            height="40"
            width="40"
            color="rgba(255,255,255,0.8)"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      </div>
    )
  );
};

export default function Room({ params }: { params: { slug: string } }) {
  const roomId = params.slug;

  const { data: queueData } = useSWR<DataProps[]>(
    `/api/room/${roomId}/queue/tracks`,
    fetcher,
    {
      refreshInterval: 3000,
    }
  );

  const { data: nowPlayingData } = useSWR<NowPlayingProps>(
    `/api/room/${roomId}/currentlyPlaying`,
    getNowPlaying,
    {
      refreshInterval: 3000,
    }
  );

  const queue = queueData ?? [];
  const nowPlaying = nowPlayingData as NowPlayingProps;

  const getOAuthToken: Spotify.PlayerInit["getOAuthToken"] =
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useCallback((callback) => {
      fetch(`/api/user/spotify/accessToken`)
        .then((res) => res.json())
        .then((data) => {
          callback(data.access_token as string);
        });
    }, []);

  const { access_token } = getOAuthToken as unknown as {
    access_token: string;
  };


  return (
    <Page>
      <div className="flex h-screen flex-col items-start gap-5 overflow-hidden bg-[#09080f]/80 pt-20 md:gap-10 md:pt-[110px]">
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="left-col flex max-h-[40%] w-full flex-col items-start gap-5 p-5 md:h-full md:max-h-full md:w-[40%] md:max-w-[450px] md:p-0 md:pl-20">
            {/* {nowPlaying ? (
              <NowPlaying {...nowPlaying} />
            ) : (
              <div className="flex w-full flex-col items-center justify-center">
                <Bars
                  height="40"
                  width="40"
                  color="rgba(255,255,255,0.8)"
                  ariaLabel="bars-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            )} */}

            <WebPlaybackSDK
              initialDeviceName={`Vibecheck on ${roomId}`}
              getOAuthToken={getOAuthToken}
              connectOnInitialized={true}
              initialVolume={0.5}
            >

              <StateConsumer access_token={access_token} />
            </WebPlaybackSDK>
            <div className="search hidden w-full md:flex">
              <Search />
            </div>
          </div>
          <div className="right-col flex h-full w-full flex-col items-start border-r md:rounded-tl-xl md:border-l-2 md:border-t-2 md:border-[#C9C5CA]/10 md:bg-[#09080f]/10 md:p-5 md:pr-20">
            {queue.length > 0 ? (
              <QueueTable data={queue} />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <Bars
                  height="40"
                  width="40"
                  color="rgba(255,255,255,0.8)"
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
