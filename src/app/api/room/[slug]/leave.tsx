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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (user?.roomId !== room.id) {
    return res.status(400).json({ error: "User is not in the room" });
  }

  await prisma.user
    .update({
      where: {
        id: userId,
      },
      data: {
        roomId: null,
      },
    })
    .catch(() => {
      return res.status(500).json({ error: "Failed to join room" });
    });

  return res.status(200).json({
    message: "Successfully left room",
  });
}
