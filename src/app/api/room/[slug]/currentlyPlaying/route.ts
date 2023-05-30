import SpotifyWebApi from "spotify-web-api-node";
import { PrismaClient } from "@prisma/client";
import getAccessToken from "~/lib/supabase/getAccessToken";
import { log } from "next-axiom";
import { NextResponse } from "next/server";
import { createClient } from "redis";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { NowPlayingResponse } from "~/types/spotify/now-playing";
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { slug: string };
  }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const slug = params.slug;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // log.info(JSON.stringify(user));
  const userId = user?.id as string;

  if (!userId) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  const roomId = slug;

  const room = await prisma.room.findUnique({
    where: {
      slug: roomId,
    },
  });

  const roomMasterId = room?.roomMasterId as string;

  const spotifyToken = await getAccessToken(roomMasterId);

  if (!spotifyToken) {
    return new Response("No spotify token", {
      status: 500,
    });
  }

  const spt = new SpotifyWebApi({
    accessToken: spotifyToken,
  });

  const redis = createClient({
    url: process.env.REDIS_URL as string,
  });

  redis.on("error", (err) => console.log("Redis Client Error", err));

  await redis.connect();

  const cacheKey = `currentlyPlaying-${roomId}`;

  try {
    const cachedData = (await JSON.parse(
      (await redis.get(cacheKey)) as string
    )) as NowPlayingResponse;

    if (cachedData) {
      log.info("Returning cached data");
      // log.info("cached data", cachedData);
      return NextResponse.json(cachedData);
    }

    const currentlyPlaying = await spt.getMyCurrentPlayingTrack();

    if (currentlyPlaying.body.is_playing) {
      await redis.set(cacheKey, JSON.stringify(currentlyPlaying), {
        NX: true,
        EX: 5,
      });
      log.info("Returning fresh data");
      // log.info("fresh data", currentlyPlaying);
      return NextResponse.json(currentlyPlaying);
    } else {
      return NextResponse.json(
        {
          isPlaying: false,
        },
        {
          status: 200,
        }
      );
    }
  } finally {
    await redis.disconnect();
  }
}
