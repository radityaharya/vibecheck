/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import SpotifyWebApi from "spotify-web-api-node";
import { getOauthAccessToken } from "src/lib/clerk/getOauthAccessToken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const spotifyToken = await getOauthAccessToken(req, "spotify");

  if (!spotifyToken) {
    return res.status(500).json({
      error: "No Spotify token found",
    });
  }

  const spt = new SpotifyWebApi({
    accessToken: spotifyToken.token,
  });

  const currentlyPlaying = await spt.getMyCurrentPlayingTrack();

  if (currentlyPlaying.body.is_playing) {
    return res.status(200).json({
      isPlaying: true,
      track: currentlyPlaying.body.item,
    });
  } else {
    return res.status(200).json({
      isPlaying: false,
      track: null,
    });
  }
}
