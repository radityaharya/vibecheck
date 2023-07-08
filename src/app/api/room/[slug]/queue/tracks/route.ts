import SpotifyWebApi from "spotify-web-api-node";
import { prisma } from "~/lib/prisma/client";
import getAccessToken from "~/utils/supabase/getAccessToken";
import { getUserId } from "~/utils/supabase/getUserId";
import { log } from "next-axiom";
import { NextResponse } from "next/server";
import { createClient } from "redis";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import syncQueueToPlaylist from "~/utils/spotify/syncQueueToPlaylist";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { slug: string };
  }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const userId = await getUserId(supabase);
  const slug = params.slug;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = createClient({
    url: process.env.REDIS_URL as string,
  });

  redis.on("error", (err) => console.log("Redis Client Error", err));

  await redis.connect();

  const cacheKey = `queue-${slug}`;

  try {
    const cachedData = (await JSON.parse(
      (await redis.get(cacheKey)) as string
    )) as unknown;

    if (cachedData) {
      // log.info("Returning cached data");
      return NextResponse.json(cachedData);
    }

    const queue = await prisma.queueItem.findMany({
      include: {
        upvotes: {
          include: {
            createdBy: {
              include: {
                SpotifyAccount: {
                  select: {
                    picture: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        queue: {
          room: {
            slug: slug,
          },
        },
      },
      orderBy: {
        index: "asc",
      },
    });

    const mappedQueue = queue.map((queueItem) => {
      const upvotes = queueItem.upvotes.map((upvote) => {
        return {
          id: upvote.createdById,
          username: upvote.createdBy.SpotifyAccount?.displayName,
          image: upvote.createdBy.SpotifyAccount?.picture,
        };
      });
      return {
        ...queueItem,
        upvotes: upvotes,
      };
    });

    if (mappedQueue) {
      await redis.set(cacheKey, JSON.stringify(mappedQueue), {
        NX: true,
        EX: 5,
      });
      // log.info("Returning fresh data");
      return NextResponse.json(mappedQueue);
    } else {
      return NextResponse.json(
        { error: "Failed fetching queue" },
        { status: 400 }
      );
    }
  } finally {
    await redis.disconnect();
  }
}

export async function POST(
  request: Request,
  {
    params: { slug },
  }: {
    params: { slug: string };
  }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id as string;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trackId } = (await request.json()) as { trackId: string };
  if (!trackId) {
    return NextResponse.json(
      { error: "Failed adding song to queue: no trackId" },
      { status: 400 }
    );
  }

  const room = await prisma.room.findUnique({
    where: { slug },
    include: { queue: { include: { queueItem: true } } },
  });

  const queue = room?.queue;
  const queueItems = queue?.queueItem;
  const roomMasterId = room?.roomMasterId as string;

  const spotifyToken = (await getAccessToken(roomMasterId)) as string;
  const spotify = new SpotifyWebApi({ accessToken: spotifyToken });

  const track = await spotify
    .getTrack(trackId)
    .then((data) => data.body)
    .catch((err) => {
      log.error("Failed fetching track from Spotify", err as Error);
      throw new Error("Failed fetching track from Spotify");
    });

  if (!queueItems) {
    await prisma.queue.update({
      where: { id: queue?.id },
      data: {
        queueItem: {
          create: {
            trackId,
            trackName: track.name,
            addedById: userId,
            index: 0,
            album: track.album.name,
            artist: track.artists?.[0]?.name as string,
            duration: track.duration_ms,
            image: track.album.images?.[0]?.url as string,
          },
        },
      },
    });
    return NextResponse.json(
      { success: true, queueItemList: [] },
      { status: 200 }
    );
  }

  const trackAlreadyInQueue = queueItems?.some(
    (queueItem) => queueItem.trackId === trackId
  );

  if (trackAlreadyInQueue) {
    return NextResponse.json(
      { error: "Track already in queue" },
      { status: 400 }
    );
  }

  const index = queueItems?.length;
  const added = await prisma.queue.update({
    where: { id: queue?.id },
    data: {
      queueItem: {
        create: {
          trackId,
          trackName: track.name,
          addedById: userId,
          index: index,
          album: track.album.name,
          artist: track.artists?.[0]?.name as string,
          duration: track.duration_ms,
          image: track.album.images?.[0]?.url as string,
        },
      },
    },
  });

  if (!added) {
    return NextResponse.json(
      { error: "Failed adding song to queue" },
      { status: 500 }
    );
  }

  const removed = await prisma.queueItem.deleteMany({
    where: { queueId: queue?.id, played: true },
  });

  if (!removed) {
    return NextResponse.json(
      { error: "Failed removing played queue items" },
      { status: 500 }
    );
  }

  const queueItemList = await prisma.queueItem.findMany({
    where: { queueId: queue?.id },
  });

  const playlistId = room?.tempPlaylistId as string;
  const [synced] = await Promise.all([
    syncQueueToPlaylist(spotify, playlistId, queueItemList),
  ]);

  if (!synced) {
    return NextResponse.json(
      { error: "Failed syncing queue to playlist" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, queueItemList }, { status: 200 });
}
