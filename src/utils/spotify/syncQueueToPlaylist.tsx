import type SpotifyWebApi from "spotify-web-api-node";
import type { QueueItem } from "@prisma/client";
import { log } from "next-axiom";

export const syncQueueToPlaylist = async (
  spt: SpotifyWebApi,
  tempPlaylistId: string,
  queueItemList: QueueItem[]
) => {
  try {
    const playlistTracks = await spt.getPlaylistTracks(tempPlaylistId);
    const playlistTrackItems = playlistTracks.body.items.filter(
      (item) => item?.track !== null
    );

    const queueTrackUris = queueItemList.map(
      (item) => `spotify:track:${item.trackId}`
    );

    if (playlistTrackItems.length === 0) {
      log.info("No tracks in playlist");
      await spt.addTracksToPlaylist(tempPlaylistId, queueTrackUris);
      return true;
    }

    let playlistTrackUris = playlistTrackItems.map(
      (item) => `spotify:track:${item?.track?.id as string}`
    );

    const missingTracks = queueTrackUris.filter(
      (track) => !playlistTrackUris.includes(track)
    );

    if (missingTracks.length > 0) {
      log.info("Missing tracks", missingTracks);
      await spt.addTracksToPlaylist(tempPlaylistId, missingTracks);
      playlistTrackUris.push(...missingTracks);
    }

    const tracksToRemove = playlistTrackUris.filter(
      (track) => !queueTrackUris.includes(track)
    );

    const tracksToRemoveTrackObjects = tracksToRemove.map((uri) => ({ uri }));

    if (tracksToRemoveTrackObjects.length > 0) {
      log.info("Tracks to remove", tracksToRemoveTrackObjects);
      await spt.removeTracksFromPlaylist(
        tempPlaylistId,
        tracksToRemoveTrackObjects
      );
      playlistTrackUris = playlistTrackUris.filter(
        (track) => !tracksToRemove.includes(track)
      );
    }

    // Sort track URIs based on index
    const sortedQueueTrackUris = queueItemList
      .sort((a, b) => a.index - b.index)
      .map((item) => `spotify:track:${item.trackId}`);

    // Compare existing playlist order with sorted order
    const tracksToMove: { uri: string; newIndex: number }[] = [];
    playlistTrackUris.forEach((uri, currentIndex) => {
      const newIndex = sortedQueueTrackUris.indexOf(uri);
      if (currentIndex !== newIndex) {
        tracksToMove.push({ uri, newIndex });
      }
    });

    // Reorder tracks if necessary
    for (const { uri, newIndex } of tracksToMove) {
      const options = { range_length: 1 };
      try {
        await spt.reorderTracksInPlaylist(
          tempPlaylistId,
          playlistTrackUris.indexOf(uri),
          newIndex,
          options
        );
      } catch (error) {
        log.error(`Error while reordering track: ${uri}`);
        throw error;
      }
    }

    log.info("Sync completed successfully");
    return true;
  } catch (error) {
    log.error(
      `An error occurred during playlist synchronization: ${error as string}`
    );
    throw error;
  }
};

export default syncQueueToPlaylist;
