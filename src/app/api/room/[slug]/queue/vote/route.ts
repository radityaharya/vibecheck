import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "~/lib/prisma/client";
import { log } from "next-axiom";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
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

  const room = await prisma.room.findUnique({
    where: {
      slug: slug,
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const { queueItemId, voteType } = (await request.json()) as {
    queueItemId: string;
    voteType: "upvote" | "downvote";
  };

  let data;
  try {
    if (voteType === "upvote") {
      data = await prisma.upvote.create({
        data: {
          queueItemId: queueItemId,
          createdById: userId,
        },
      });
    } else if (voteType === "downvote") {
      data = await prisma.downvote.create({
        data: {
          queueItemId: queueItemId,
          createdById: userId,
        },
      });
    }
  } catch (e) {
    log.error("Failed registering vote", e as Error);
    return NextResponse.json(
      { error: "Failed registering vote" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
