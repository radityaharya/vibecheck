import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { prisma } from "~/lib/prisma/client";
import getAccessToken from "~/lib/supabase/getAccessToken";
import SpotifyWebApi from "spotify-web-api-node";

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

  const searchQuery = request.url.split("?q=")[1];

  if (!searchQuery) {
    return new Response("No search query", {
      status: 400,
    });
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

  return new Response(JSON.stringify(tracks), {
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
  });
}
