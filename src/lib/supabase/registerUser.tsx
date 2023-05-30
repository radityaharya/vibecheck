/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import SpotifyWebApi from "spotify-web-api-node";
import { PrismaClient } from "@prisma/client";
import { log } from "next-axiom";
import getAccessToken from "~/lib/supabase/getAccessToken";
import type { Session } from "@supabase/auth-helpers-react";
const prisma = new PrismaClient();

export async function RegisterUser(session: Session) {
  log.info("user/register", session);

  const userId = session?.user?.id as string;

  let provider_token = session?.provider_token as string;
  const provider_refresh_token = session?.provider_refresh_token as string;

  log.info("user/register | userId: " + userId);

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const userExists = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (userExists) {
    log.info("user/register | User already exists");
    return;
  }

  if (!provider_token) {
    provider_token = (await getAccessToken(userId)) as string;

    if (!provider_token) {
      log.error("user/register | No Spotify token found");

      await prisma.user
        .create({
          data: {
            id: userId,
          },
        })
        .catch((err) => {
          log.error(err as string);
          throw new Error("Internal server error");
        });
    }
  }

  const spt = new SpotifyWebApi({
    accessToken: provider_token,
  });

  const userInfo = await spt.getMe();

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (user) {
    return;
  }

  await prisma.user
    .create({
      data: {
        id: userId,
        SpotifyAccount: {
          create: {
            id: userInfo.body.id,
            isPremium: userInfo.body.product === "premium",
            country: userInfo.body.country,
            email: userInfo.body.email,
            displayName: userInfo.body.display_name as string,
            accessToken: provider_token,
            refreshToken: provider_refresh_token,
            expiresIn: session?.expires_in as number,
            expiresAt: session?.expires_at as number,
            picture: userInfo.body.images?.[0]?.url as string,
          },
        },
      },
    })
    .catch((err) => {
      log.error(err as string);
      throw new Error(err as string);
    });

  return;
}

// export default RegisterUser;
