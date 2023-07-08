import SpotifyWebApi from "spotify-web-api-node";
import { prisma } from "~/lib/prisma/client";
import getAccessToken from "~/utils/supabase/getAccessToken";
import { getUserId } from "~/utils/supabase/getUserId";
import { log } from "next-axiom";
import { NextResponse } from "next/server";
import { createClient } from "redis";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { NowPlayingResponse } from "~/types/spotify/now-playing";

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
  const userId = await getUserId(supabase);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const room = await prisma.room.findUnique({
    where: {
      slug: slug,
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

  const cacheKey = `currentlyPlaying-${slug}`;

  try {
    const cachedData = (await JSON.parse(
      (await redis.get(cacheKey)) as string
    )) as NowPlayingResponse;

    if (cachedData) {
      // log.info("Returning cached data");
      return NextResponse.json(cachedData);
    }

    const currentlyPlaying = await spt.getMyCurrentPlayingTrack();

    if (currentlyPlaying.body.is_playing) {
      await redis.set(cacheKey, JSON.stringify(currentlyPlaying), {
        NX: true,
        EX: 5,
      });
      // log.info("Returning fresh data");
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
