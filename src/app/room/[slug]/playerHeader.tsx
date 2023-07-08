/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { access } from "fs";
import { memo, useEffect, useState } from "react";
import {
  usePlaybackState,
  usePlayerDevice,
  useErrorState,
  useWebPlaybackSDKReady,
} from "react-spotify-web-playback-sdk";
import { NowPlaying } from "~/components/Room/NowPlayingLive";

interface NowPlayingProps {
  image: string | null;
  trackTitle: string | null;
  artist: string | null;
  progress: number;
  duration: number;
  state: "playing" | "paused";
}

export const StateConsumer = ({ access_token }: { access_token: string }) => {
  const playbackState = usePlaybackState(true, 100);
  const playerDevice = usePlayerDevice();
  const errorState = useErrorState();
  const webPlaybackSDKReady = useWebPlaybackSDKReady();
  const NowPlayingMemo = memo(NowPlaying);

  const [nowPlayingProps, setNowPlayingProps] = useState<NowPlayingProps>({
    image: null,
    trackTitle: null,
    artist: null,
    progress: 0,
    duration: 0,
    state: "paused",
  });

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

  useEffect(() => {
    console.log("state", playbackState);
    console.log("playerDevice", playerDevice);
    console.log("errorState", errorState);
    console.log("webPlaybackSDKReady", webPlaybackSDKReady);
  }, [playbackState, playerDevice, errorState, webPlaybackSDKReady]);

  useEffect(() => {
    if (!playerDevice?.device_id) return;

    // https://developer.spotify.com/documentation/web-api/reference/#endpoint-transfer-a-users-playback
    fetch(`https://api.spotify.com/v1/me/player`, {
      method: "PUT",
      body: JSON.stringify({
        device_ids: [playerDevice.device_id],
        play: false,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  }, [access_token, playerDevice?.device_id]);

  return (
    <NowPlayingMemo {...nowPlayingProps} />
    // <div>
    //   <div>state: {playbackState?.context?.uri}</div>
    //   <div>device: {playerDevice?.device_id}</div>
    //   <div>error: {errorState?.message}</div>
    //   <div>ready: {webPlaybackSDKReady?.toString()}</div>
    // </div>
  );
};
