/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { log } from "next-axiom";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id as string;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const room = await prisma.room
    .findUnique({
      where: {
        slug: req.query.slug as string,
      },
    })
    .catch((err) => {
      log.error(err as string);
      return null;
    });

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  // return all participants in the room

  const participants = await prisma.user.findMany({
    where: {
      roomId: room.id,
    },
  });

  return res.status(200).json({
    participants,
  });
}
