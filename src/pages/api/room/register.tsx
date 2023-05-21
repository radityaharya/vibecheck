import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Room = {
  name: string;
  slug: string;
};

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

  // TODO: change to req.body

  const { slug, name } = req.query;

  const data: Room = {
    name: name as string,
    slug: slug as string,
  };

  if (!data) {
    return res.status(400).json({ error: "Required params: name, slug" });
  }

  const room = await prisma.room.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (room) {
    return res.status(400).json({ error: "slug already exists" });
  }

  //   model Room {
  //   id           Int      @id @default(autoincrement())
  //   createdAt    DateTime @default(now())
  //   roomMaster   User     @relation("RoomMaster", fields: [roomMasterId], references: [id])
  //   roomMasterId String
  //   name         String
  //   slug         String   @unique
  //   participants User[]   @relation("RoomParticipants")
  //   queue        Queue[]
  // }
  const newRoom = await prisma.room
    .create({
      data: {
        name: data.name,
        slug: data.slug,
        roomMasterId: userId,
      },
    })
    .catch((err) => {
      return res.status(500).json({
        error: err as string,
      });
    });

  // register a new room

  // check if room already exists
  return res.status(200).json({ room: newRoom });
}
