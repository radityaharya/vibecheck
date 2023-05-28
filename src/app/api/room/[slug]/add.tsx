import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import type { Room, Queue, QueueItem } from "@prisma/client";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import SpotifyWebApi from "spotify-web-api-node";
import syncQueueToPlaylist from "~/lib/spotify/syncQueueToPlaylist";
import { log } from "next-axiom";
import getAccessToken from "~/lib/supabase/getAccessToken";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id as string;

  let trackId = req.query.trackId as string;
  if (trackId.includes("spotify:track:")) {
    trackId = trackId.split("spotify:track:")[1] as string;
  }

  if (!trackId) {
    log.error("Failed adding song to queue: no trackId");
    return res.status(400).json({ error: "Required params: trackId" });
  }

  if (!userId) {
    log.error("Failed adding song to queue: no userId");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const roomSlug = req.query.slug as string;
  const room: Room | null = await prisma.room.findUnique({
    where: {
      slug: roomSlug,
    },
  });

  const queue: Queue | null = await prisma.queue.findUnique({
    where: {
      roomId: room?.id,
    },
  });

  const queueItems: QueueItem[] = await prisma.queueItem.findMany({
    where: {
      queueId: queue?.id,
    },
  });

  const trackAlreadyInQueue = queueItems.some(
    (queueItem) => queueItem.trackId === trackId
  );

  if (trackAlreadyInQueue) {
    log.error("Track already in queue");
    return res.status(400).json({
      error: "Track already in queue",
    });
  }

  const roomMasterId = room?.roomMasterId as string;
  const spotifyToken = await getAccessToken(roomMasterId);

  const spotify = new SpotifyWebApi({
    accessToken: spotifyToken as string,
  });

  let queueItemList: QueueItem[] = [];
  const trackName = await spotify.getTrack(trackId).then((data) => {
    return data.body.name;
  });

  const index = queueItems.length;
  const added = await prisma.queue.update({
    where: {
      id: queue?.id,
    },
    data: {
      queueItem: {
        create: {
          trackId: trackId,
          trackName: trackName,
          addedById: userId,
          index: index,
        },
      },
    },
  });

  if (!added) {
    log.error("Failed adding song to queue");
    return res.status(500).json({
      error: "Failed adding song to queue",
    });
  }

  const removed = await prisma.queueItem.deleteMany({
    where: {
      queueId: queue?.id,
      played: true,
    },
  });

  if (!removed) {
    log.error("Failed removing played queue items");
    return res.status(500).json({
      error: "Failed removing played queue items",
    });
  }

  queueItemList = await prisma.queueItem.findMany({
    where: {
      queueId: queue?.id,
    },
  });

  const playlistId = room?.tempPlaylistId as string;
  const synced = await syncQueueToPlaylist(spotify, playlistId, queueItemList);

  if (!synced) {
    log.error("Failed syncing queue to playlist");
    return res.status(500).json({
      error: "Failed syncing queue to playlist",
    });
  }

  return res.status(200).json({
    success: true,
    queueItemList: queueItemList,
  });
}
