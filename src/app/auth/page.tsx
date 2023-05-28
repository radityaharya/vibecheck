"use client";
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Page from "src/layouts/Page";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { NextPage } from "next";

const AuthPage: NextPage = () => {

  const window = globalThis.window;

  return (
    <Page>
      <div className="flex h-full flex-col items-start gap-5 bg-[#09080f]/80 px-5">
        <div className="flex h-full w-full flex-col items-center justify-center overflow-auto">
          <div className="flex flex-col items-center justify-center rounded-lg p-10">
            <Auth
              supabaseClient={createClientComponentClient()}
              theme="light"
              appearance={{
                theme: ThemeSupa,
                extend: true,
                className: {
                  container:
                    "flex flex-col items-center justify-center rounded-lg",
                  message: "text-white",
                },
                style: {
                  button: {
                    backgroundColor: "#fff",
                    color: "#000",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    fontSize: "1rem",
                    outline: "none",
                    border: "none",
                    fontWeight: "500",
                  },
                  container: {
                    width: "300px",
                  },
                  input: {
                    width: "300px",
                    backgroundColor: "#fff",
                    color: "#000",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    fontWeight: "500",
                  },
                  label: {
                    fontWeight: "500",
                    color: "#fff",
                  },
                },
              }}
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              redirectTo={`${window.location.origin}/auth/callback`}
              providers={["spotify"]}
              providerScopes={{
                spotify:
                  "playlist-read-collaborative playlist-modify-private user-follow-modify user-library-modify user-read-private app-remote-control user-top-read user-read-recently-played user-read-email user-library-read user-follow-read user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-modify-public user-read-playback-position",
              }}
              magicLink={true}
              view="magic_link"
              showLinks={false}
            />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default AuthPage;
