/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from "next";
import SpotifyWebApi from "spotify-web-api-node";
import { PrismaClient } from "@prisma/client";
import getAccessToken from "~/lib/supabase/getAccessToken";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id as string;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const room = await prisma.room.findUnique({
    where: {
      slug: req.query.slug as string,
    },
  });

  const roomMasterId = room?.roomMasterId as string;

  const spotifyToken = await getAccessToken(roomMasterId);

  if (!spotifyToken) {
    return res.status(500).json({
      error: "No Spotify token found",
    });
  }

  const spt = new SpotifyWebApi({
    accessToken: spotifyToken,
  });

  const currentlyPlaying = await spt.getMyCurrentPlayingTrack();

  if (currentlyPlaying.body.is_playing) {
    return res.status(200).json({
      isPlaying: true,
      track: currentlyPlaying.body,
    });
  } else {
    return res.status(200).json({
      is_playing: false,
    });
  }
}
