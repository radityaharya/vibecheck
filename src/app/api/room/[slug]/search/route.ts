import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { prisma } from "~/lib/prisma/client";
import getAccessToken from "~/utils/supabase/getAccessToken";
import { getUserId } from "~/utils/supabase/getUserId";
import SpotifyWebApi from "spotify-web-api-node";
import { NextResponse } from "next/server";

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

  const searchQuery = request.url.split("?q=")[1];

  if (!searchQuery) {
    return NextResponse.json({ error: "No search query" }, { status: 400 });
  }

  const searchResults = await spt.searchTracks(searchQuery, {
    limit: 20,
  });

  const tracks = searchResults?.body?.tracks?.items.map((track) => {
    return {
      trackId: track.id,
      image: track.album.images[0]?.url,
      trackTitle: track.name,
      artist: track.artists[0]?.name,
    };
  });

  return NextResponse.json(tracks);
}
