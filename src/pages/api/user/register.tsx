/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from "next";
import SpotifyWebApi from "spotify-web-api-node";

import { PrismaClient } from "@prisma/client";
import { redirect } from "next/dist/server/api-utils";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { log } from "next-axiom";
import getAccessToken from "~/lib/supabase/getAccessToken";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({ req, res });
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id as string;
  let provider_token = session?.provider_token as string;
  const provider_refresh_token = session?.provider_refresh_token as string;

  log.info("user/register | userId: " + userId);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!provider_token) {
    provider_token = (await getAccessToken(userId)) as string;

    if (!provider_token) {
      log.error("user/register | No Spotify token found");
      return res.status(500).json({
        error: "No Spotify token found",
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
    return redirect(res, "/");
  }

  prisma.user
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
      return res.status(500).json({
        error: err as string,
      });
    });

  redirect(res, "/");
}
