/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import SpotifyWebApi from "spotify-web-api-node";
import { PrismaClient } from "@prisma/client";
import { log } from "next-axiom";

const prisma = new PrismaClient();

const getAccessToken = async (uuid: string) => {
  const user = await prisma.user
    .findUnique({
      where: {
        id: uuid,
      },
      include: {
        SpotifyAccount: true,
      },
    })
    .catch((err) => {
      log.error(err as string);
    });

  if (!user) {
    return null;
  }

  let accessToken = user?.SpotifyAccount?.accessToken;
  let refreshToken = user?.SpotifyAccount?.refreshToken;
  let expiresIn = user?.SpotifyAccount?.expiresIn as bigint;
  let expiresAt = user?.SpotifyAccount?.expiresAt as bigint;

  if (!accessToken || !refreshToken) {
    return null;
  }

  if (expiresAt && new Date().getTime() > expiresAt) {
    log.info(
      `room/[slug]/currentlyPlaying | user: ${user.id} Token expired, refreshing...`
    );
    const spt = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
      refreshToken: refreshToken,
    });

    const data = await spt.refreshAccessToken().catch((err) => {
      log.error(err as string);
    });

    if (!data) {
      return null;
    }

    const now = new Date().getTime() as unknown as bigint;
    accessToken = data.body.access_token;
    refreshToken = data.body.refresh_token;
    expiresIn = data.body.expires_in as unknown as bigint;
    expiresAt = now + expiresIn * 1000n;

    await prisma.spotifyAccount.update({
      where: {
        id: user.SpotifyAccount?.id,
      },
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken as string,
        expiresIn: expiresIn,
        expiresAt: expiresAt,
      },
    });
  }

  return accessToken;
};

export default getAccessToken;
