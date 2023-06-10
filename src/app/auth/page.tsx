/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Page from "src/layouts/Page";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        scopes:
          "playlist-read-collaborative playlist-modify-private user-follow-modify user-library-modify user-read-private app-remote-control user-top-read user-read-recently-played user-read-email user-library-read user-follow-read user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-modify-public user-read-playback-position",
        redirectTo: "https://dev.radityaharya.com/auth/callback",
      },
    });
    // const oAuthToken = data.session.provider_token // use to access provider API

    router.refresh();
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password,
    });
    router.refresh();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <Page>
      <div className="flex h-screen flex-col items-start gap-5 bg-[#09080f]/80 px-5">
        <div className="flex w-full h-screen flex-col items-center justify-center overflow-auto">
          <button
            className="flex items-center justify-center gap-5 rounded-2xl bg-transparent bg-white px-4 py-3 text-black"
            onClick={handleSignUp}
          >
            {/* https://iwhksjsfesopygewmtaw.supabase.co/storage/v1/object/public/public/spotify.svg */}
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
