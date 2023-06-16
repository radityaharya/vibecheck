import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma/client";
import getAccessToken from "~/utils/supabase/getAccessToken";
import { getUserId } from "~/utils/supabase/getUserId";
import SpotifyWebApi from "spotify-web-api-node";
import { createClient } from "redis";
import { log } from "next-axiom";

interface UserRecomendation {
  trackId: string;
  image: string;
  trackTitle: string;
  artist: string;
}

interface UserRecomendations {
  [key: string]: UserRecomendation[];
}

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

  const redis = createClient({
    url: process.env.REDIS_URL as string,
  });

  redis.on("error", (err) => console.log("Redis Client Error", err));

  await redis.connect();

  const cacheKey = `room:${slug}:user:${userId}:search:recommendations`;

  try {
    const cachedData = (await JSON.parse(
      (await redis.get(cacheKey)) as string
    )) as UserRecomendations;

    if (cachedData) {
      log.info("Returning cached data");
      return NextResponse.json(cachedData);
    }

    if (!spotifyToken) {
      return NextResponse.json({ error: "No spotify token" }, { status: 500 });
    }

    const spt = new SpotifyWebApi({
      accessToken: spotifyToken,
    });

    const topTracks = spt.getMyTopTracks({
      limit: 5,
    });

    const topTracksResponse = await topTracks;

    const topTrackIds = topTracksResponse.body.items.map((track) => track.id);

    const recommendations = await spt.getRecommendations({
      seed_tracks: topTrackIds,
      limit: 50,
    });

    const recommendationsResponse = recommendations.body;

    const userRecommendations = recommendationsResponse.tracks.map(
      (track): UserRecomendation => {
        return {
          trackId: track.id,
          image: track.album.images[0]?.url as string,
          trackTitle: track.name,
          artist: track.artists[0]?.name as string,
        };
      }
    );

    await redis.set(cacheKey, JSON.stringify(userRecommendations), {
      NX: true,
      EX: 10 * 60, // 10 minutes
    });

    return NextResponse.json(userRecommendations);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  } finally {
    await redis.disconnect();
  }
}
