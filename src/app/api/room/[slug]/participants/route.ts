import { prisma } from "~/lib/prisma/client";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
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
  const roomId = slug;

  const participants = await prisma.room.findFirstOrThrow({
    where: {
      slug: roomId,
    },
  }).participants()
  
  return NextResponse.json({
    participants
  })
}