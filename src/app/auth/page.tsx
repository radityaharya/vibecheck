/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Page from "src/layouts/Page";
import Image from "next/image";

export default function Login() {
  const supabase = createClientComponentClient();

  const handleSignUp = async () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      (process.env.NEXT_PUBLIC_DEV_URL as string);

    await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        scopes:
          "playlist-read-collaborative playlist-modify-private user-follow-modify user-library-modify user-read-private app-remote-control user-top-read user-read-recently-played user-read-email user-library-read user-follow-read user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-modify-public user-read-playback-position streaming",
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });
  };

  return (
    <Page>
      <div className="flex h-screen flex-col items-start gap-5 bg-[#09080f]/80 px-5">
        <div className="flex h-screen w-full flex-col items-center justify-center overflow-auto">
          <button
            className="flex items-center justify-center gap-5 rounded-2xl bg-transparent bg-white px-4 py-3 text-black"
            onClick={handleSignUp}
          >
            <Image
              src="https://iwhksjsfesopygewmtaw.supabase.co/storage/v1/object/public/public/spotify.svg"
              width={24}
              height={24}
              alt="Spotify"
            />
            <span className="font-medium">Login with Spotify</span>
          </button>
        </div>
      </div>
    </Page>
  );
}
